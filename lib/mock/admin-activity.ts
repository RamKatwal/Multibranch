export type AdminActivityEventType =
  | "branch_added"
  | "plan_upgraded"
  | "permission_changed"
  | "org_onboarded"
  | "subscription_renewed"
  | "user_invited"

export type AdminActivityEvent = {
  id: string
  type: AdminActivityEventType
  message: string
  /** ISO timestamp used for sorting / relative labels. */
  occurredAt: string
  companyName?: string
  href?: string
}

/**
 * Reverse-chronological platform events for the Super Admin Home feed.
 * Timestamps are relative to a fixed "now" so relative labels stay stable in demos.
 */
const DEMO_NOW = new Date("2026-08-20T15:00:00+05:45")

function hoursAgo(hours: number): string {
  return new Date(DEMO_NOW.getTime() - hours * 60 * 60 * 1000).toISOString()
}

function daysAgo(days: number): string {
  return hoursAgo(days * 24)
}

export const mockAdminActivity: AdminActivityEvent[] = [
  {
    id: "act_01",
    type: "branch_added",
    message: "Omniverse added a new branch: Pokhara",
    occurredAt: hoursAgo(2),
    companyName: "Omniverse",
    href: "/admin/subscriptions/SUB-10294",
  },
  {
    id: "act_02",
    type: "plan_upgraded",
    message: "Everest Retail Group upgraded to Multi-Branch (5 branches)",
    occurredAt: hoursAgo(5),
    companyName: "Everest Retail Group",
    href: "/admin/subscriptions/SUB-11002",
  },
  {
    id: "act_03",
    type: "permission_changed",
    message: "Admin permission changed for accounts@everestretail.com",
    occurredAt: hoursAgo(8),
    companyName: "Everest Retail Group",
    href: "/admin/subscriptions/SUB-11002",
  },
  {
    id: "act_04",
    type: "org_onboarded",
    message: "New organization onboarded: Nova Logistics",
    occurredAt: daysAgo(1),
    companyName: "Nova Logistics",
    href: "/admin/subscriptions/SUB-11140",
  },
  {
    id: "act_05",
    type: "user_invited",
    message: "Himalayan Traders invited 2 new users",
    occurredAt: daysAgo(1),
    companyName: "Himalayan Traders",
    href: "/admin/subscriptions/SUB-10881",
  },
  {
    id: "act_06",
    type: "branch_added",
    message: "Himalayan Traders added a new branch: Pokhara Outlet",
    occurredAt: daysAgo(2),
    companyName: "Himalayan Traders",
    href: "/admin/subscriptions/SUB-10881",
  },
  {
    id: "act_07",
    type: "subscription_renewed",
    message: "Omniverse renewed Enterprise Plan for another year",
    occurredAt: daysAgo(3),
    companyName: "Omniverse",
    href: "/admin/subscriptions/SUB-10294",
  },
  {
    id: "act_08",
    type: "permission_changed",
    message: "Admin permission changed for farah@himalayantraders.com",
    occurredAt: daysAgo(4),
    companyName: "Himalayan Traders",
    href: "/admin/subscriptions/SUB-10881",
  },
  {
    id: "act_09",
    type: "plan_upgraded",
    message: "Omniverse upgraded to Multi-Branch (15 branches)",
    occurredAt: daysAgo(5),
    companyName: "Omniverse",
    href: "/admin/subscriptions/SUB-10294",
  },
  {
    id: "act_10",
    type: "org_onboarded",
    message: "New organization onboarded: Himalayan Traders",
    occurredAt: daysAgo(6),
    companyName: "Himalayan Traders",
    href: "/admin/subscriptions/SUB-10881",
  },
  {
    id: "act_11",
    type: "branch_added",
    message: "Everest Retail Group added a new branch: Seasonal Pop-up",
    occurredAt: daysAgo(8),
    companyName: "Everest Retail Group",
    href: "/admin/subscriptions/SUB-11002",
  },
  {
    id: "act_12",
    type: "user_invited",
    message: "Omniverse invited 3 new users",
    occurredAt: daysAgo(10),
    companyName: "Omniverse",
    href: "/admin/subscriptions/SUB-10294",
  },
]

export function formatActivityRelativeTime(
  occurredAt: string,
  now: Date = DEMO_NOW
): string {
  const then = new Date(occurredAt)
  const diffMs = Math.max(0, now.getTime() - then.getTime())
  const minutes = Math.floor(diffMs / (60 * 1000))
  if (minutes < 60) {
    return minutes <= 1 ? "1m ago" : `${minutes}m ago`
  }
  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return hours === 1 ? "1h ago" : `${hours}h ago`
  }
  const days = Math.floor(hours / 24)
  return days === 1 ? "1d ago" : `${days}d ago`
}
