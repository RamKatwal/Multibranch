import { loadPlanSelection } from "@/lib/onboarding/storage"
import { loadEntitlementClient } from "@/lib/onboarding/entitlement"

/** Used when onboarding plan selection is not available (demo default). */
export const DEFAULT_BRANCH_LIMIT = 3

const BRANCH_LIMIT_STORAGE_KEY = "ibmerp-branch-limit"

/** Persist purchased branch limit after onboarding so it survives plan session clear. */
export function persistBranchLimit(limit: number): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(
      BRANCH_LIMIT_STORAGE_KEY,
      String(Math.max(1, limit))
    )
  } catch {
    // ignore
  }
}

function readPersistedBranchLimit(): number | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(BRANCH_LIMIT_STORAGE_KEY)
    if (!raw) return null
    const parsed = Number.parseInt(raw, 10)
    return Number.isFinite(parsed) && parsed >= 1 ? parsed : null
  } catch {
    return null
  }
}

function branchLimitFromPlan(): number | null {
  const entitlement = loadEntitlementClient()
  if (entitlement) return Math.max(1, entitlement.branchCount)

  const plan = loadPlanSelection()
  if (!plan) return null
  if (!plan.branchesEnabled) return 1
  return Math.max(1, plan.branchCount)
}

/** Set by the admin demo-scenario switcher; overrides the plan while a scenario is active. */
export const DEMO_BRANCH_LIMIT_STORAGE_KEY = "ibmerp-demo-branch-limit"

function readDemoBranchLimit(): number | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(DEMO_BRANCH_LIMIT_STORAGE_KEY)
    if (!raw) return null
    const parsed = Number.parseInt(raw, 10)
    return Number.isFinite(parsed) && parsed >= 1 ? parsed : null
  } catch {
    return null
  }
}

export function getBranchLimit(): number {
  return (
    readDemoBranchLimit() ??
    branchLimitFromPlan() ?? readPersistedBranchLimit() ?? DEFAULT_BRANCH_LIMIT
  )
}

export function isBranchLimitReached(branchCount: number): boolean {
  return branchCount >= getBranchLimit()
}

/** Mock "buy more branches": raises the limit by `by` (the demo limit while a scenario is active). */
export function raiseBranchLimit(by = 1): void {
  if (typeof window === "undefined") return
  const demo = readDemoBranchLimit()
  if (demo !== null) {
    window.localStorage.setItem(DEMO_BRANCH_LIMIT_STORAGE_KEY, String(demo + by))
    return
  }
  persistBranchLimit(getBranchLimit() + by)
}
