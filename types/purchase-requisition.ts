export const PURCHASE_REQUISITION_STATUSES = [
  "approved",
  "draft",
  "for-approval",
  "cancelled",
] as const

export type PurchaseRequisitionStatus =
  (typeof PURCHASE_REQUISITION_STATUSES)[number]

export const purchaseRequisitionStatusLabels: Record<
  PurchaseRequisitionStatus,
  string
> = {
  approved: "Approved",
  draft: "Draft",
  "for-approval": "For Approval",
  cancelled: "Cancelled",
}

export const purchaseRequisitionStatusBadgeClassName: Record<
  PurchaseRequisitionStatus,
  string
> = {
  approved: "border-transparent bg-success/15 text-success",
  draft: "border-transparent bg-warning/15 text-warning-foreground dark:text-warning",
  "for-approval": "border-transparent bg-info/15 text-info",
  cancelled: "border-transparent bg-destructive/15 text-destructive",
}

export type PurchaseRequisitionItem = {
  id: string
  productId: string
  name: string
  unit: string
  quantityInStock: number
  requestedQuantity: number
}

export type PurchaseRequisition = {
  id: string
  entryDate: string
  dueDate: string
  status: PurchaseRequisitionStatus
  remarks: string
  entryBy?: string
  items: PurchaseRequisitionItem[]
}
