import {
  DuoBranchIcon,
  DuoCompanyListsIcon,
  DuoHomeIcon,
  DuoPaymentsIcon,
  DuoPermissionsIcon,
  DuoUserRolesIcon,
  DuoUsersIcon,
} from "@/components/icons/duo"

import type { NavItem } from "@/types/navigation"

export const organizationNavigation: NavItem[] = [
  {
    title: "Company Profile",
    href: "/admin/companies/comp_10294/configuration",
    icon: DuoCompanyListsIcon,
    description: "View and update company profile information.",
  },
  {
    title: "Branch Management",
    href: "/admin/organizations/branch-management",
    icon: DuoBranchIcon,
    description: "Create and manage company branches.",
  },
]

export const adminNavigation: NavItem[] = [
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
    title: "User Management",
    href: "/admin/settings/users-permissions/users",
    icon: DuoUsersIcon,
    description: "Invite users and assign them to entities with a role.",
  },
  {
    title: "Subscriptions",
    href: "/admin/subscriptions",
    icon: DuoPaymentsIcon,
    description:
      "Manage software licensing and branch entitlement usage across companies.",
  },
  {
    title: "Organizations",
    href: "/admin/organizations",
    icon: DuoCompanyListsIcon,
    children: organizationNavigation,
  },
]

export const adminBrand = {
  name: "Omniverse",
}

export function getAdminNavItemByHref(href: string): NavItem | undefined {
  for (const item of adminNavigation) {
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
