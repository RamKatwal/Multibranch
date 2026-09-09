export type ConfigurationsNavItem = {
  title: string
  href: string
  description?: string
  children?: ConfigurationsNavItem[]
}
  
export const configurationsNavigation: ConfigurationsNavItem[] = [
  {
    title: "General Setting",
    href: "/configurations/general",
    children: [
      {
        title: "Company Profile",
        href: "/configurations/general/company-configuration",
        description: "View and update your company profile information.",
      },
      {
        title: "Branch Management",
        href: "/configurations/general/branch-management",
        description: "Add and manage branches for your company.",
      },
      {
        title: "Product Configuration",
        href: "/configurations/general/product-configuration",
        description: "Configure product defaults and catalog options.",
      },
      {
        title: "Payment Terms",
        href: "/configurations/general/payment-terms",
        description: "Define payment due dates and term labels.",
      },
      {
        title: "Cost Terms",
        href: "/configurations/general/cost-terms",
        description: "Manage cost calculation terms and labels.",
      },
      {
        title: "Document Template",
        href: "/configurations/general/document-template",
        description: "Customize print and PDF document templates.",
      },
    ],
  },
  {
    title: "User & Permissions",
    href: "/configurations/users",
    children: [
      {
        title: "User Roles",
        href: "/configurations/users/group-management",
        description: "Create and manage user roles and access.",
      },
      {
        title: "User Management",
        href: "/configurations/users/user-management",
        description: "Invite, edit, and deactivate system users.",
      },
      {
        title: "Permission Management",
        href: "/configurations/users/permission-management",
        description: "Assign module and action-level permissions.",
      },
    ],
  },
  {
    title: "Billing & Plans",
    href: "/configurations/billing-plans",
    description: "View subscription plans and billing details.",
  },
]

export function getConfigurationsItemByHref(
  href: string
): ConfigurationsNavItem | undefined {
  for (const item of configurationsNavigation) {
    if (item.href === href) {
      return item
    }

    if (item.children) {
      const child = item.children.find((entry) => entry.href === href)
      if (child) {
        return child
      }
    }
  }

  return undefined
}

export function getDefaultConfigurationsHref() {
  return (
    configurationsNavigation[0]?.children?.[0]?.href ??
    configurationsNavigation[0]?.href ??
    "/configurations"
  )
}
