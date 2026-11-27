export const BRANCH_STATUSES = ["active", "inactive"] as const

export type BranchStatus = (typeof BRANCH_STATUSES)[number]

export type Branch = {
  id: string
  /** Owning company (`config/organizations.ts` id). Missing = the default (first) company. */
  companyId?: string
  name: string
  code: string
  address: string
  contactNumber: string
  contactEmail: string
  status: BranchStatus
  createdAt: string
}

export const branchStatusLabels: Record<BranchStatus, string> = {
  active: "Active",
  inactive: "Inactive",
}
