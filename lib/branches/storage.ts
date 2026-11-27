import { ensureHeadOfficeActive } from "@/lib/branches/head-office"
import { getBranchLocation } from "@/lib/branches/location"
import { organizations } from "@/config/organizations"
import { mockBranches, mockOtherCompanyBranches } from "@/lib/mock/branches"
import type { Branch } from "@/types/branch"

export const BRANCHES_STORAGE_KEY = "ibmerp-branches-v2"
const ACTIVE_BRANCH_STORAGE_KEY = "ibmerp-active-branch-v2"

/** Fired on `window` whenever the stored branches change. */
export const BRANCHES_CHANGE_EVENT = "branches-change"

/** The company the ERP works in; branches without a `companyId` belong to it. */
export const DEFAULT_BRANCH_COMPANY_ID: string = organizations[0].id

export function getBranchCompanyId(branch: Branch): string {
  return branch.companyId ?? DEFAULT_BRANCH_COMPANY_ID
}

function normalizeBranchAddresses(branches: Branch[]): Branch[] {
  return branches.map((b) => ({
    ...b,
    address: b.address?.trim() ? b.address.trim() : getBranchLocation(b),
  }))
}

function isDefaultCompanyBranch(branch: Branch) {
  return getBranchCompanyId(branch) === DEFAULT_BRANCH_COMPANY_ID
}

/** Seed companies that have no stored branches yet (e.g. data saved before companies existed). */
function withSeededCompanies(branches: Branch[]): Branch[] {
  const seeded = new Set(branches.map(getBranchCompanyId))
  const missing = mockOtherCompanyBranches.filter(
    (branch) => !seeded.has(getBranchCompanyId(branch))
  )
  return [...branches, ...missing.map((branch) => ({ ...branch }))]
}

/** Every company's branches. Used by the admin console. */
export function readAllBranches(): Branch[] {
  try {
    const saved = window.localStorage.getItem(BRANCHES_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved) as Branch[]
      return normalizeBranchAddresses(
        ensureHeadOfficeActive(withSeededCompanies(parsed))
      )
    }
  } catch {
    // Fall back to mock seed data.
  }

  return normalizeBranchAddresses(
    [...mockBranches, ...mockOtherCompanyBranches].map((branch) => ({
      ...branch,
    }))
  )
}

/** Replace every company's branches. Used by the admin console. */
export function saveAllBranches(branches: Branch[]) {
  const normalized = normalizeBranchAddresses(ensureHeadOfficeActive(branches))
  window.localStorage.setItem(BRANCHES_STORAGE_KEY, JSON.stringify(normalized))
  window.dispatchEvent(new Event(BRANCHES_CHANGE_EVENT))
  return normalized
}

/** The default company's branches (what the ERP works with). */
export function readBranches(): Branch[] {
  return readAllBranches().filter(isDefaultCompanyBranch)
}

/** Save the default company's branches, keeping the other companies' branches. */
export function saveBranches(branches: Branch[]) {
  const others = readAllBranches().filter(
    (branch) => !isDefaultCompanyBranch(branch)
  )
  return saveAllBranches([...branches, ...others]).filter(
    isDefaultCompanyBranch
  )
}

export function readActiveBranchId(): string | null {
  try {
    return window.localStorage.getItem(ACTIVE_BRANCH_STORAGE_KEY)
  } catch {
    return null
  }
}

export function saveActiveBranchId(branchId: string) {
  window.localStorage.setItem(ACTIVE_BRANCH_STORAGE_KEY, branchId)
}

/** Prefer the stored active branch when it is still active; otherwise first active branch. */
export function resolveActiveBranch(branches: Branch[]): Branch | null {
  const active = branches.filter((branch) => branch.status === "active")
  if (active.length === 0) return null

  const storedId = readActiveBranchId()
  const stored = storedId
    ? active.find((branch) => branch.id === storedId)
    : undefined

  return stored ?? active[0]
}

export function createBranchId(code: string) {
  const slug = code
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

  return `br-${slug || "branch"}-${Date.now()}`
}

export function todayIsoDate() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}
