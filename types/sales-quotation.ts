export const SALES_QUOTATION_STATUSES = [
  "approved",
  "draft",
  "for-approval",
  "cancelled",
] as const

export type SalesQuotationStatus = (typeof SALES_QUOTATION_STATUSES)[number]

export const salesQuotationStatusLabels: Record<SalesQuotationStatus, string> = {
  approved: "Approved",
  draft: "Draft",
  "for-approval": "For Approval",
  cancelled: "Cancelled",
}

export const salesQuotationStatusBadgeClassName: Record<
  SalesQuotationStatus,
  string
> = {
  approved: "border-transparent bg-success/15 text-success",
  draft: "border-transparent bg-warning/15 text-warning-foreground dark:text-warning",
  "for-approval": "border-transparent bg-info/15 text-info",
  cancelled: "border-transparent bg-destructive/15 text-destructive",
}

export type SalesQuotationItem = {
  id: string
  productId: string
  name: string
  unit: string
  quantity: number
  rate: number
  amount: number
}

export type SalesQuotation = {
  id: string
  customerId: string
  customer: string
  entryDate: string
  dueDate: string
  status: SalesQuotationStatus
  remarks: string
  entryBy?: string
  items: SalesQuotationItem[]
  totalAmount: number
}
