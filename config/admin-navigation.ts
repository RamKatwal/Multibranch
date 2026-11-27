import {
  DuoBranchIcon,
  DuoHomeIcon,
  DuoPaymentsIcon,
  DuoPermissionsIcon,
  DuoUserRolesIcon,
  DuoUsersIcon,
} from "@/components/icons/duo"

import type { NavItem } from "@/types/navigation"

export const adminNavigation: NavItem[] = [
  {
    title: "Home v2",
    href: "/admin/home-v2",
    icon: DuoHomeIcon,
  },
  {
    title: "Branch Management",
    href: "/admin/branches",
    icon: DuoBranchIcon,
    description: "Create and manage each company's branches.",
  },
  {
    title: "User Management",
    href: "/admin/settings/users-permissions/users",
    icon: DuoUsersIcon,
    description: "Invite users and assign them to entities with a role.",
  },
  {
    title: "Billing",
    href: "/admin/billing",
    icon: DuoPaymentsIcon,
    description: "Your plan, limits, modules and payment history.",
  },
]

/** Shown at the bottom of the admin sidebar, muted, for now. */
export const adminSecondaryNavigation: NavItem[] = [
  {
    title: "Home",
    href: "/admin",
    icon: DuoHomeIcon,
  },
  {
    title: "User Roles",
    href: "/admin/settings/users-permissions/groups",
    icon: DuoUserRolesIcon,
    description: "Create user roles scoped to a company and its branches.",
  },
  {
    title: "Permission Management",
    href: "/admin/settings/users-permissions/permissions",
    icon: DuoPermissionsIcon,
    description: "Configure module permissions per role and branch.",
  },
  {
    title: "Billing v2",
    href: "/admin/subscriptions",
    icon: DuoPaymentsIcon,
    description:
      "Manage software licensing and branch entitlement usage across companies.",
  },
]

export const adminBrand = {
  name: "Omniverse",
}

export function getAdminNavItemByHref(href: string): NavItem | undefined {
  for (const item of [...adminNavigation, ...adminSecondaryNavigation]) {
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
