export const SALES_PAYMENT_STATUSES = [
  "approved",
  "draft",
  "for-approval",
  "void",
] as const

export type SalesPaymentStatus = (typeof SALES_PAYMENT_STATUSES)[number]

export const salesPaymentStatusLabels: Record<SalesPaymentStatus, string> = {
  approved: "Approved",
  draft: "Draft",
  "for-approval": "For Approval",
  void: "Void",
}

export const salesPaymentStatusBadgeClassName: Record<
  SalesPaymentStatus,
  string
> = {
  approved: "border-transparent bg-success/15 text-success",
  draft: "border-transparent bg-warning/15 text-warning-foreground dark:text-warning",
  "for-approval": "border-transparent bg-info/15 text-info",
  void: "border-transparent bg-destructive/15 text-destructive",
}

export const SALES_PAYMENT_MODES = [
  "cash",
  "bank",
  "cheque",
  "card",
] as const

export type SalesPaymentMode = (typeof SALES_PAYMENT_MODES)[number]

export const salesPaymentModeLabels: Record<SalesPaymentMode, string> = {
  cash: "Cash",
  bank: "Bank Transfer",
  cheque: "Cheque",
  card: "Card",
}

export type SalesPayment = {
  id: string
  entryDate: string
  customerId: string
  customer: string
  /** Optional invoice / bill this receipt settles. */
  refInvoice: string
  amount: number
  mode: SalesPaymentMode
  status: SalesPaymentStatus
  remarks: string
  entryBy?: string
}
