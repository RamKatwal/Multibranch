import {
  BRANCH_MONTHLY_PRICE,
  calculatePricing,
  PERIOD_MONTH_MULTIPLIER,
  VAT_RATE,
  type PaymentPeriod,
  type PlanId,
} from "@/lib/onboarding/plans"
import type { InvoiceChargeType, Subscription } from "@/types/subscription"

export function subscriptionPeriod(
  subscription: Subscription
): PaymentPeriod {
  return subscription.interval === "year" ? "annually" : "monthly"
}

export function resolvePlanId(planId: string, planName?: string): PlanId {
  if (
    planId === "delite" ||
    planId === "standard" ||
    planId === "free_trial"
  ) {
    return planId
  }

  const haystack = `${planId} ${planName ?? ""}`.toLowerCase()
  if (haystack.includes("trial") || haystack.includes("free")) {
    return "free_trial"
  }
  if (haystack.includes("standard") || haystack.includes("enterprise")) {
    return "standard"
  }
  if (haystack.includes("delite") || haystack.includes("de-lite")) {
    return "delite"
  }
  return "standard"
}

export type MoneyBreakdown = {
  taxable: number
  tax: number
  total: number
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100
}

export function additionalBranchesDue(
  subscription: Subscription,
  count: number
): MoneyBreakdown {
  if (count <= 0) return { taxable: 0, tax: 0, total: 0 }
  const multiplier =
    PERIOD_MONTH_MULTIPLIER[subscriptionPeriod(subscription)] ?? 1
  const taxable = roundMoney(BRANCH_MONTHLY_PRICE * count * multiplier)
  const tax = roundMoney(taxable * VAT_RATE)
  return { taxable, tax, total: roundMoney(taxable + tax) }
}

export function pricingFor(
  subscription: Subscription,
  usersLimit: number,
  branchesLimit = subscription.branchesLimit
) {
  return calculatePricing({
    planId: resolvePlanId(subscription.planId, subscription.planName),
    users: Math.max(1, usersLimit),
    period: subscriptionPeriod(subscription),
    branchesEnabled: branchesLimit > 0,
    branchCount: Math.max(1, branchesLimit || 1),
    moduleIds: [],
  })
}

export function additionalUsersDue(
  subscription: Subscription,
  additionalUsers: number
): MoneyBreakdown {
  if (additionalUsers <= 0) return { taxable: 0, tax: 0, total: 0 }
  const current = pricingFor(subscription, subscription.usersLimit)
  const next = pricingFor(
    subscription,
    subscription.usersLimit + additionalUsers
  )
  return {
    taxable: Math.max(0, roundMoney(next.taxableAmount - current.taxableAmount)),
    tax: Math.max(0, roundMoney(next.tax - current.tax)),
    total: Math.max(0, roundMoney(next.total - current.total)),
  }
}

export function invoiceChargeTypeFor(
  addedBranches: number,
  addedUsers: number
): InvoiceChargeType {
  if (addedBranches > 0 && addedUsers > 0) return "branches_and_users"
  if (addedBranches > 0) return "branches"
  if (addedUsers > 0) return "users"
  return "plan"
}

export function shiftPeriodEnd(
  current: string,
  interval: Subscription["interval"]
) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(current)
  const date = match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date(current)

  if (interval === "year") {
    date.setFullYear(date.getFullYear() + 1)
  } else {
    date.setMonth(date.getMonth() + 1)
  }
  return date
}
