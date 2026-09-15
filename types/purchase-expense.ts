export const PURCHASE_EXPENSE_STATUSES = [
  "approved",
  "draft",
  "for-approval",
  "cancelled",
] as const

export type PurchaseExpenseStatus = (typeof PURCHASE_EXPENSE_STATUSES)[number]

export const purchaseExpenseStatusLabels: Record<PurchaseExpenseStatus, string> = {
  approved: "Approved",
  draft: "Draft",
  "for-approval": "For Approval",
  cancelled: "Cancelled",
}

export const purchaseExpenseStatusBadgeClassName: Record<
  PurchaseExpenseStatus,
  string
> = {
  approved: "border-transparent bg-success/15 text-success",
  draft: "border-transparent bg-warning/15 text-warning-foreground dark:text-warning",
  "for-approval": "border-transparent bg-info/15 text-info",
  cancelled: "border-transparent bg-destructive/15 text-destructive",
}

export const PURCHASE_EXPENSE_PAYMENT_STATUSES = [
  "paid",
  "unpaid",
  "partially-paid",
] as const

export type PurchaseExpensePaymentStatus =
  (typeof PURCHASE_EXPENSE_PAYMENT_STATUSES)[number]

export const purchaseExpensePaymentStatusLabels: Record<
  PurchaseExpensePaymentStatus,
  string
> = {
  paid: "Paid",
  unpaid: "Unpaid",
  "partially-paid": "Partially Paid",
}

export const PURCHASE_EXPENSE_MODES = ["with-bill", "without-bill"] as const

export type PurchaseExpenseMode = (typeof PURCHASE_EXPENSE_MODES)[number]

export const purchaseExpenseModeLabels: Record<PurchaseExpenseMode, string> = {
  "with-bill": "With Bill",
  "without-bill": "Without Bill",
}

export const PURCHASE_EXPENSE_VAT_OPTIONS = ["no-vat", "vat"] as const

export type PurchaseExpenseVatOption =
  (typeof PURCHASE_EXPENSE_VAT_OPTIONS)[number]

export const purchaseExpenseVatLabels: Record<PurchaseExpenseVatOption, string> = {
  "no-vat": "No VAT",
  vat: "VAT (13%)",
}

export const PURCHASE_EXPENSE_VAT_RATE = 0.13

export type PurchaseExpenseItem = {
  id: string
  accountId: string
  account: string
  vat: PurchaseExpenseVatOption
  amount: number
  description: string
}

export type PurchaseExpense = {
  id: string
  mode: PurchaseExpenseMode
  supplierId: string
  supplier: string
  invoiceNumber: string
  entryDate: string
  invoiceDate: string
  paymentPeriodId: string
  paymentPeriod: string
  paidFromId: string
  paidFrom: string
  status: PurchaseExpenseStatus
  paymentStatus: PurchaseExpensePaymentStatus
  tds: boolean
  quickPayment: boolean
  remarks: string
  items: PurchaseExpenseItem[]
  subTotal: number
  taxableTotal: number
  nonTaxableTotal: number
  vatAmount: number
  grandTotal: number
}
