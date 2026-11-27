export const SUBSCRIPTION_STATUSES = [
  "active",
  "trialing",
  "pending",
  "past_due",
  "canceled",
] as const

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number]

export const BILLING_INTERVALS = ["month", "year"] as const

export type BillingInterval = (typeof BILLING_INTERVALS)[number]

export const INVOICE_STATUSES = ["Paid", "Open", "Past due", "Void"] as const

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number]

export const INVOICE_CHARGE_TYPES = [
  "plan",
  "branches",
  "users",
  "branches_and_users",
  "companies",
  "modules",
] as const

export type InvoiceChargeType = (typeof INVOICE_CHARGE_TYPES)[number]

export const invoiceChargeTypeLabels: Record<InvoiceChargeType, string> = {
  plan: "Plan",
  branches: "Branches",
  users: "User seats",
  branches_and_users: "Branches + users",
  companies: "Company slots",
  modules: "Modules",
}

export function invoiceBilledForLabel(invoice: {
  chargeType?: InvoiceChargeType
  planName: string
}): string {
  const chargeType = invoice.chargeType ?? "plan"
  if (chargeType === "plan") return invoice.planName
  if (chargeType === "branches") return `Branch add-on · ${invoice.planName}`
  if (chargeType === "users") return `User seats · ${invoice.planName}`
  if (chargeType === "companies") return `Company slots · ${invoice.planName}`
  if (chargeType === "modules") return `Modules · ${invoice.planName}`
  return `Branches + users · ${invoice.planName}`
}

export const SUBSCRIPTION_PAYMENT_PROVIDERS = ["esewa", "fonepay"] as const

export type SubscriptionPaymentProvider =
  (typeof SUBSCRIPTION_PAYMENT_PROVIDERS)[number]

export type SubscriptionAssignedBranch = {
  branchId: string
  branchName: string
  branchCode: string
  address?: string
  location?: string
  status: "Active" | "Inactive"
}

export type SubscriptionMember = {
  id: string
  name: string
  initials: string
}

export type SubscriptionPaymentMethod = {
  provider: SubscriptionPaymentProvider
  billingEmail: string
}

export type SubscriptionInvoice = {
  invoiceId: string
  invoiceNumber: string
  issueDate: string
  periodStart: string
  periodEnd: string
  amountPaid: number
  currency: string
  status: InvoiceStatus
  pdfDownloadUrl: string
  planName: string
  /** What this payment covers. Defaults to full plan when omitted. */
  chargeType?: InvoiceChargeType
  /** Extra user seats purchased on this invoice (add-on payments). */
  addedUsers?: number
  /** Extra branches purchased on this invoice (add-on payments). */
  addedBranches?: number
  /** Extra company slots purchased on this invoice (add-on payments). */
  addedCompanies?: number
  /** Billing interval this invoice covers. Falls back to the subscription interval. */
  interval?: BillingInterval
  paymentMethod: SubscriptionPaymentMethod | null
  usersUsed: number
  usersLimit: number
  branchesUsed: number
  branchesLimit: number
}

export type Subscription = {
  id: string
  companyId: string
  companyName: string
  /** Company website domain for Google favicon logos (e.g. stripe.com). */
  companyDomain?: string | null
  /** Optional custom logo URL when favicon is unavailable or low quality. */
  companyLogoUrl?: string | null
  planId: string
  planName: string
  planTier: string
  planDescription: string
  isTrial: boolean
  status: SubscriptionStatus
  branchesUsed: number
  branchesLimit: number
  usersUsed: number
  usersLimit: number
  /** Account-level company slots (single billing page only). */
  companiesUsed?: number
  companiesLimit?: number
  amount: number
  currency: string
  interval: BillingInterval
  createdAt: string
  periodEnd: string
  nextBillingDate: string
  remainingDays: number
  autoRenew: boolean
  paymentMethod: SubscriptionPaymentMethod | null
  features: string[]
  members: SubscriptionMember[]
  assignedBranches: SubscriptionAssignedBranch[]
  invoices: SubscriptionInvoice[]
}

export const subscriptionStatusLabels: Record<SubscriptionStatus, string> = {
  active: "Active",
  trialing: "Trial",
  pending: "Pending",
  past_due: "Past due",
  canceled: "Canceled",
}

export const billingIntervalLabels: Record<BillingInterval, string> = {
  month: "Monthly",
  year: "Annual",
}

export const billingIntervalUnits: Record<BillingInterval, string> = {
  month: "Month",
  year: "Year",
}

export const paymentProviderLabels: Record<
  SubscriptionPaymentProvider,
  string
> = {
  esewa: "eSewa",
  fonepay: "Fonepay",
}

export function formatPaymentMethodSummary(
  method: SubscriptionPaymentMethod | null
): string {
  if (!method) return "—"
  return paymentProviderLabels[method.provider]
}
