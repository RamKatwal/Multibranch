import { mockSalesOrders } from "@/lib/mock/sales-orders"
import {
  FISCAL_MONTHS,
  FISCAL_QUARTERS,
  FISCAL_YEAR_OPTIONS,
} from "@/lib/reports/purchase-by-item-monthly"

export { FISCAL_MONTHS, FISCAL_QUARTERS, FISCAL_YEAR_OPTIONS }

export type SalesByItemMonthlyRow = {
  productId: string
  productName: string
  /** Net sales amount per fiscal month, Shrawan (index 0) through Ashad (index 11). */
  months: number[]
  quarterTotals: number[]
  totalAmount: number
}

/**
 * The mock sales orders are dated on the "2082/83" epoch (see
 * lib/reports/purchase-date-range.ts); a fiscal year other than that has no
 * bookings yet, so the report legitimately renders empty for it.
 */
export function getSalesByItemMonthlyReport(
  fiscalYear: string
): SalesByItemMonthlyRow[] {
  if (fiscalYear !== "2082/83") return []

  const rows = new Map<string, SalesByItemMonthlyRow>()

  for (const order of mockSalesOrders) {
    const month = Number(order.entryDate.slice(5, 7))
    const monthIndex = (((month - 1) % 12) + 12) % 12

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
