export type SettingsNavItem = {
  title: string
  href: string
  description?: string
}

export const settingsNavigation: SettingsNavItem[] = [
  {
    title: "Company Info",
    href: "/settings/company-info",
    description: "View and update your company profile information.",
  },
  {
    title: "Billing & Plans",
    href: "/settings/billing-plans",
    description: "View subscription plans and billing details.",
  },
  {
    title: "User Activities",
    href: "/settings/user-activities",
    description: "Review recent user activity and audit logs.",
  },
  {
    title: "Notification",
    href: "/settings/notification",
    description: "Configure email and in-app notification preferences.",
  },
]

export function getSettingsItemByHref(
  href: string
): SettingsNavItem | undefined {
  return settingsNavigation.find((item) => item.href === href)
}

export function getDefaultSettingsHref() {
  return settingsNavigation[0]?.href ?? "/settings"
}
