import { mockCustomers } from "@/lib/mock/customers"
import { mockSalesOrders } from "@/lib/mock/sales-orders"
import {
  isWithinPurchasePeriod,
  resolvePurchasePeriod,
} from "@/lib/reports/purchase-date-range"
import type { ReportAsOfPreset } from "@/types/report"

export type SalesBookRow = {
  id: string
  entryDate: string
  buyerName: string
  buyerPan: string
  totalSales: number
  nonTaxableSales: number
  discount: number
  taxableSales: number
  vatAmount: number
  entryBy: string
}

export type SalesBookCustomerOption = { id: string; name: string }

export function getSalesBookCustomers(): SalesBookCustomerOption[] {
  return mockCustomers
    .filter((customer) => customer.status === "active")
    .map((customer) => ({ id: customer.id, name: customer.name }))
}

type SalesBookOptions = {
  preset: ReportAsOfPreset
  customDate?: string
  customerFilter: string | "all"
}

/**
 * Sales Book (VAT sales register): one row per booked (approved) sales
 * order, standing in for the finalized sales invoice concept this codebase
 * doesn't otherwise model separately from orders.
 */
export function getSalesBookReport({
  preset,
  customDate,
  customerFilter,
}: SalesBookOptions): SalesBookRow[] {
  const { start, cutoff } = resolvePurchasePeriod(preset, customDate)

  return mockSalesOrders
    .filter((order) => order.status === "approved")
    .filter((order) => isWithinPurchasePeriod(order.entryDate, start, cutoff))
    .filter(
      (order) => customerFilter === "all" || order.customerId === customerFilter
    )
    .map((order) => {
      const customer = mockCustomers.find((entry) => entry.id === order.customerId)

      return {
        id: order.id,
        entryDate: order.entryDate,
        buyerName: order.customer,
        buyerPan: customer?.panNumber ?? "-",
        totalSales: order.grandTotal,
        nonTaxableSales: order.nonTaxableTotal,
        discount: order.additionalDiscount,
        taxableSales: order.taxableTotal,
        vatAmount: order.vatAmount,
        entryBy: order.entryBy ?? "-",
      }
    })
}
