import { mockStockTransfers } from "@/lib/mock/stock-transfers"
import type { StockTransfer } from "@/types/stock-transfer"

const STOCK_TRANSFERS_STORAGE_KEY = "ibmerp-stock-transfers"

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
  const custom = readCustomStockTransfers()
  const customIds = new Set(custom.map((item) => item.id))
  return [
    ...custom,
    ...mockStockTransfers.filter((item) => !customIds.has(item.id)),
  ]
}

export function getStockTransferById(id: string): StockTransfer | undefined {
  return getAllStockTransfers().find((item) => item.id === id)
}
