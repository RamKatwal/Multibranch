import { getBranchLocation } from "@/lib/branches/location"
import { isHeadOfficeBranch as isLiveHeadOfficeBranch } from "@/lib/branches/head-office"
import { readBranches } from "@/lib/branches/storage"
import { mockBranches } from "@/lib/mock/branches"
import { mockSubscriptions } from "@/lib/mock/subscriptions"
import type { Branch } from "@/types/branch"

export type CompanyBranchOption = {
  id: string
  name: string
  code: string
  address?: string
  location?: string
  status: string
  isHeadOffice: boolean
}

export type CompanyOption = {
  id: string
  name: string
  domain?: string | null
  branches: CompanyBranchOption[]
}

export function isHeadOfficeBranch(name: string, code: string) {
  const label = `${name} ${code}`.toLowerCase()
  return (
    label.includes("head office") ||
    label.includes("headoffice") ||
    /\bhq\b/.test(label) ||
    code.toUpperCase() === "HQ"
  )
}

function sortBranches(branches: CompanyBranchOption[]) {
  return [...branches].sort((a, b) => {
    if (a.isHeadOffice !== b.isHeadOffice) {
      return a.isHeadOffice ? -1 : 1
    }
    return a.name.localeCompare(b.name)
  })
}

/** Every company always has a Head Office entry, listed first. */
function ensureHeadOffice(
  companyId: string,
  branches: CompanyBranchOption[]
): CompanyBranchOption[] {
  if (branches.some((branch) => branch.isHeadOffice)) {
    return sortBranches(branches)
  }

  return sortBranches([
    {
      id: `${companyId}-head-office`,
      name: "Head Office",
      code: "HQ",
      address: "Durbar Marg, Kathmandu 44600",
      location: "Kathmandu, Nepal",
      status: "Active",
      isHeadOffice: true,
    },
    ...branches,
  ])
}

/** Every company plus every branch (including generated Head Office rows). */
export function getAllCompanyAccess() {
  const companies = getCompanyOptions()
  return {
    companyIds: companies.map((company) => company.id),
    companyNames: companies.map((company) => company.name),
    branchIds: companies.flatMap((company) =>
      company.branches.map((branch) => branch.id)
    ),
  }
}

/** Companies and their branches from subscription seed data. */
export function getCompanyOptions(): CompanyOption[] {
  return mockSubscriptions.map((subscription) => ({
    id: subscription.companyId,
    name: subscription.companyName,
    domain: subscription.companyDomain,
    branches: ensureHeadOffice(
      subscription.companyId,
      subscription.assignedBranches.map((branch) => ({
        id: branch.branchId,
        name: branch.branchName,
        code: branch.branchCode,
        address: branch.address,
        location: branch.location,
        status: branch.status,
        isHeadOffice: isHeadOfficeBranch(branch.branchName, branch.branchCode),
      }))
    ),
  }))
}

export function getCompanyById(companyId: string): CompanyOption | undefined {
  return getCompanyOptions().find((company) => company.id === companyId)
}

export function findCompanyForBranch(
  branchId: string
): CompanyOption | undefined {
  return getCompanyOptions().find((company) =>
    company.branches.some((branch) => branch.id === branchId)
  )
}

export function getBranchLabel(branchId: string): string | undefined {
  for (const company of getCompanyOptions()) {
    const branch = company.branches.find((item) => item.id === branchId)
    if (branch) {
      return branch.isHeadOffice ? `${branch.name} (Head Office)` : branch.name
    }
  }
  return undefined
}

export type ResolvedBranchOption = CompanyBranchOption & {
  companyId: string
  companyName: string
}

function toResolvedFromLiveBranch(branch: Branch): ResolvedBranchOption {
  return {
    id: branch.id,
    name: branch.name,
    code: branch.code,
    address: branch.address,
    location: branch.address,
    status: branch.status,
    isHeadOffice: isLiveHeadOfficeBranch(branch),
    companyId: branch.id,
    companyName: branch.name,
  }
}

function readBranchesSafe(): Branch[] {
  try {
    return readBranches()
  } catch {
    return mockBranches.map((branch) => ({ ...branch }))
  }
}

/** Resolve branch options (with company labels) for a list of branch IDs. */
export function getBranchesByIds(branchIds: string[]): ResolvedBranchOption[] {
  const companies = getCompanyOptions()
  const liveBranches = readBranchesSafe()
  const resolved: ResolvedBranchOption[] = []

  for (const branchId of branchIds) {
    let found: ResolvedBranchOption | undefined

    for (const company of companies) {
      const branch = company.branches.find((item) => item.id === branchId)
      if (branch) {
        found = {
          ...branch,
          companyId: company.id,
          companyName: company.name,
        }
        break
      }
    }

    if (!found) {
      const live = liveBranches.find((item) => item.id === branchId)
      if (live) found = toResolvedFromLiveBranch(live)
    }

    // Demo inventory data uses live branch ids (br-hq / br-ktm-hub) that are not
    // in subscription company options — always resolve those from the seed list.
    if (!found) {
      const seed = mockBranches.find((item) => item.id === branchId)
      if (seed) found = toResolvedFromLiveBranch(seed)
    }

    if (found) resolved.push(found)
  }

  return resolved
}

export type CompanyBranchGroup = {
  companyId: string
  companyName: string
  branches: ResolvedBranchOption[]
}

/** Group resolved branches by company, preserving branch order within each company. */
export function groupBranchesByCompany(
  branchIds: string[]
): CompanyBranchGroup[] {
  const groups = new Map<string, CompanyBranchGroup>()

  for (const branch of getBranchesByIds(branchIds)) {
    const existing = groups.get(branch.companyId)
    if (existing) {
      existing.branches.push(branch)
      continue
    }

    groups.set(branch.companyId, {
      companyId: branch.companyId,
      companyName: branch.companyName,
      branches: [branch],
    })
  }

  return Array.from(groups.values())
}
