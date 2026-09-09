import { isHeadOfficeBranch } from "@/lib/branches/head-office"
import { readBranches } from "@/lib/branches/storage"
import { getProductDetailById, mockProducts } from "@/lib/mock/products"
import type {
  StockTransfer,
  StockTransferItem,
  StockTransferStatus,
} from "@/types/stock-transfer"

export type TransferableProduct = {
  id: string
  name: string
  category: string
  availableQuantity: number
  rate: number
  unit: string
}

/** Active goods products available for transfer line selection. */
export function getTransferableProducts(): TransferableProduct[] {
  return mockProducts
    .filter((product) => product.type === "goods" && product.status === "active")
    .map((product) => {
      const detail = getProductDetailById(product.id)
      return {
        id: product.id,
        name: product.name,
        category: product.category,
        availableQuantity: detail?.availableQuantity ?? product.totalQuantity,
        rate: detail?.costPrice ?? 0,
        unit: detail?.primaryUnit ?? "Unit",
      }
    })
}

type TransferBranch = { id: string; name: string }

/**
 * The current demo runs with a single Head Office and a single branch. Every
 * stock transfer is a request the branch raises against Head Office. The two
 * branches are resolved from the live branch list so the demo works whichever
 * company/branch set the user is signed into.
 */
export function getTransferBranchPair(): {
  headOffice: TransferBranch
  branch: TransferBranch
} {
  const active = readBranches().filter((b) => b.status === "active")
  const headOffice =
    active.find((b) => isHeadOfficeBranch(b)) ?? active[0] ?? null
  const branch =
    active.find((b) => !headOffice || b.id !== headOffice.id) ?? null

  return {
    headOffice: headOffice
      ? { id: headOffice.id, name: headOffice.name }
      : { id: "br-hq", name: "Head Office" },
    branch: branch
      ? { id: branch.id, name: branch.name }
      : { id: "br-ktm-hub", name: "Kathmandu Hub" },
  }
}

const statuses: StockTransferStatus[] = [
  "requested",
  "requested",
  "approved",
  "in-transit",
  "completed",
  "completed",
  "returned",
  "rejected",
]

const entryUsers = ["ram", "farah", "gopal", "laxman", "kabita"]

const remarksPool = [
  "Restocking retail floor",
  "Weekend demand top-up",
  "New display units required",
  "Counter stock running low",
  "Customer pre-orders pending",
  "",
]

function pad(value: number, length = 4) {
  return String(value).padStart(length, "0")
}

function dateForIndex(index: number) {
  const base = new Date(Date.UTC(2026, 0, 1))
  base.setUTCDate(base.getUTCDate() + index * 6)
  const year = base.getUTCFullYear()
  const month = String(base.getUTCMonth() + 1).padStart(2, "0")
  const day = String(base.getUTCDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function buildItems(index: number, products: TransferableProduct[]): StockTransferItem[] {
  if (products.length === 0) return []
  const count = (index % 3) + 1
  return Array.from({ length: count }, (_, itemIdx) => {
    const product = products[(index * 2 + itemIdx) % products.length]
    const quantity = ((index + itemIdx) % 4) + 1
    const rate = product.rate || 500 + (((index + itemIdx) * 375) % 45000)
    return {
      id: `ITM-${pad(index + 1)}-${itemIdx + 1}`,
      productId: product.id,
      name: product.name,
      quantity,
      rate,
      totalPrice: quantity * rate,
    }
  })
}

function buildMockStockTransfers(count: number): StockTransfer[] {
  const products = getTransferableProducts()
  const { headOffice, branch } = getTransferBranchPair()

  return Array.from({ length: count }, (_, index) => {
    const n = index + 1
    const items = buildItems(index, products)

    const status = statuses[index % statuses.length]

    return {
      id: `TRF-${pad(n)}-2082-83`,
      fromBranch: headOffice.name,
      fromBranchId: headOffice.id,
      toBranch: branch.name,
      toBranchId: branch.id,
      date: dateForIndex(index),
      remarks: remarksPool[index % remarksPool.length],
      rejectionReason:
        status === "rejected"
          ? "Insufficient Head Office stock for the requested quantities."
          : undefined,
      items,
      totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
      totalAmount: items.reduce((sum, item) => sum + item.totalPrice, 0),
      entryBy: entryUsers[index % entryUsers.length],
      status,
    }
  })
}

/** Rebuilt on each call so the branch pair reflects the current sign-in. */
export function getMockStockTransfers(): StockTransfer[] {
  return buildMockStockTransfers(12)
}
