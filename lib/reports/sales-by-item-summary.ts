import { getProductById } from "@/lib/mock/products"
import { mockSalesOrders } from "@/lib/mock/sales-orders"
import {
  isWithinPurchasePeriod,
  resolvePurchasePeriod,
} from "@/lib/reports/purchase-date-range"
import { SALES_ORDER_VAT_RATE } from "@/types/sales-order"
import type { ReportAsOfPreset } from "@/types/report"

export type SalesByItemSummaryRow = {
  productId: string
  productName: string
  category: string
  quantity: number
  amount: number
  discount: number
  netSales: number
  vat: number
  totalAmount: number
}

type SalesByItemSummaryOptions = {
  preset: ReportAsOfPreset
  customDate?: string
  productIds: string[] | "all"
}

export function getSalesByItemSummaryReport({
  preset,
  customDate,
  productIds,
}: SalesByItemSummaryOptions): SalesByItemSummaryRow[] {
  const { start, cutoff } = resolvePurchasePeriod(preset, customDate)
  const wanted = productIds === "all" ? null : new Set(productIds)

  const rows = new Map<string, SalesByItemSummaryRow>()

  for (const order of mockSalesOrders) {
    if (!isWithinPurchasePeriod(order.entryDate, start, cutoff)) continue

    for (const item of order.items) {
      if (wanted && !wanted.has(item.productId)) continue

      const gross = item.quantity * item.rate
      const discount = gross - item.amount
      const netSales = item.amount
      const vat = item.vat === "vat" ? netSales * SALES_ORDER_VAT_RATE : 0

      const existing = rows.get(item.productId)
      if (existing) {
        existing.quantity += item.quantity
        existing.amount += gross
        existing.discount += discount
        existing.netSales += netSales
        existing.vat += vat
        existing.totalAmount += netSales + vat
      } else {
        rows.set(item.productId, {
          productId: item.productId,
          productName: item.name,
          category: getProductById(item.productId)?.category ?? "-",
          quantity: item.quantity,
          amount: gross,
          discount,
          netSales,
          vat,
          totalAmount: netSales + vat,
        })
      }
    }
  }

  return Array.from(rows.values())
}
