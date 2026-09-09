export type UsersPermissionsNavItem = {
  title: string
  href: string
  description?: string
}

export const usersPermissionsNavigation: UsersPermissionsNavItem[] = [
  {
    title: "User Roles",
    href: "/configurations/users/group-management",
    description: "Create user roles used for permission assignment.",
  },
  {
    title: "User Management",
    href: "/configurations/users/user-management",
    description: "Invite users and assign them to entities with a role.",
  },
]

export function getUsersPermissionsItemByHref(
  href: string
): UsersPermissionsNavItem | undefined {
  return usersPermissionsNavigation.find((item) => item.href === href)
}

export function getDefaultUsersPermissionsHref() {
  return (
    usersPermissionsNavigation[0]?.href ??
    "/configurations/users/group-management"
  )
}
