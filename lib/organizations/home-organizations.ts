import type { Subscription } from "@/types/subscription"
import { mockSubscriptions } from "@/lib/mock/subscriptions"
import { loadWorkspaceSubscriptionClient } from "@/lib/onboarding/entitlement"
import type { OnboardingCompanyDraft } from "@/lib/onboarding/company-storage"

export type HomeOrganization = Subscription & {
  location: string
}

const organizationLocations: Record<string, string> = {
  comp_10294: "Suryabinayak, Bhaktapur",
  comp_10881: "Thamel, Kathmandu",
  comp_11002: "Pulchowk, Lalitpur",
  comp_11140: "New Baneshwor, Kathmandu",
}

const ADDED_ORGS_KEY = "providhy_added_home_organizations"
const ADDED_ORGS_EVENT = "providhy-added-home-organizations"

/** Static seed orgs (subscriptions with location). */
export const homeOrganizations: HomeOrganization[] = mockSubscriptions.map(
  (subscription) => ({
    ...subscription,
    location:
      organizationLocations[subscription.companyId] ?? "Kathmandu, Nepal",
  })
)

export function organizationNeedsUpgrade(
  org: Pick<HomeOrganization, "status" | "isTrial">
) {
  return org.status === "past_due" || org.status === "trialing" || org.isTrial
}

export function locationFromCompanyDraft(
  draft: Pick<OnboardingCompanyDraft, "district" | "province" | "fullAddress"> | null
    | undefined
): string {
  if (!draft) return "Kathmandu, Nepal"
  if (draft.district && draft.province) {
    return `${draft.district}, ${draft.province}`
  }
  if (draft.fullAddress?.trim()) return draft.fullAddress.trim()
  return "Kathmandu, Nepal"
}

export function subscriptionToHomeOrganization(
  subscription: Subscription,
  location?: string
): HomeOrganization {
  return {
    ...subscription,
    location:
      location ??
      organizationLocations[subscription.companyId] ??
      "Kathmandu, Nepal",
  }
}

function readAddedOrganizations(): HomeOrganization[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(ADDED_ORGS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as HomeOrganization[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAddedOrganizations(orgs: HomeOrganization[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(ADDED_ORGS_KEY, JSON.stringify(orgs))
  window.dispatchEvent(new Event(ADDED_ORGS_EVENT))
}

/** Persist an org created via Add Organization / onboarding. */
export function upsertAddedHomeOrganization(org: HomeOrganization) {
  const existing = readAddedOrganizations()
  const without = existing.filter((item) => item.companyId !== org.companyId)
  writeAddedOrganizations([org, ...without])
}

export function upsertHomeOrganizationFromSubscription(
  subscription: Subscription,
  location?: string
) {
  upsertAddedHomeOrganization(
    subscriptionToHomeOrganization(subscription, location)
  )
}

/**
 * Ensure the latest workspace subscription from onboarding is on the home list.
 * Safe to call on admin home mount.
 */
export function syncWorkspaceOrgIntoHomeOrganizations(
  location?: string
): HomeOrganization | null {
  const workspace = loadWorkspaceSubscriptionClient()
  if (!workspace?.companyId) return null

  const alreadySeeded = homeOrganizations.some(
    (org) => org.companyId === workspace.companyId
  )
  if (alreadySeeded) return null

  const org = subscriptionToHomeOrganization(workspace, location)
  upsertAddedHomeOrganization(org)
  return org
}

/** Mock seed orgs plus any orgs added locally (newest first). */
export function getHomeOrganizations(): HomeOrganization[] {
  const added = readAddedOrganizations()
  const addedIds = new Set(added.map((org) => org.companyId))
  const seeded = homeOrganizations.filter((org) => !addedIds.has(org.companyId))
  return [...added, ...seeded]
}

export function getHomeOrganizationByCompanyId(
  companyId: string
): HomeOrganization | undefined {
  return getHomeOrganizations().find((org) => org.companyId === companyId)
}

export function subscribeHomeOrganizations(listener: () => void) {
  if (typeof window === "undefined") return () => {}

  const onStorage = (event: StorageEvent) => {
    if (event.key === ADDED_ORGS_KEY || event.key === null) listener()
  }

  window.addEventListener("storage", onStorage)
  window.addEventListener(ADDED_ORGS_EVENT, listener)
  return () => {
    window.removeEventListener("storage", onStorage)
    window.removeEventListener(ADDED_ORGS_EVENT, listener)
  }
}
