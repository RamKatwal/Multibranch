import type {
  AdditionalModuleId,
  PaymentMethodId,
  PaymentPeriod,
  PlanId,
} from "@/lib/onboarding/plans"
import type { OnboardingCompanyDraft } from "@/lib/onboarding/company-storage"
import type { OnboardingPlanSelection } from "@/lib/onboarding/storage"
import type { OnboardingStatus } from "@/lib/onboarding/status"

export const ONBOARDING_SESSION_COOKIE = "providhy_onboarding"
export const AUTH_SESSION_COOKIE = "providhy_auth"
export const ONBOARDING_SESSION_STORAGE_KEY = "providhy_onboarding_session"
export const AUTH_SESSION_STORAGE_KEY = "providhy_auth_session"

export type PaymentSubStatus =
  | "idle"
  | "selecting"
  | "checkout"
  | "confirming"
  | "active"
  | "failed"

export type OnboardingPaymentIntent = {
  id: string
  amount: number
  currency: "NPR"
  method: PaymentMethodId
  planId: PlanId
  createdAt: string
  /** Mock gateway outcome pending until confirm/webhook */
  status: "pending" | "confirmed" | "failed" | "expired"
}

export type OnboardingEntitlement = {
  planId: PlanId
  planName: string
  isTrial: boolean
  users: number
  branchCount: number
  moduleIds: AdditionalModuleId[]
  period: PaymentPeriod
  paymentMethod: PaymentMethodId | null
  activatedAt: string
  /** Stable id for idempotent subscription writes */
  subscriptionId: string
}

export type OnboardingUserInvite = {
  id: string
  name: string
  email: string
  role: "admin" | "member"
}

export type OnboardingUsersDraft = {
  ownerName: string
  ownerEmail: string
  ownerPhone?: string
  invites: OnboardingUserInvite[]
}

export type OnboardingSessionData = {
  email: string
  status: OnboardingStatus
  plan: OnboardingPlanSelection | null
  company: OnboardingCompanyDraft | null
  users: OnboardingUsersDraft | null
  payment: OnboardingPaymentIntent | null
  paymentSubStatus: PaymentSubStatus
  entitlement: OnboardingEntitlement | null
  companyId: string | null
  /** Prevents duplicate org provisioning */
  provisionToken: string | null
  updatedAt: string
}

export type AuthSessionData = {
  email: string
  name?: string
  verifiedAt: string
}

export function createEmptyOnboardingSession(
  email: string,
  status: OnboardingStatus = "plan_pending"
): OnboardingSessionData {
  return {
    email: email.trim().toLowerCase(),
    status,
    plan: null,
    company: null,
    users: null,
    payment: null,
    paymentSubStatus: "idle",
    entitlement: null,
    companyId: null,
    provisionToken: null,
    updatedAt: new Date().toISOString(),
  }
}

export {
  encodeCookieValue as encodeCookiePayload,
  decodeCookieValue as decodeCookiePayload,
} from "@/lib/onboarding/cookie-codec"
