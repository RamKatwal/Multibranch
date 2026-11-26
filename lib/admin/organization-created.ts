/** Query flag shown on admin home after a successful organization create. */
export const ORG_CREATED_QUERY = "created"
export const ORG_CREATED_COMPANY_ID_QUERY = "companyId"

export function adminHomeAfterOrgCreated(companyId?: string | null): string {
  const params = new URLSearchParams({ [ORG_CREATED_QUERY]: "1" })
  if (companyId?.trim()) {
    params.set(ORG_CREATED_COMPANY_ID_QUERY, companyId.trim())
  }
  return `/admin?${params.toString()}`
}

export function isOrgCreatedQuery(value: string | null): boolean {
  return value === "1" || value === "true"
}
