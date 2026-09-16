export type PurchaseReturnStatus =
  | "approved"
  | "draft"
  | "for-approval"
  | "void"

export type PurchaseReturn = {
  id: string
  entryDate: string
  supplier: string
  refInvoice: string
  totalAmount: number
  status: PurchaseReturnStatus
  entryBy?: string
}

export const purchaseReturnStatusLabels: Record<PurchaseReturnStatus, string> = {
  approved: "Approved",
  draft: "Draft",
  "for-approval": "For Approval",
  void: "Void",
}
