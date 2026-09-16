import { mockCustomers } from "@/lib/mock/customers"
import { mockSalesReturns } from "@/lib/mock/sales-returns"
import {
  isWithinPurchasePeriod,
  resolvePurchasePeriod,
} from "@/lib/reports/purchase-date-range"
import { SALES_ORDER_VAT_RATE } from "@/types/sales-order"
import {
  salesReturnStatusBadgeClassName,
  salesReturnStatusLabels,
  type SalesReturnStatus,
} from "@/types/sales-return"
import type { ReportAsOfPreset } from "@/types/report"

export type SalesReturnRow = {
  id: string
  entryDate: string
  customerName: string
  panNumber: string
  refInvoice: string
  totalAmount: number
  nonTaxableAmount: number
  taxableAmount: number
  vatAmount: number
  status: SalesReturnStatus
  statusLabel: string
  statusBadgeClassName: string
  entryBy: string
}

export type SalesReturnCustomerOption = { id: string; name: string }

export function getSalesReturnCustomers(): SalesReturnCustomerOption[] {
  return mockCustomers
    .filter((customer) => customer.status === "active")
    .map((customer) => ({ id: customer.id, name: customer.name }))
}

type SalesReturnOptions = {
  preset: ReportAsOfPreset
  customDate?: string
  customerFilter: string | "all"
  statusFilter: SalesReturnStatus | "all"
}

export function getSalesReturnReport({
  preset,
  customDate,
  customerFilter,
  statusFilter,
}: SalesReturnOptions): SalesReturnRow[] {
  const { start, cutoff } = resolvePurchasePeriod(preset, customDate)

  return mockSalesReturns
    .filter((entry) => isWithinPurchasePeriod(entry.entryDate, start, cutoff))
    .filter(
      (entry) => customerFilter === "all" || entry.customerId === customerFilter
    )
    .filter((entry) => statusFilter === "all" || entry.status === statusFilter)
    .map((entry) => {
      const customer = mockCustomers.find((c) => c.id === entry.customerId)
      const vatAmount =
        entry.totalAmount - entry.totalAmount / (1 + SALES_ORDER_VAT_RATE)
      const taxableAmount = entry.totalAmount - vatAmount

      return {
        id: entry.id,
        entryDate: entry.entryDate,
        customerName: entry.customer,
        panNumber: customer?.panNumber ?? "-",
        refInvoice: entry.refInvoice,
        totalAmount: entry.totalAmount,
        nonTaxableAmount: 0,
        taxableAmount,
        vatAmount,
        status: entry.status,
        statusLabel: salesReturnStatusLabels[entry.status],
        statusBadgeClassName: salesReturnStatusBadgeClassName[entry.status],
        entryBy: entry.entryBy ?? "-",
      }
    })
}
