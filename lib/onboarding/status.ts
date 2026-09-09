/**
 * Onboarding state machine.
 * After OTP: Company → Plan/Payment → complete.
 * Quick branch setup is temporary and opened from Branch Management.
 * `users_pending` / `branches_pending` are legacy statuses.
 */

export const ONBOARDING_STATUSES = [
  "account_verified",
  "plan_pending",
  "payment_pending",
  "plan_active",
  "company_pending",
  "branches_pending",
  "users_pending",
  "complete",
] as const

export type OnboardingStatus = (typeof ONBOARDING_STATUSES)[number]

/** Steps shown in the onboarding stepper: Company → Payment. */
export type SetupStepId = "company" | "plan"

export const SETUP_STEPS: { id: SetupStepId; label: string }[] = [
  { id: "company", label: "Company" },
  { id: "plan", label: "Payment" },
]

export function isOnboardingComplete(status: OnboardingStatus): boolean {
  // branches_pending is legacy (quick branch setup left the onboarding flow)
  return (
    status === "complete" ||
    status === "users_pending" ||
    status === "branches_pending"
  )
}

export function isPlanOrPaymentPath(pathname: string): boolean {
  return (
    pathname.includes("/onboarding/plan") ||
    pathname.includes("/onboarding/payment")
  )
}

export function isSetupPath(pathname: string): boolean {
  return (
    pathname.includes("/onboarding/company") ||
    pathname.includes("/onboarding/plan")
  )
}

/**
 * Setup stepper index: 0=company, 1=plan/payment.
 * Returns -1 outside the stepper.
 */
export function setupStepIndexFromPath(pathname: string): number {
  if (pathname.includes("/plan") || pathname.includes("/payment")) return 1
  if (pathname.includes("/company")) return 0
  return -1
}

/** Highest setup step index the user may open. */
export function maxReachableSetupStepIndex(status: OnboardingStatus): number {
  switch (status) {
    case "account_verified":
    case "company_pending":
      return 0
    case "plan_pending":
    case "payment_pending":
    case "plan_active":
      return 1
    case "branches_pending":
    case "users_pending":
    case "complete":
      return 1
    default:
      return -1
  }
}

export function isSetupStepComplete(
  status: OnboardingStatus,
  stepIndex: number
): boolean {
  if (isOnboardingComplete(status) || status === "plan_active") return true
  if (
    status === "plan_pending" ||
    status === "payment_pending" ||
    status === "branches_pending"
  ) {
    return stepIndex < 1
  }
  return false
}

export function canAccessSetupStep(
  status: OnboardingStatus,
  stepIndex: number
): boolean {
  if (isOnboardingComplete(status)) return true
  const max = maxReachableSetupStepIndex(status)
  if (max < 0) return false
  return stepIndex <= max
}

/** Whether the user may open plan/payment routes. */
export function canAccessPlanFlow(status: OnboardingStatus): boolean {
  return (
    status === "plan_pending" ||
    status === "payment_pending" ||
    status === "plan_active" ||
    status === "branches_pending" ||
    isOnboardingComplete(status)
  )
}

/** Canonical resume route for the current status. */
export function resumePathForStatus(
  status: OnboardingStatus,
  email?: string | null
): string {
  const q =
    email && email.trim()
      ? `?email=${encodeURIComponent(email.trim())}`
      : ""

  switch (status) {
    case "account_verified":
    case "company_pending":
      return `/onboarding/company${q}`
    case "plan_pending":
    case "payment_pending":
      return `/onboarding/plan${q}`
    case "plan_active":
      // Legacy mid-flow after payment before company was first; finish company if needed
      return `/onboarding/company${q}`
    case "branches_pending":
      // Legacy: skip quick branch setup in onboarding
      return "/"
    case "users_pending":
    case "complete":
      return "/"
    default:
      return `/onboarding/company${q}`
  }
}

export function pathForSetupStep(
  step: SetupStepId,
  email?: string | null
): string {
  const q =
    email && email.trim()
      ? `?email=${encodeURIComponent(email.trim())}`
      : ""
  return `/onboarding/${step}${q}`
}

export function isOnboardingPath(pathname: string): boolean {
  return pathname.startsWith("/onboarding")
}

export function isAppShellPath(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/inventory") ||
    pathname.startsWith("/purchase") ||
    pathname.startsWith("/sales") ||
    pathname.startsWith("/accounting") ||
    pathname.startsWith("/configurations") ||
    pathname.startsWith("/settings")
  )
}

export function parseOnboardingStatus(
  value: unknown
): OnboardingStatus | null {
  if (
    typeof value === "string" &&
    (ONBOARDING_STATUSES as readonly string[]).includes(value)
  ) {
    return value as OnboardingStatus
  }
  return null
}

/** @deprecated Use setupStepIndexFromPath — kept for gradual migration */
export function stepIndexFromPath(pathname: string): number {
  return setupStepIndexFromPath(pathname)
}

/** @deprecated Use maxReachableSetupStepIndex */
export function maxReachableStepIndex(status: OnboardingStatus): number {
  return Math.max(0, maxReachableSetupStepIndex(status))
}

/** @deprecated Use isSetupStepComplete */
export function isStepComplete(
  status: OnboardingStatus,
  stepIndex: number
): boolean {
  return isSetupStepComplete(status, stepIndex)
}

/** @deprecated Use canAccessSetupStep */
export function canAccessStep(
  status: OnboardingStatus,
  stepIndex: number
): boolean {
  return canAccessSetupStep(status, stepIndex)
}

/** @deprecated Use pathForSetupStep */
export function pathForStep(
  step: "plan" | SetupStepId,
  email?: string | null
): string {
  if (step === "plan") {
    const q =
      email && email.trim()
        ? `?email=${encodeURIComponent(email.trim())}`
        : ""
    return `/onboarding/plan${q}`
  }
  return pathForSetupStep(step, email)
}

export type OnboardingStepId = SetupStepId
