import { mockPurchaseOrders } from "@/lib/mock/purchase-orders"
import { getProductById } from "@/lib/mock/products"
import {
  isWithinPurchasePeriod,
  resolvePurchasePeriod,
} from "@/lib/reports/purchase-date-range"
import { PURCHASE_ORDER_VAT_RATE } from "@/types/purchase-order"
import type { ReportAsOfPreset } from "@/types/report"

export type PurchaseByItemSummaryRow = {
  productId: string
  productName: string
  category: string
  quantity: number
  amount: number
  discount: number
  netPurchase: number
  vat: number
  totalAmount: number
}

type PurchaseByItemSummaryOptions = {
  preset: ReportAsOfPreset
  customDate?: string
  productIds: string[] | "all"
}

export function getPurchaseByItemSummaryReport({
  preset,
  customDate,
  productIds,
}: PurchaseByItemSummaryOptions): PurchaseByItemSummaryRow[] {
  const { start, cutoff } = resolvePurchasePeriod(preset, customDate)
  const wanted = productIds === "all" ? null : new Set(productIds)

  const rows = new Map<
    string,
    PurchaseByItemSummaryRow & { category: string }
  >()

  for (const order of mockPurchaseOrders) {
    if (!isWithinPurchasePeriod(order.entryDate, start, cutoff)) continue

    for (const item of order.items) {
      if (wanted && !wanted.has(item.productId)) continue

      const gross = item.quantity * item.rate
      const discount = gross - item.amount
      const netPurchase = item.amount
      const vat = item.vat === "vat" ? netPurchase * PURCHASE_ORDER_VAT_RATE : 0

      const existing = rows.get(item.productId)
      if (existing) {
        existing.quantity += item.quantity
        existing.amount += gross
        existing.discount += discount
        existing.netPurchase += netPurchase
        existing.vat += vat
        existing.totalAmount += netPurchase + vat
      } else {
        rows.set(item.productId, {
          productId: item.productId,
          productName: item.name,
          category: getProductById(item.productId)?.category ?? "-",
          quantity: item.quantity,
          amount: gross,
          discount,
          netPurchase,
          vat,
          totalAmount: netPurchase + vat,
        })
      }
    }
  }

  return Array.from(rows.values())
}
