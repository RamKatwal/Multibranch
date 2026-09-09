import { getCompanyById } from "@/lib/companies/options"

export type UserBranchAccess = {
  id: string
  companyId: string
  companyName: string
  companyDomain: string | null
  companyLogoUrl?: string | null
  branchId: string
  branchName: string
  branchCode: string
  role: string
  lastLoggedIn: string | null
}

const HIMALAYAN_TRADERS_ID = "comp_10881"

/** Branches the demo user can access after sign-in (all under Himalayan Traders). */
export function getDemoUserBranchAccess(): UserBranchAccess[] {
  const company = getCompanyById(HIMALAYAN_TRADERS_ID)
  if (!company) return []

  const lastLoggedInByBranch: Record<string, string | null> = {
    [`${HIMALAYAN_TRADERS_ID}-head-office`]: "2026-08-25T09:42:00.000Z",
    br_ht_01: "2026-08-22T14:18:00.000Z",
  }

  const roleByBranch: Record<string, string> = {
    [`${HIMALAYAN_TRADERS_ID}-head-office`]: "Branch Manager",
    br_ht_01: "Inventory Officer",
  }

  return company.branches
    .filter((branch) => branch.status.toLowerCase() === "active")
    .map((branch) => ({
      id: `${company.id}:${branch.id}`,
      companyId: company.id,
      companyName: "Himalayan Traders",
      companyDomain: "himalaya.com",
      companyLogoUrl: null,
      branchId: branch.id,
      branchName: branch.name,
      branchCode: branch.code,
      role: roleByBranch[branch.id] ?? "Staff",
      lastLoggedIn: lastLoggedInByBranch[branch.id] ?? null,
    }))
}
