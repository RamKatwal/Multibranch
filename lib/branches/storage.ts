import { ensureHeadOfficeActive } from "@/lib/branches/head-office"
import { getBranchLocation } from "@/lib/branches/location"
import { mockBranches } from "@/lib/mock/branches"
import type { Branch } from "@/types/branch"

const BRANCHES_STORAGE_KEY = "ibmerp-branches-v2"
const ACTIVE_BRANCH_STORAGE_KEY = "ibmerp-active-branch-v2"

function normalizeBranchAddresses(branches: Branch[]): Branch[] {
  return branches.map((b) => ({
    ...b,
    address: b.address?.trim() ? b.address.trim() : getBranchLocation(b),
  }))
}

export function readBranches(): Branch[] {
  try {
    const saved = window.localStorage.getItem(BRANCHES_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved) as Branch[]
      return normalizeBranchAddresses(ensureHeadOfficeActive(parsed))
    }
  } catch {
    // Fall back to mock seed data.
  }

  return normalizeBranchAddresses(mockBranches.map((branch) => ({ ...branch })))
}

export function saveBranches(branches: Branch[]) {
  const normalized = normalizeBranchAddresses(ensureHeadOfficeActive(branches))
  window.localStorage.setItem(BRANCHES_STORAGE_KEY, JSON.stringify(normalized))
  return normalized
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
