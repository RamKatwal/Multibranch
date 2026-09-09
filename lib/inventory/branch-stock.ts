import { isHeadOfficeBranch } from "@/lib/branches/head-office"
import { readBranches, resolveActiveBranch } from "@/lib/branches/storage"
import { getProductById, mockProducts } from "@/lib/mock/products"
import { getAllStockTransfers } from "@/lib/stock-transfer/storage"
import type { Branch } from "@/types/branch"
import type { StockTransfer } from "@/types/stock-transfer"

/**
 * Branch inventory is derived, not stored. A branch's on-hand quantity for a
 * product is a base value (the whole catalogue sits at Head Office, every other
 * branch starts at zero) plus the net effect of every stock transfer:
 *
 *   - `in-transit`  → the source branch has released the goods (−qty at source)
 *   - `completed`   → −qty at source, +qty at destination
 *   - `returned`    → net zero on both sides
 *   - `requested` / `approved` / `rejected` → no effect
 *
 * Because transfer status is persisted on the transfer record, moving a transfer
 * through the flow and re-reading recomputes every branch's stock automatically.
 */

export type BranchStockContext = {
  branch: Branch | null
  isHeadOffice: boolean
}

/** The branch the user is currently acting as, from the sidebar branch switcher. */
export function getActiveBranch(): Branch | null {
  return resolveActiveBranch(readBranches())
}

export function getActiveBranchContext(): BranchStockContext {
  const branch = getActiveBranch()
  return {
    branch,
    isHeadOffice: branch ? isHeadOfficeBranch(branch) : false,
  }
}

/** The permanent Head Office branch — the source of all stock transfers. */
export function getHeadOfficeBranch(): Branch | null {
  return readBranches().find((branch) => isHeadOfficeBranch(branch)) ?? null
}

export function isHeadOfficeBranchId(branchId: string): boolean {
  if (!branchId) return false
  if (branchId === "br-hq") return true
  const branch = readBranches().find((item) => item.id === branchId)
  return branch ? isHeadOfficeBranch(branch) : false
}

function transferDelta(
  transfer: StockTransfer,
  branchId: string,
  productId: string
): number {
  const quantity = transfer.items
    .filter((item) => item.productId === productId)
    .reduce((sum, item) => sum + item.quantity, 0)

  if (quantity === 0) return 0

  if (transfer.status === "in-transit") {
    return transfer.fromBranchId === branchId ? -quantity : 0
  }

  if (transfer.status === "completed") {
    let delta = 0
    if (transfer.fromBranchId === branchId) delta -= quantity
    if (transfer.toBranchId === branchId) delta += quantity
    return delta
  }

  return 0
}

function baseStock(branchId: string, productId: string): number {
  if (!isHeadOfficeBranchId(branchId)) return 0
  return getProductById(productId)?.totalQuantity ?? 0
}

/** On-hand quantity of a single product at a single branch. */
export function getBranchProductStock(
  branchId: string,
  productId: string
): number {
  const transfers = getAllStockTransfers()
  const delta = transfers.reduce(
    (sum, transfer) => sum + transferDelta(transfer, branchId, productId),
    0
  )
  return Math.max(0, baseStock(branchId, productId) + delta)
}

/** productId → on-hand quantity, for every catalogue product at one branch. */
export function getBranchStockMap(branchId: string): Record<string, number> {
  const transfers = getAllStockTransfers()
  const map: Record<string, number> = {}

  for (const product of mockProducts) {
    const delta = transfers.reduce(
      (sum, transfer) => sum + transferDelta(transfer, branchId, product.id),
      0
    )
    map[product.id] = Math.max(0, baseStock(branchId, product.id) + delta)
  }

  return map
}

/**
 * Guard run before Head Office approves or dispatches a request. Returns an
 * error message naming the first item that would go negative, or `null` when
 * the whole request can be fulfilled.
 */
export function assertHeadOfficeHasStock(
  transfer: StockTransfer
): string | null {
  for (const item of transfer.items) {
    const available = getBranchProductStock(transfer.fromBranchId, item.productId)
    if (item.quantity > available) {
      return `${transfer.fromBranch} only has ${available} unit${
        available === 1 ? "" : "s"
      } of "${item.name}" available (request is for ${item.quantity}).`
    }
  }
  return null
}

export type ProductBranchStock = {
  branchId: string
  branchName: string
  branchCode: string
  availableQuantity: number
  stockIn: number
  stockOut: number
  totalQuantity: number
}

/** Per-branch stock breakdown for a product, across every active branch. */
export function getProductBranchStock(productId: string): ProductBranchStock[] {
  const product = getProductById(productId)
  if (!product || product.type === "service") return []

  const branches = readBranches().filter((branch) => branch.status === "active")
  const transfers = getAllStockTransfers()

  return branches.map((branch) => {
    let stockIn = 0
    let stockOut = 0

    for (const transfer of transfers) {
      const delta = transferDelta(transfer, branch.id, productId)
      if (delta > 0) stockIn += delta
      else if (delta < 0) stockOut += -delta
    }

    const onHand = getBranchProductStock(branch.id, productId)

    return {
      branchId: branch.id,
      branchName: branch.name,
      branchCode: branch.code,
      availableQuantity: onHand,
      stockIn,
      stockOut,
      totalQuantity: onHand,
    }
  })
}
