import { redirect } from "next/navigation"

export default function AdminCompaniesRedirect() {
  redirect("/admin/organizations/branch-management")
}
