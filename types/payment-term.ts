export const PAYMENT_TERM_STATUSES = ["active", "inactive"] as const

export type PaymentTermStatus = (typeof PAYMENT_TERM_STATUSES)[number]

export type PaymentTerm = {
  id: string
  name: string
  days: number
  description: string
  status: PaymentTermStatus
}

export const paymentTermStatusLabels: Record<PaymentTermStatus, string> = {
  active: "Active",
  inactive: "Inactive",
}
