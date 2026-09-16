import { mockPurchaseOrders } from "@/lib/mock/purchase-orders"
import { mockSuppliers } from "@/lib/mock/suppliers"
import {
  isWithinPurchasePeriod,
  resolvePurchasePeriod,
} from "@/lib/reports/purchase-date-range"
import type { ReportAsOfPreset } from "@/types/report"

export type PurchaseBookRow = {
  id: string
  entryDate: string
  supplierName: string
  supplierPan: string
  invoiceDate: string
  totalAmount: number
  nonTaxableAmount: number
  taxableAmount: number
  vatAmount: number
  /** Import-purchase fields; blank for the domestic purchases modeled today. */
  type: string
  country: string
  declarationNo: string
  importDate: string
  entryBy: string
  remarks: string
}

export type PurchaseBookSupplierOption = {
  id: string
  name: string
}

/** Suppliers available in the report's "Supplier" filter. */
export function getPurchaseBookSuppliers(): PurchaseBookSupplierOption[] {
  return mockSuppliers
    .filter((supplier) => supplier.status === "active")
    .map((supplier) => ({ id: supplier.id, name: supplier.name }))
}

type PurchaseBookOptions = {
  preset: ReportAsOfPreset
  customDate?: string
  supplierFilter: string | "all"
}

/**
 * Purchase Book (VAT purchase register): one row per booked (approved)
 * purchase order, standing in for the finalized purchase invoice concept
 * this codebase doesn't otherwise model separately from orders.
 */
export function getPurchaseBookReport({
  preset,
  customDate,
  supplierFilter,
}: PurchaseBookOptions): PurchaseBookRow[] {
  const { start, cutoff } = resolvePurchasePeriod(preset, customDate)

  return mockPurchaseOrders
    .filter((order) => order.status === "approved")
    .filter((order) => isWithinPurchasePeriod(order.entryDate, start, cutoff))
    .filter(
      (order) => supplierFilter === "all" || order.supplierId === supplierFilter
    )
    .map((order) => {
      const supplier = mockSuppliers.find((entry) => entry.id === order.supplierId)

      return {
        id: order.id,
        entryDate: order.entryDate,
        supplierName: order.supplier,
        supplierPan: supplier?.panNumber ?? "-",
        invoiceDate: order.entryDate,
        totalAmount: order.grandTotal,
        nonTaxableAmount: order.nonTaxableTotal,
        taxableAmount: order.taxableTotal,
        vatAmount: order.vatAmount,
        type: "-",
        country: "-",
        declarationNo: "-",
        importDate: "-",
        entryBy: order.entryBy ?? "-",
        remarks: order.remarks || "-",
      }
    })
}
