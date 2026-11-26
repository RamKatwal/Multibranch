import { redirect } from "next/navigation"

export default function AdminOrganizationPermissionsRedirect() {
  redirect("/admin/settings/users-permissions/permissions")
}
