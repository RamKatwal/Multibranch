import { mockDeliveryNotes } from "@/lib/mock/delivery-notes"
import { mockCustomers } from "@/lib/mock/customers"
import {
  isWithinPurchasePeriod,
  resolvePurchasePeriod,
} from "@/lib/reports/purchase-date-range"
import {
  deliveryNoteInvoiceStatusLabels,
  deliveryNoteStatusBadgeClassName,
  deliveryNoteStatusLabels,
  type DeliveryNoteStatus,
} from "@/types/delivery-note"
import type { ReportAsOfPreset } from "@/types/report"

export type DeliveryNoteReportRow = {
  id: string
  entryDate: string
  customer: string
  totalAmount: number
  invoiceStatusLabel: string
  status: DeliveryNoteStatus
  statusLabel: string
  statusBadgeClassName: string
  entryBy: string
}

export type DeliveryNoteCustomerOption = { id: string; name: string }

export function getDeliveryNoteCustomers(): DeliveryNoteCustomerOption[] {
  return mockCustomers
    .filter((customer) => customer.status === "active")
    .map((customer) => ({ id: customer.id, name: customer.name }))
}

type DeliveryNoteReportOptions = {
  preset: ReportAsOfPreset
  customDate?: string
  customerFilter: string | "all"
  statusFilter: DeliveryNoteStatus | "all"
}

export function getDeliveryNoteReport({
  preset,
  customDate,
  customerFilter,
  statusFilter,
}: DeliveryNoteReportOptions): DeliveryNoteReportRow[] {
  const { start, cutoff } = resolvePurchasePeriod(preset, customDate)

  return mockDeliveryNotes
    .filter((note) => isWithinPurchasePeriod(note.entryDate, start, cutoff))
    .filter(
      (note) => customerFilter === "all" || note.customerId === customerFilter
    )
    .filter((note) => statusFilter === "all" || note.status === statusFilter)
    .map((note) => ({
      id: note.id,
      entryDate: note.entryDate,
      customer: note.customer,
      totalAmount: note.totalAmount,
      invoiceStatusLabel: deliveryNoteInvoiceStatusLabels[note.invoiceStatus],
      status: note.status,
      statusLabel: deliveryNoteStatusLabels[note.status],
      statusBadgeClassName: deliveryNoteStatusBadgeClassName[note.status],
      entryBy: note.entryBy ?? "-",
    }))
}
