import { mockPurchaseOrders } from "@/lib/mock/purchase-orders"
import { mockSalesOrders } from "@/lib/mock/sales-orders"
import { FISCAL_MONTHS } from "@/lib/reports/purchase-by-item-monthly"

export { FISCAL_MONTHS }

export type VatSummaryRow = {
  label: string
  months: number[]
  total: number
}

function monthIndexFor(dateIso: string) {
  const month = Number(dateIso.slice(5, 7))
  return (((month - 1) % 12) + 12) % 12
}

/**
 * Simplified VAT summary (Taxable Sales / Sales VAT / Taxable Purchases /
 * Purchase VAT / Net VAT Payable per fiscal month) rather than the full
 * IRD-format Nepali-script return — this codebase doesn't model enough of
 * the legal form's line items (capital purchases, exempt goods, credit
 * carry-forward) to fill those out honestly.
 */
export function getVatSummaryReport(): VatSummaryRow[] {
  const taxableSales = Array(12).fill(0)
  const salesVat = Array(12).fill(0)
  const taxablePurchases = Array(12).fill(0)
  const purchaseVat = Array(12).fill(0)

  for (const order of mockSalesOrders) {
    if (order.status !== "approved") continue
    const index = monthIndexFor(order.entryDate)
    taxableSales[index] += order.taxableTotal
    salesVat[index] += order.vatAmount
  }

  for (const order of mockPurchaseOrders) {
    if (order.status !== "approved") continue
    const index = monthIndexFor(order.entryDate)
    taxablePurchases[index] += order.taxableTotal
    purchaseVat[index] += order.vatAmount
  }

  const netVat = salesVat.map((value, index) => value - purchaseVat[index])

  const sum = (values: number[]) => values.reduce((a, b) => a + b, 0)

  return [
    { label: "Taxable Sales", months: taxableSales, total: sum(taxableSales) },
    { label: "Sales VAT", months: salesVat, total: sum(salesVat) },
    {
      label: "Taxable Purchases",
      months: taxablePurchases,
      total: sum(taxablePurchases),
    },
    { label: "Purchase VAT", months: purchaseVat, total: sum(purchaseVat) },
    { label: "Net VAT Payable/(Credit)", months: netVat, total: sum(netVat) },
  ]
}
