import { mockPurchaseOrders } from "@/lib/mock/purchase-orders"

/** Nepali fiscal-year month order: Shrawan (month 1) through Ashad (month 12). */
export const FISCAL_MONTHS = [
  "Shrawan",
  "Bhadra",
  "Asoj",
  "Kartik",
  "Mangsir",
  "Poush",
  "Magh",
  "Falgun",
  "Chaitra",
  "Baishakh",
  "Jestha",
  "Ashad",
] as const

export const FISCAL_QUARTERS: { label: string; monthIndexes: number[] }[] = [
  { label: "1st Quarter", monthIndexes: [0, 1, 2] },
  { label: "2nd Quarter", monthIndexes: [3, 4, 5] },
  { label: "3rd Quarter", monthIndexes: [6, 7, 8] },
  { label: "4th Quarter", monthIndexes: [9, 10, 11] },
]

export const FISCAL_YEAR_OPTIONS = ["2082/83", "2083/84"] as const

export type PurchaseByItemMonthlyRow = {
  productId: string
  productName: string
  /** Net purchase amount per fiscal month, Shrawan (index 0) through Ashad (index 11). */
  months: number[]
  quarterTotals: number[]
  totalAmount: number
}

/**
 * The mock purchase orders are dated on the "2082/83" epoch (see
 * lib/reports/purchase-date-range.ts); a fiscal year other than that has no
 * bookings yet, so the report legitimately renders empty for it.
 */
export function getPurchaseByItemMonthlyReport(
  fiscalYear: string
): PurchaseByItemMonthlyRow[] {
  if (fiscalYear !== "2082/83") return []

  const rows = new Map<string, PurchaseByItemMonthlyRow>()

  for (const order of mockPurchaseOrders) {
    const month = Number(order.entryDate.slice(5, 7))
    const monthIndex = ((month - 1) % 12 + 12) % 12

    for (const item of order.items) {
      let row = rows.get(item.productId)
      if (!row) {
        row = {
          productId: item.productId,
          productName: item.name,
          months: Array(12).fill(0),
          quarterTotals: Array(4).fill(0),
          totalAmount: 0,
        }
        rows.set(item.productId, row)
      }

      row.months[monthIndex] += item.amount
      row.totalAmount += item.amount
    }
  }

  for (const row of rows.values()) {
    FISCAL_QUARTERS.forEach((quarter, index) => {
      row.quarterTotals[index] = quarter.monthIndexes.reduce(
        (sum, monthIndex) => sum + row.months[monthIndex],
        0
      )
    })
  }

  return Array.from(rows.values())
}
