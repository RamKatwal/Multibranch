import { mockCustomers } from "@/lib/mock/customers"
import { mockSalesOrders } from "@/lib/mock/sales-orders"
import {
  isWithinPurchasePeriod,
  resolvePurchasePeriod,
} from "@/lib/reports/purchase-date-range"
import {
  salesOrderStatusBadgeClassName,
  salesOrderStatusLabels,
  type SalesOrderStatus,
} from "@/types/sales-order"
import type { ReportAsOfPreset } from "@/types/report"

export type SalesOrderReportRow = {
  id: string
  entryDate: string
  customer: string
  grandTotal: number
  status: SalesOrderStatus
  statusLabel: string
  statusBadgeClassName: string
  entryBy: string
}

export type SalesOrderCustomerOption = { id: string; name: string }

/** Customers available in the report's "Customer" filter. */
export function getSalesOrderCustomers(): SalesOrderCustomerOption[] {
  return mockCustomers
    .filter((customer) => customer.status === "active")
    .map((customer) => ({ id: customer.id, name: customer.name }))
}

type SalesOrderReportOptions = {
  preset: ReportAsOfPreset
  customDate?: string
  customerFilter: string | "all"
  statusFilter: SalesOrderStatus | "all"
}

export function getSalesOrderReport({
  preset,
  customDate,
  customerFilter,
  statusFilter,
}: SalesOrderReportOptions): SalesOrderReportRow[] {
  const { start, cutoff } = resolvePurchasePeriod(preset, customDate)

  return mockSalesOrders
    .filter((order) => isWithinPurchasePeriod(order.entryDate, start, cutoff))
    .filter(
      (order) => customerFilter === "all" || order.customerId === customerFilter
    )
    .filter((order) => statusFilter === "all" || order.status === statusFilter)
    .map((order) => ({
      id: order.id,
      entryDate: order.entryDate,
      customer: order.customer,
      grandTotal: order.grandTotal,
      status: order.status,
      statusLabel: salesOrderStatusLabels[order.status],
      statusBadgeClassName: salesOrderStatusBadgeClassName[order.status],
      entryBy: order.entryBy ?? "-",
    }))
}
