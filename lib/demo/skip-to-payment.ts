import { DEMO_SIGNUP } from "@/lib/demo/signup"
import {
  apiJson,
  saveAuthSessionClient,
  saveOnboardingSessionClient,
} from "@/lib/onboarding/client-session"
import { DEFAULT_PAYMENT_METHOD_ID } from "@/lib/onboarding/plans"
import type {
  AuthSessionData,
  OnboardingSessionData,
} from "@/lib/onboarding/session-types"
import {
  savePlanSelection,
  type OnboardingPlanSelection,
} from "@/lib/onboarding/storage"

/** Demo paid plan used by the "Skip to payment" shortcut. */
export const DEMO_PLAN: OnboardingPlanSelection = {
  planId: "standard",
  users: 3,
  period: "monthly",
  branchesEnabled: true,
  branchCount: 2,
  moduleIds: ["e_billings"],
  paymentMethod: DEFAULT_PAYMENT_METHOD_ID,
}

/**
 * Runs verification and the plan step (step 1) with demo data (same API
 * calls as the real screens) and returns the checkout URL. Company setup
 * (step 2) follows payment and has its own demo fill.
 */
export async function skipToPayment(): Promise<string> {
  const auth = await apiJson<{
    auth: AuthSessionData
    session: OnboardingSessionData
  }>("/api/auth/session", {
    method: "POST",
    body: JSON.stringify({ email: DEMO_SIGNUP.email }),
  })
  saveAuthSessionClient(auth.auth)
  saveOnboardingSessionClient(auth.session)

  savePlanSelection(DEMO_PLAN)
  const planRes = await apiJson<{ session: OnboardingSessionData }>(
    "/api/onboarding/plan",
    {
      method: "POST",
      body: JSON.stringify({ plan: DEMO_PLAN, activateFree: false }),
    }
  )
  saveOnboardingSessionClient(planRes.session)

  const payRes = await apiJson<{
    session: OnboardingSessionData
    checkoutUrl: string | null
  }>("/api/onboarding/payment/initiate", {
    method: "POST",
    body: JSON.stringify({ returnBase: window.location.origin }),
  })
  saveOnboardingSessionClient(payRes.session)
  if (!payRes.checkoutUrl) throw new Error("Could not start checkout.")
  return payRes.checkoutUrl
}
