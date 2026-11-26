import {
  getHomeOrganizations,
  getHomeOrganizationByCompanyId,
  type HomeOrganization,
} from "@/lib/admin/home-organizations"
import { getMockCompanyProfile } from "@/lib/mock/companies"
import type { SubscriptionStatus } from "@/types/subscription"

export const SETUP_STEP_IDS = [
  "company_profile",
  "branch_setup",
  "user_roles",
  "permissions",
  "user_management",
] as const

export type SetupStepId = (typeof SETUP_STEP_IDS)[number]

export type SetupUrgency = "danger" | "warning" | "neutral"

export type SetupStepDefinition = {
  id: SetupStepId
  title: string
  description: string
  /** When true, step stays locked until the org has at least one branch. */
  requiresBranch?: boolean
}

export const SETUP_STEPS: SetupStepDefinition[] = [
  {
    id: "company_profile",
    title: "Company Profile",
    description: "Legal name, PAN/tax ID, fiscal year, and currency.",
  },
  {
    id: "branch_setup",
    title: "Branch Setup",
    description: "Add at least one branch for this organization.",
  },
  {
    id: "user_roles",
    title: "User Role",
    description: "Create user roles scoped to the company and branches.",
  },
  {
    id: "permissions",
    title: "Permission",
    description: "Configure module permissions per role and branch.",
  },
  {
    id: "user_management",
    title: "User Management",
    description: "Invite users and assign them to entities with a role.",
  },
]

export const SETUP_STEP_COUNT = SETUP_STEPS.length

const SETUP_OVERRIDES_KEY = "providhy_org_setup_overrides"
const SETUP_OVERRIDES_EVENT = "providhy-org-setup-overrides"

type SetupFlags = {
  userRoles: boolean
  permissions: boolean
}

/** Mock extras that are not already on the subscription record. */
const setupFlagsByCompanyId: Record<string, SetupFlags> = {
  comp_10294: { userRoles: true, permissions: true },
  comp_10881: { userRoles: true, permissions: false },
  comp_11002: { userRoles: true, permissions: false },
  comp_11140: { userRoles: false, permissions: false },
}

export type SetupOverrides = Partial<Record<SetupStepId, boolean>>

export type ResolvedSetupStep = SetupStepDefinition & {
  complete: boolean
  href: string
  locked: boolean
  lockLabel: string | null
}

export type OrganizationSetupProgress = {
  org: HomeOrganization
  steps: ResolvedSetupStep[]
  completedCount: number
  percent: number
  urgency: SetupUrgency
  previewSteps: ResolvedSetupStep[]
}

function setupHref(stepId: SetupStepId, org: HomeOrganization): string {
  switch (stepId) {
    case "company_profile":
      return `/admin/companies/${org.companyId}/configuration`
    case "branch_setup":
      return "/admin/organizations/branch-management"
    case "user_roles":
      return "/admin/settings/users-permissions/groups"
    case "permissions":
      return "/admin/settings/users-permissions/permissions"
    case "user_management":
      return "/admin/settings/users-permissions/users"
  }
}

function isCompanyProfileComplete(companyId: string): boolean {
  const profile = getMockCompanyProfile(companyId)
  if (!profile) return false
  return Boolean(profile.companyName && profile.pan)
}

/** Client snapshot for `useSyncExternalStore`. Must be referentially stable until storage changes. */
export function getSetupOverridesSnapshot(): string {
  if (typeof window === "undefined") return ""
  try {
    return window.localStorage.getItem(SETUP_OVERRIDES_KEY) ?? ""
  } catch {
    return ""
  }
}

export function getServerSetupOverridesSnapshot(): string {
  return ""
}

export function parseAllSetupOverrides(
  raw: string
): Record<string, SetupOverrides> {
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw) as Record<string, SetupOverrides>
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {}
  } catch {
    return {}
  }
}

function readAllOverrides(): Record<string, SetupOverrides> {
  return parseAllSetupOverrides(getSetupOverridesSnapshot())
}

function writeAllOverrides(next: Record<string, SetupOverrides>) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(SETUP_OVERRIDES_KEY, JSON.stringify(next))
  window.dispatchEvent(new Event(SETUP_OVERRIDES_EVENT))
}

export function getSetupOverrides(companyId: string): SetupOverrides {
  return readAllOverrides()[companyId] ?? {}
}

export function markSetupStepComplete(companyId: string, stepId: SetupStepId) {
  const all = readAllOverrides()
  all[companyId] = { ...all[companyId], [stepId]: true }
  writeAllOverrides(all)
}

export function markSetupStepIncomplete(
  companyId: string,
  stepId: SetupStepId
) {
  const all = readAllOverrides()
  all[companyId] = { ...all[companyId], [stepId]: false }
  writeAllOverrides(all)
}

export function markAllSetupStepsComplete(companyId: string) {
  const all = readAllOverrides()
  const next: SetupOverrides = { ...all[companyId] }
  for (const stepId of SETUP_STEP_IDS) {
    next[stepId] = true
  }
  all[companyId] = next
  writeAllOverrides(all)
}

export function subscribeSetupOverrides(listener: () => void) {
  if (typeof window === "undefined") return () => {}

  const onStorage = (event: StorageEvent) => {
    if (event.key === SETUP_OVERRIDES_KEY || event.key === null) listener()
  }

  window.addEventListener("storage", onStorage)
  window.addEventListener(SETUP_OVERRIDES_EVENT, listener)
  return () => {
    window.removeEventListener("storage", onStorage)
    window.removeEventListener(SETUP_OVERRIDES_EVENT, listener)
  }
}

function resolveStepComplete(
  stepId: SetupStepId,
  org: HomeOrganization,
  flags: SetupFlags,
  overrides: SetupOverrides
): boolean {
  if (overrides[stepId] === true) return true
  if (overrides[stepId] === false) return false

  switch (stepId) {
    case "company_profile":
      return isCompanyProfileComplete(org.companyId)
    case "branch_setup":
      return org.branchesUsed > 0
    case "user_roles":
      return flags.userRoles
    case "permissions":
      return flags.permissions
    case "user_management":
      return org.usersUsed > 1
  }
}

function resolveStepLocked(
  definition: SetupStepDefinition,
  org: HomeOrganization
): { locked: boolean; lockLabel: string | null } {
  if (definition.requiresBranch && org.branchesUsed <= 0) {
    return { locked: true, lockLabel: "Requires branch setup first" }
  }
  return { locked: false, lockLabel: null }
}

export function setupUrgencyForStatus(status: SubscriptionStatus): SetupUrgency {
  if (status === "past_due") return "danger"
  if (status === "pending") return "warning"
  return "neutral"
}

function previewSteps(steps: ResolvedSetupStep[]): ResolvedSetupStep[] {
  return steps.filter((step) => !step.complete).slice(0, 2)
}

export function getOrganizationSetupProgress(
  org: HomeOrganization,
  overrides: SetupOverrides = getSetupOverrides(org.companyId)
): OrganizationSetupProgress {
  const flags = setupFlagsByCompanyId[org.companyId] ?? {
    userRoles: false,
    permissions: false,
  }

  const steps: ResolvedSetupStep[] = SETUP_STEPS.map((definition) => {
    const { locked, lockLabel } = resolveStepLocked(definition, org)
    return {
      ...definition,
      complete: locked
        ? false
        : resolveStepComplete(definition.id, org, flags, overrides),
      href: setupHref(definition.id, org),
      locked,
      lockLabel,
    }
  })

  const completedCount = steps.filter((step) => step.complete).length

  return {
    org,
    steps,
    completedCount,
    percent: Math.round((completedCount / SETUP_STEP_COUNT) * 100),
    urgency: setupUrgencyForStatus(org.status),
    previewSteps: previewSteps(steps),
  }
}

export function getIncompleteOrganizationSetups(): OrganizationSetupProgress[] {
  return getHomeOrganizations()
    .map((org) => getOrganizationSetupProgress(org))
    .filter((progress) => progress.completedCount < SETUP_STEP_COUNT)
}

export function getOrganizationSetupByCompanyId(
  companyId: string
): OrganizationSetupProgress | undefined {
  const org = getHomeOrganizationByCompanyId(companyId)
  if (!org) return undefined
  return getOrganizationSetupProgress(org)
}

export function setupStageLabel(completedCount: number): string {
  if (completedCount <= 1) return "Just getting started"
  if (completedCount <= 3) return "Making progress"
  return "Almost done"
}
