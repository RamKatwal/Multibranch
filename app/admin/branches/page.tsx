import { redirect } from "next/navigation"

import { organizations } from "@/config/organizations"

// No all-companies overview: Branch Management opens the first company's branches.
export default function AdminBranchesPage() {
  redirect(`/admin/branches/${organizations[0].id}`)
}
