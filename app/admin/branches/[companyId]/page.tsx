import { notFound } from "next/navigation"

import { CompanyBranchesPage } from "@/components/admin/branches/company-branches-page"
import { organizations } from "@/config/organizations"

export function generateStaticParams() {
  return organizations.map((org) => ({ companyId: org.id }))
}

export default async function AdminCompanyBranchesPage({
  params,
}: {
  params: Promise<{ companyId: string }>
}) {
  const { companyId } = await params
  if (!organizations.some((org) => org.id === companyId)) notFound()

  return <CompanyBranchesPage companyId={companyId} />
}
