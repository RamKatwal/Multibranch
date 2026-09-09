import {
  AUTH_SESSION_STORAGE_KEY,
  ONBOARDING_SESSION_STORAGE_KEY,
  createEmptyOnboardingSession,
  type AuthSessionData,
  type OnboardingSessionData,
} from "@/lib/onboarding/session-types"
import { parseOnboardingStatus } from "@/lib/onboarding/status"
import {
  saveCompanyDraft,
  clearCompanyDraft,
  type OnboardingCompanyDraft,
} from "@/lib/onboarding/company-storage"
import {
  savePlanSelection,
  clearPlanSelection,
  type OnboardingPlanSelection,
} from "@/lib/onboarding/storage"
import {
  saveEntitlementClient,
  saveWorkspaceSubscriptionClient,
  entitlementToSubscription,
} from "@/lib/onboarding/entitlement"
import { persistBranchLimit } from "@/lib/branches/subscription"
import {
  locationFromCompanyDraft,
  upsertHomeOrganizationFromSubscription,
} from "@/lib/organizations/home-organizations"

/** Mirror server cookie session into localStorage for resume + optimistic UX. */
export function saveOnboardingSessionClient(
  session: OnboardingSessionData
): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(
      ONBOARDING_SESSION_STORAGE_KEY,
      JSON.stringify(session)
    )
  } catch {
    // ignore
  }

  if (session.plan) savePlanSelection(session.plan)
  if (session.company) saveCompanyDraft(session.company)
  if (session.entitlement) {
    saveEntitlementClient(session.entitlement)
    if (session.companyId && session.company) {
      const subscription = entitlementToSubscription(session.entitlement, {
        id: session.companyId,
        name: session.company.companyName,
        website: session.company.companyWebsite,
      })
      saveWorkspaceSubscriptionClient(subscription)
      upsertHomeOrganizationFromSubscription(
        subscription,
        locationFromCompanyDraft(session.company)
      )
    }
    persistBranchLimit(session.entitlement.branchCount)
  }
}

export function loadOnboardingSessionClient(): OnboardingSessionData | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(ONBOARDING_SESSION_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as OnboardingSessionData
    if (!parsed?.email || !parseOnboardingStatus(parsed.status)) return null
    return parsed
  } catch {
    return null
  }
}

export function clearOnboardingDraftsClient(): void {
  clearPlanSelection()
  clearCompanyDraft()
}

export function saveAuthSessionClient(auth: AuthSessionData): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(auth))
  } catch {
    // ignore
  }
}

export function loadAuthSessionClient(): AuthSessionData | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthSessionData
  } catch {
    return null
  }
}

export async function fetchOnboardingSession(): Promise<OnboardingSessionData | null> {
  const res = await fetch("/api/onboarding/status", { credentials: "include" })
  if (!res.ok) return null
  const data = (await res.json()) as { session: OnboardingSessionData | null }
  if (data.session) saveOnboardingSessionClient(data.session)
  return data.session
}

/** Push localStorage session into httpOnly cookie when cookie is missing/stale. */
export async function restoreOnboardingSessionFromClient(): Promise<OnboardingSessionData | null> {
  const local = loadOnboardingSessionClient()
  if (!local) return fetchOnboardingSession()

  try {
    const res = await apiJson<{ session: OnboardingSessionData }>(
      "/api/onboarding/session/restore",
      {
        method: "POST",
        body: JSON.stringify({ session: local }),
      }
    )
    saveOnboardingSessionClient(res.session)
    return res.session
  } catch {
    return fetchOnboardingSession()
  }
}

export async function apiJson<T>(
  url: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  })
  const body = (await res.json().catch(() => ({}))) as T & { error?: string }
  if (!res.ok) {
    throw new Error(
      typeof body === "object" && body && "error" in body && body.error
        ? String(body.error)
        : `Request failed (${res.status})`
    )
  }
  return body
}

export function ensureClientSession(
  email: string,
  status: OnboardingSessionData["status"] = "company_pending"
): OnboardingSessionData {
  const existing = loadOnboardingSessionClient()
  if (existing && existing.email === email.trim().toLowerCase()) {
    return existing
  }
  const created = createEmptyOnboardingSession(email, status)
  saveOnboardingSessionClient(created)
  return created
}

export type { OnboardingCompanyDraft, OnboardingPlanSelection }
