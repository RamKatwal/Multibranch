import { mockPurchaseReturns } from "@/lib/mock/purchase-returns"
import { mockSuppliers } from "@/lib/mock/suppliers"
import {
  isWithinPurchasePeriod,
  resolvePurchasePeriod,
} from "@/lib/reports/purchase-date-range"
import { PURCHASE_ORDER_VAT_RATE } from "@/types/purchase-order"
import {
  purchaseReturnStatusLabels,
  type PurchaseReturnStatus,
} from "@/types/purchase-return"
import type { ReportAsOfPreset } from "@/types/report"

export const purchaseReturnStatusBadgeClassName: Record<
  PurchaseReturnStatus,
  string
> = {
  approved: "border-transparent bg-success/15 text-success",
  draft: "border-transparent bg-warning/15 text-warning-foreground dark:text-warning",
  "for-approval": "border-transparent bg-info/15 text-info",
  void: "border-transparent bg-destructive/15 text-destructive",
}

export type PurchaseReturnRow = {
  id: string
  entryDate: string
  supplierName: string
  /** Return-supplier names don't join to the supplier directory; "-" when no match. */
  supplierPan: string
  description: string
  refInvoice: string
  totalAmount: number
  nonTaxableAmount: number
  taxableAmount: number
  vatAmount: number
  status: PurchaseReturnStatus
  statusLabel: string
  statusBadgeClassName: string
  entryBy: string
}

export type PurchaseReturnSupplierOption = {
  id: string
  name: string
}

/** Distinct supplier names available in the report's "Supplier" filter. */
export function getPurchaseReturnSuppliers(): PurchaseReturnSupplierOption[] {
  const names = Array.from(
    new Set(mockPurchaseReturns.map((entry) => entry.supplier))
  )
  return names.map((name) => ({ id: name, name }))
}

type PurchaseReturnOptions = {
  preset: ReportAsOfPreset
  customDate?: string
  supplierFilter: string | "all"
  statusFilter: PurchaseReturnStatus | "all"
}

export function getPurchaseReturnReport({
  preset,
  customDate,
  supplierFilter,
  statusFilter,
}: PurchaseReturnOptions): PurchaseReturnRow[] {
  const { start, cutoff } = resolvePurchasePeriod(preset, customDate)

  return mockPurchaseReturns
    .filter((entry) => isWithinPurchasePeriod(entry.entryDate, start, cutoff))
    .filter(
      (entry) => supplierFilter === "all" || entry.supplier === supplierFilter
    )
    .filter((entry) => statusFilter === "all" || entry.status === statusFilter)
    .map((entry) => {
      const supplier = mockSuppliers.find((s) => s.name === entry.supplier)
      const vatAmount =
        entry.totalAmount - entry.totalAmount / (1 + PURCHASE_ORDER_VAT_RATE)
      const taxableAmount = entry.totalAmount - vatAmount

      return {
        id: entry.id,
        entryDate: entry.entryDate,
        supplierName: entry.supplier,
        supplierPan: supplier?.panNumber ?? "-",
        description: "-",
        refInvoice: entry.refInvoice,
        totalAmount: entry.totalAmount,
        nonTaxableAmount: 0,
        taxableAmount,
        vatAmount,
        status: entry.status,
        statusLabel: purchaseReturnStatusLabels[entry.status],
        statusBadgeClassName: purchaseReturnStatusBadgeClassName[entry.status],
        entryBy: entry.entryBy ?? "-",
      }
    })
}
