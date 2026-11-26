import type { Subscription } from "@/types/subscription"

export const ATTENTION_ISSUE_TYPES = [
  "trial_expiring",
  "payment_failed",
  "near_branch_limit",
  "subscription_error",
] as const

export type AttentionIssueType = (typeof ATTENTION_ISSUE_TYPES)[number]

export type TrendDirection = "up" | "down" | "flat"

export type HomeKpi = {
  id: string
  label: string
  value: string
  trend: TrendDirection
  /** Display string for the trend badge, e.g. "+2" or "+8%". */
  changeLabel: string
  /** Muted caption shown below the value, e.g. "Visitors for the last 6 months". */
  description: string
}

export type NeedsAttentionItem = {
  id: string
  companyId: string
  companyName: string
  companyDomain?: string | null
  subscriptionId: string
  issueType: AttentionIssueType
  label: string
  date: string
  href: string
}

export type AdminHomeMetrics = {
  kpis: HomeKpi[]
  attentionItems: NeedsAttentionItem[]
}

const MULTI_BRANCH_FEATURE = "Multi-Branch Management"
const BRANCH_LIMIT_THRESHOLD = 0.8
const TRIAL_EXPIRING_DAYS = 7

const DEMO_TRENDS = {
  organizations: { trend: "up" as const, changeLabel: "+2" },
  branches: { trend: "up" as const, changeLabel: "+3" },
  users: { trend: "up" as const, changeLabel: "+12" },
  mrr: { trend: "up" as const, changeLabel: "+8%" },
  attachRate: { trend: "up" as const, changeLabel: "+5%" },
}

function monthlyAmount(subscription: Subscription): number {
  if (subscription.status === "canceled" || subscription.status === "trialing") {
    return 0
  }
  if (subscription.amount <= 0) return 0
  return subscription.interval === "year"
    ? subscription.amount / 12
    : subscription.amount
}

function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: value % 1 === 0 ? 0 : 1,
  }).format(value)
}

function formatMrr(value: number, currency: string): string {
  const formatted = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(Math.round(value))
  return `${currency} ${formatted}`
}

function formatPercent(value: number): string {
  return `${Math.round(value)}%`
}

function hasPastDueInvoice(subscription: Subscription): boolean {
  return subscription.invoices.some((invoice) => invoice.status === "Past due")
}

function isNearBranchLimit(subscription: Subscription): boolean {
  if (subscription.branchesLimit <= 0) return false
  return (
    subscription.branchesUsed / subscription.branchesLimit >=
    BRANCH_LIMIT_THRESHOLD
  )
}

function attentionDate(subscription: Subscription, issueType: AttentionIssueType): string {
  if (issueType === "trial_expiring" || issueType === "payment_failed") {
    return subscription.periodEnd
  }
  if (issueType === "subscription_error") {
    return subscription.createdAt
  }
  return subscription.nextBillingDate || subscription.periodEnd
}

function buildAttentionItems(
  subscriptions: Subscription[]
): NeedsAttentionItem[] {
  const items: NeedsAttentionItem[] = []

  for (const subscription of subscriptions) {
    const base = {
      companyId: subscription.companyId,
      companyName: subscription.companyName,
      companyDomain: subscription.companyDomain,
      subscriptionId: subscription.id,
      href: `/admin/subscriptions/${subscription.id}`,
    }

    if (
      subscription.status === "trialing" &&
      subscription.remainingDays <= TRIAL_EXPIRING_DAYS
    ) {
      items.push({
        ...base,
        id: `${subscription.id}-trial_expiring`,
        issueType: "trial_expiring",
        label: `Trial expires in ${subscription.remainingDays} day${subscription.remainingDays === 1 ? "" : "s"}`,
        date: attentionDate(subscription, "trial_expiring"),
      })
    }

    if (subscription.status === "past_due" || hasPastDueInvoice(subscription)) {
      items.push({
        ...base,
        id: `${subscription.id}-payment_failed`,
        issueType: "payment_failed",
        label: "Payment failed / overdue",
        date: attentionDate(subscription, "payment_failed"),
      })
    }

    if (isNearBranchLimit(subscription)) {
      items.push({
        ...base,
        id: `${subscription.id}-near_branch_limit`,
        issueType: "near_branch_limit",
        label: `Approaching branch limit (${subscription.branchesUsed}/${subscription.branchesLimit})`,
        date: attentionDate(subscription, "near_branch_limit"),
      })
    }

    if (subscription.status === "pending") {
      items.push({
        ...base,
        id: `${subscription.id}-subscription_error`,
        issueType: "subscription_error",
        label: "Subscription pending / incomplete billing",
        date: attentionDate(subscription, "subscription_error"),
      })
    }
  }

  const priority: Record<AttentionIssueType, number> = {
    payment_failed: 0,
    trial_expiring: 1,
    subscription_error: 2,
    near_branch_limit: 3,
  }

  return items.sort((a, b) => {
    const byType = priority[a.issueType] - priority[b.issueType]
    if (byType !== 0) return byType
    return a.companyName.localeCompare(b.companyName)
  })
}

export function computeAdminHomeMetrics(
  subscriptions: Subscription[]
): AdminHomeMetrics {
  const totalOrganizations = subscriptions.length
  const activeBranches = subscriptions.reduce(
    (sum, item) => sum + item.branchesUsed,
    0
  )
  const totalUsers = subscriptions.reduce((sum, item) => sum + item.usersUsed, 0)

  const currency = subscriptions.find((item) => item.currency)?.currency ?? "NPR"
  const mrr = subscriptions.reduce((sum, item) => sum + monthlyAmount(item), 0)

  const multiBranchCount = subscriptions.filter((item) =>
    item.features.includes(MULTI_BRANCH_FEATURE)
  ).length
  const attachRate =
    totalOrganizations > 0 ? (multiBranchCount / totalOrganizations) * 100 : 0

  const kpis: HomeKpi[] = [
    {
      id: "organizations",
      label: "Total Organizations",
      value: formatCompactNumber(totalOrganizations),
      description: "Active tenants on the platform",
      ...DEMO_TRENDS.organizations,
    },
    {
      id: "branches",
      label: "Active Branches",
      value: formatCompactNumber(activeBranches),
      description: "Branches in use across all orgs",
      ...DEMO_TRENDS.branches,
    },
    {
      id: "users",
      label: "Total Platform Users",
      value: formatCompactNumber(totalUsers),
      description: "Licensed seats currently in use",
      ...DEMO_TRENDS.users,
    },
    {
      id: "mrr",
      label: "MRR",
      value: formatMrr(mrr, currency),
      description: "Monthly recurring revenue",
      ...DEMO_TRENDS.mrr,
    },
    {
      id: "attach-rate",
      label: "Multi-Branch Attach Rate",
      value: formatPercent(attachRate),
      description: "Orgs with Multi-Branch add-on active",
      ...DEMO_TRENDS.attachRate,
    },
  ]

  return {
    kpis,
    attentionItems: buildAttentionItems(subscriptions),
  }
}

export const attentionIssueLabels: Record<AttentionIssueType, string> = {
  trial_expiring: "Trial expiring",
  payment_failed: "Payment failed",
  near_branch_limit: "Near branch limit",
  subscription_error: "Subscription error",
}
