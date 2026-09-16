export const DELIVERY_NOTE_STATUSES = [
  "approved",
  "draft",
  "for-approval",
  "cancelled",
] as const

export type DeliveryNoteStatus = (typeof DELIVERY_NOTE_STATUSES)[number]

export const deliveryNoteStatusLabels: Record<DeliveryNoteStatus, string> = {
  approved: "Approved",
  draft: "Draft",
  "for-approval": "For Approval",
  cancelled: "Cancelled",
}

export const deliveryNoteStatusBadgeClassName: Record<
  DeliveryNoteStatus,
  string
> = {
  approved: "border-transparent bg-success/15 text-success",
  draft: "border-transparent bg-warning/15 text-warning-foreground dark:text-warning",
  "for-approval": "border-transparent bg-info/15 text-info",
  cancelled: "border-transparent bg-destructive/15 text-destructive",
}

export const DELIVERY_NOTE_INVOICE_STATUSES = ["invoiced", "not-invoiced"] as const

export type DeliveryNoteInvoiceStatus =
  (typeof DELIVERY_NOTE_INVOICE_STATUSES)[number]

export const deliveryNoteInvoiceStatusLabels: Record<
  DeliveryNoteInvoiceStatus,
  string
> = {
  invoiced: "Invoiced",
  "not-invoiced": "Not Invoiced",
}

export type DeliveryNote = {
  id: string
  customerId: string
  customer: string
  entryDate: string
  totalAmount: number
  invoiceStatus: DeliveryNoteInvoiceStatus
  status: DeliveryNoteStatus
  entryBy?: string
}
