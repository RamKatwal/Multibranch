import { mockDeliveryNoteReturns } from "@/lib/mock/delivery-note-returns"
import { mockCustomers } from "@/lib/mock/customers"
import {
  isWithinPurchasePeriod,
  resolvePurchasePeriod,
} from "@/lib/reports/purchase-date-range"
import {
  deliveryNoteReturnStatusBadgeClassName,
  deliveryNoteReturnStatusLabels,
  type DeliveryNoteReturnStatus,
} from "@/types/delivery-note-return"
import type { ReportAsOfPreset } from "@/types/report"

export type DeliveryNoteReturnReportRow = {
  id: string
  entryDate: string
  customer: string
  totalAmount: number
  deliveryNoteId: string
  status: DeliveryNoteReturnStatus
  statusLabel: string
  statusBadgeClassName: string
  entryBy: string
}

export type DeliveryNoteReturnCustomerOption = { id: string; name: string }

export function getDeliveryNoteReturnCustomers(): DeliveryNoteReturnCustomerOption[] {
  return mockCustomers
    .filter((customer) => customer.status === "active")
    .map((customer) => ({ id: customer.id, name: customer.name }))
}

type DeliveryNoteReturnReportOptions = {
  preset: ReportAsOfPreset
  customDate?: string
  customerFilter: string | "all"
  statusFilter: DeliveryNoteReturnStatus | "all"
}

export function getDeliveryNoteReturnReport({
  preset,
  customDate,
  customerFilter,
  statusFilter,
}: DeliveryNoteReturnReportOptions): DeliveryNoteReturnReportRow[] {
  const { start, cutoff } = resolvePurchasePeriod(preset, customDate)

  return mockDeliveryNoteReturns
    .filter((entry) => isWithinPurchasePeriod(entry.entryDate, start, cutoff))
    .filter(
      (entry) => customerFilter === "all" || entry.customerId === customerFilter
    )
    .filter((entry) => statusFilter === "all" || entry.status === statusFilter)
    .map((entry) => ({
      id: entry.id,
      entryDate: entry.entryDate,
      customer: entry.customer,
      totalAmount: entry.totalAmount,
      deliveryNoteId: entry.deliveryNoteId,
      status: entry.status,
      statusLabel: deliveryNoteReturnStatusLabels[entry.status],
      statusBadgeClassName: deliveryNoteReturnStatusBadgeClassName[entry.status],
      entryBy: entry.entryBy ?? "-",
    }))
}
