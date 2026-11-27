import { CompanyBranchesPage } from "@/components/admin/branches/company-branches-page"

// The company list can come from the client-side demo scenario, so unknown ids are
// handled by the page component instead of notFound() here.
export default async function AdminCompanyBranchesPage({
  params,
}: {
  params: Promise<{ companyId: string }>
}) {
  const { companyId } = await params

  return <CompanyBranchesPage companyId={companyId} />
}
