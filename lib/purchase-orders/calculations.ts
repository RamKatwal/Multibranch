import {
  PURCHASE_ORDER_VAT_RATE,
  type PurchaseOrderItem,
} from "@/types/purchase-order"

export function calculateItemAmount(
  item: Pick<PurchaseOrderItem, "quantity" | "rate" | "discountPercent">
) {
  const gross = item.quantity * item.rate
  const discount = gross * (item.discountPercent / 100)
  return Math.max(gross - discount, 0)
}

export function calculatePurchaseOrderTotals(
  items: PurchaseOrderItem[],
  additionalDiscount: number
) {
  const subTotal = items.reduce((sum, item) => sum + item.amount, 0)
  const taxableTotal = items
    .filter((item) => item.vat === "vat")
    .reduce((sum, item) => sum + item.amount, 0)
  const nonTaxableTotal = subTotal - taxableTotal
  const vatAmount = taxableTotal * PURCHASE_ORDER_VAT_RATE
  const grandTotal = Math.max(subTotal - additionalDiscount + vatAmount, 0)

  return { subTotal, taxableTotal, nonTaxableTotal, vatAmount, grandTotal }
}
