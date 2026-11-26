import { redirect } from "next/navigation"

export default function UsersPermissionsIndexPage() {
  redirect("/admin/settings/users-permissions/groups")
}
