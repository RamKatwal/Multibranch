import { mockSubscriptions } from "@/lib/mock/subscriptions"
import { getPlan, type PlanId } from "@/lib/onboarding/plans"
import type { Subscription } from "@/types/subscription"

/**
 * Mock data for the single account billing page (`/admin/billing`). One plan covers every
 * company; the per-company list stays on `/admin/subscriptions` (Billing v2).
 */

export const ACCOUNT_PLAN_ID: PlanId = "standard"

/** Modules every plan includes, shown as chips on the billing page. */
export const BASE_MODULES = [
  "Sales",
  "Purchase",
  "Inventory",
  "Accounting",
  "Reports",
] as const

/** Mock price for one extra company slot, per month, before VAT. */
export const COMPANY_SLOT_MONTHLY_PRICE = 499

/** Days left at which the page starts warning about renewal. */
export const EXPIRING_SOON_DAYS = 60

export type BillTo =
  | { type: "company"; companyId: string; companyName: string }
  | {
      type: "individual"
      name: string
      email: string
      phone: string
      pan?: string
    }

export type RenewalScenario = "default" | "expiring" | "expired"

export const renewalScenarioLabels: Record<RenewalScenario, string> = {
  default: "Default",
  expiring: "60 days left",
  expired: "Expired",
}

export type BillToScenario = "company" | "individual" | "none"

export const billToScenarioLabels: Record<BillToScenario, string> = {
  company: "Company",
  individual: "Individual",
  none: "None",
}

export const DEFAULT_INDIVIDUAL_BILL_TO: BillTo = {
  type: "individual",
  name: "Ram Bahadur Shrestha",
  email: "ram.shrestha@example.com",
  phone: "+977 9801234567",
}

export function toIsoDate(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function startOfToday() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

function parseIsoDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  return match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date(value)
}

/** Whole days from today until `isoDate` (negative once it has passed). */
export function daysUntil(isoDate: string) {
  const ms = parseIsoDate(isoDate).getTime() - startOfToday().getTime()
  return Math.round(ms / (1000 * 60 * 60 * 24))
}

const SCENARIO_DAYS: Record<RenewalScenario, number> = {
  default: 200,
  expiring: EXPIRING_SOON_DAYS,
  expired: -5,
}

export function periodEndForScenario(scenario: RenewalScenario) {
  const date = startOfToday()
  date.setDate(date.getDate() + SCENARIO_DAYS[scenario])
  return toIsoDate(date)
}

export type RenewalState = "active" | "expiring" | "expired"

export function renewalStateFor(daysLeft: number): RenewalState {
  if (daysLeft < 0) return "expired"
  if (daysLeft <= EXPIRING_SOON_DAYS) return "expiring"
  return "active"
}

/**
 * The account's plan, seeded from the first mock subscription with the plan from
 * `lib/onboarding/plans` (the one `/settings/billing-plans` sells). Branch and company
 * counts are filled in live by the page from branch storage.
 */
export function buildAccountSubscription(): Subscription {
  const base = mockSubscriptions[0]
  const plan = getPlan(ACCOUNT_PLAN_ID)
  const periodEnd = periodEndForScenario("default")

  return {
    ...base,
    id: "ACCOUNT",
    planId: plan.id,
    planName: plan.name,
    planTier: plan.name,
    planDescription: plan.description,
    status: "active",
    usersUsed: 4,
    usersLimit: 5,
    companiesUsed: 0,
    companiesLimit: 3,
    interval: "year",
    periodEnd,
    nextBillingDate: periodEnd,
    remainingDays: daysUntil(periodEnd),
    invoices: base.invoices.map((invoice) => ({
      ...invoice,
      planName: plan.name,
    })),
  }
}
