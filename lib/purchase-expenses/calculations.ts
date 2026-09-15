import {
  PURCHASE_EXPENSE_VAT_RATE,
  type PurchaseExpenseItem,
} from "@/types/purchase-expense"

export function calculatePurchaseExpenseTotals(items: PurchaseExpenseItem[]) {
  const subTotal = items.reduce((sum, item) => sum + item.amount, 0)
  const taxableTotal = items
    .filter((item) => item.vat === "vat")
    .reduce((sum, item) => sum + item.amount, 0)
  const nonTaxableTotal = subTotal - taxableTotal
  const vatAmount = taxableTotal * PURCHASE_EXPENSE_VAT_RATE
  const grandTotal = subTotal + vatAmount

  return { subTotal, taxableTotal, nonTaxableTotal, vatAmount, grandTotal }
}
