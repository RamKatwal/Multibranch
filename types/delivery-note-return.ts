export const DELIVERY_NOTE_RETURN_STATUSES = [
  "approved",
  "draft",
  "for-approval",
  "cancelled",
] as const

export type DeliveryNoteReturnStatus =
  (typeof DELIVERY_NOTE_RETURN_STATUSES)[number]

export const deliveryNoteReturnStatusLabels: Record<
  DeliveryNoteReturnStatus,
  string
> = {
  approved: "Approved",
  draft: "Draft",
  "for-approval": "For Approval",
  cancelled: "Cancelled",
}

export const deliveryNoteReturnStatusBadgeClassName: Record<
  DeliveryNoteReturnStatus,
  string
> = {
  approved: "border-transparent bg-success/15 text-success",
  draft: "border-transparent bg-warning/15 text-warning-foreground dark:text-warning",
  "for-approval": "border-transparent bg-info/15 text-info",
  cancelled: "border-transparent bg-destructive/15 text-destructive",
}

export type DeliveryNoteReturn = {
  id: string
  customerId: string
  customer: string
  entryDate: string
  totalAmount: number
  /** ID of the delivery note this return is against. */
  deliveryNoteId: string
  status: DeliveryNoteReturnStatus
  entryBy?: string
}
