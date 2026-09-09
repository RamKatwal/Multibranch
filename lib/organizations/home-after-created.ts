/** Query flag that can mark home after a successful organization create. */
export const ORG_CREATED_QUERY = "created"
export const ORG_CREATED_COMPANY_ID_QUERY = "companyId"

/** Destination after onboarding / org create (company portal home). */
export function homeAfterOrgCreated(companyId?: string | null): string {
  const params = new URLSearchParams({ [ORG_CREATED_QUERY]: "1" })
  if (companyId?.trim()) {
    params.set(ORG_CREATED_COMPANY_ID_QUERY, companyId.trim())
  }
  return `/?${params.toString()}`
}

export function isOrgCreatedQuery(value: string | null): boolean {
  return value === "1" || value === "true"
}
