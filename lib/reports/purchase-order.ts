import { mockPurchaseOrders } from "@/lib/mock/purchase-orders"
import { mockSuppliers } from "@/lib/mock/suppliers"
import {
  isWithinPurchasePeriod,
  resolvePurchasePeriod,
} from "@/lib/reports/purchase-date-range"
import {
  purchaseOrderStatusBadgeClassName,
  purchaseOrderStatusLabels,
  type PurchaseOrderStatus,
} from "@/types/purchase-order"
import type { ReportAsOfPreset } from "@/types/report"

export type PurchaseOrderReportRow = {
  id: string
  entryDate: string
  supplier: string
  grandTotal: number
  status: PurchaseOrderStatus
  statusLabel: string
  statusBadgeClassName: string
  entryBy: string
}

export type PurchaseOrderSupplierOption = {
  id: string
  name: string
}

/** Suppliers available in the report's "Supplier" filter. */
export function getPurchaseOrderSuppliers(): PurchaseOrderSupplierOption[] {
  return mockSuppliers
    .filter((supplier) => supplier.status === "active")
    .map((supplier) => ({ id: supplier.id, name: supplier.name }))
}

type PurchaseOrderReportOptions = {
  preset: ReportAsOfPreset
  customDate?: string
  supplierFilter: string | "all"
  statusFilter: PurchaseOrderStatus | "all"
}

export function getPurchaseOrderReport({
  preset,
  customDate,
  supplierFilter,
  statusFilter,
}: PurchaseOrderReportOptions): PurchaseOrderReportRow[] {
  const { start, cutoff } = resolvePurchasePeriod(preset, customDate)

  return mockPurchaseOrders
    .filter((order) => isWithinPurchasePeriod(order.entryDate, start, cutoff))
    .filter(
      (order) => supplierFilter === "all" || order.supplierId === supplierFilter
    )
    .filter((order) => statusFilter === "all" || order.status === statusFilter)
    .map((order) => ({
      id: order.id,
      entryDate: order.entryDate,
      supplier: order.supplier,
      grandTotal: order.grandTotal,
      status: order.status,
      statusLabel: purchaseOrderStatusLabels[order.status],
      statusBadgeClassName: purchaseOrderStatusBadgeClassName[order.status],
      entryBy: order.entryBy ?? "-",
    }))
}
