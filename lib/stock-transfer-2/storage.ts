import { getMockStockTransfers2 } from "@/lib/mock/stock-transfers-2"
import {
  STOCK_TRANSFER_STATUSES,
  type StockTransfer,
} from "@/types/stock-transfer"

/** Drop records written under an older schema (no branch ids / retired status). */
function isCurrentSchema(transfer: StockTransfer): boolean {
  return (
    Boolean(transfer.fromBranchId) &&
    Boolean(transfer.toBranchId) &&
    STOCK_TRANSFER_STATUSES.includes(transfer.status)
  )
}

const STOCK_TRANSFERS_STORAGE_KEY = "ibmerp-stock-transfers-2"

function canUseStorage() {
  return typeof window !== "undefined"
}

export function readCustomStockTransfers(): StockTransfer[] {
  if (!canUseStorage()) return []
  try {
    const raw = window.localStorage.getItem(STOCK_TRANSFERS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as StockTransfer[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveCustomStockTransfers(transfers: StockTransfer[]) {
  if (!canUseStorage()) return
  window.localStorage.setItem(
    STOCK_TRANSFERS_STORAGE_KEY,
    JSON.stringify(transfers)
  )
}

export function upsertStockTransfer(transfer: StockTransfer) {
  const current = readCustomStockTransfers()
  const index = current.findIndex((item) => item.id === transfer.id)
  if (index >= 0) {
    const next = [...current]
    next[index] = transfer
    saveCustomStockTransfers(next)
    return
  }
  saveCustomStockTransfers([transfer, ...current])
}

/** Custom transfers override mock records with the same id. */
export function getAllStockTransfers(): StockTransfer[] {
  const custom = readCustomStockTransfers().filter(isCurrentSchema)
  const customIds = new Set(custom.map((item) => item.id))
  return [
    ...custom,
    ...getMockStockTransfers2().filter((item) => !customIds.has(item.id)),
  ]
}

export function getStockTransferById(id: string): StockTransfer | undefined {
  return getAllStockTransfers().find((item) => item.id === id)
}
