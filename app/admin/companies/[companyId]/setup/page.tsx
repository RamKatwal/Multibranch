import { redirect } from "next/navigation"

import { getOrganizationSetupByCompanyId } from "@/lib/admin/organization-setup"

export default async function AdminCompanySetupRoute({
  params,
}: {
  params: Promise<{ companyId: string }>
}) {
  const { companyId } = await params

  if (getOrganizationSetupByCompanyId(companyId)) {
    redirect(`/admin?setup=${companyId}`)
  }

  redirect("/admin")
}
