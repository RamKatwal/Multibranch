export type SalesReturnStatus = "approved" | "draft" | "for-approval" | "void"

export type SalesReturn = {
  id: string
  entryDate: string
  customerId: string
  customer: string
  refInvoice: string
  totalAmount: number
  status: SalesReturnStatus
  entryBy?: string
}

export const salesReturnStatusLabels: Record<SalesReturnStatus, string> = {
  approved: "Approved",
  draft: "Draft",
  "for-approval": "For Approval",
  void: "Void",
}

export const salesReturnStatusBadgeClassName: Record<SalesReturnStatus, string> = {
  approved: "border-transparent bg-success/15 text-success",
  draft: "border-transparent bg-warning/15 text-warning-foreground dark:text-warning",
  "for-approval": "border-transparent bg-info/15 text-info",
  void: "border-transparent bg-destructive/15 text-destructive",
}
