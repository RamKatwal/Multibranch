import { mockStockAdjustments } from "@/lib/mock/stock-adjustments"
import type { StockAdjustment } from "@/types/stock-adjustment"

const STOCK_ADJUSTMENTS_STORAGE_KEY = "ibmerp-stock-adjustments-v1"

export function readStockAdjustments(): StockAdjustment[] {
  try {
    const saved = window.localStorage.getItem(STOCK_ADJUSTMENTS_STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved) as StockAdjustment[]
    }
  } catch {
    // Fall back to mock seed data.
  }

  return mockStockAdjustments.map((adjustment) => ({
    ...adjustment,
    items: adjustment.items.map((item) => ({ ...item })),
  }))
}

export function saveStockAdjustments(adjustments: StockAdjustment[]) {
  window.localStorage.setItem(
    STOCK_ADJUSTMENTS_STORAGE_KEY,
    JSON.stringify(adjustments)
  )
  return adjustments
}

export function upsertStockAdjustment(adjustment: StockAdjustment) {
  const current = readStockAdjustments()
  const index = current.findIndex((item) => item.id === adjustment.id)
  const next =
    index >= 0
      ? current.map((item, i) => (i === index ? adjustment : item))
      : [adjustment, ...current]
  return saveStockAdjustments(next)
}

export function createStockAdjustmentId(adjustments: StockAdjustment[]) {
  const fiscalYear = "2083/84"
  const max = adjustments.reduce((highest, adjustment) => {
    const match = new RegExp(`^STA(\\d+)-${fiscalYear.replace("/", "\\/")}$`).exec(
      adjustment.id
    )
    if (!match) return highest
    return Math.max(highest, Number(match[1]))
  }, 0)

  return `STA${max + 1}-${fiscalYear}`
}

export function createStockAdjustmentItemId(index: number) {
  return `SAI-${Date.now().toString().slice(-5)}-${index + 1}`
}
