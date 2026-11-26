import { NextResponse } from "next/server"

import { buildEntitlementFromPlan } from "@/lib/onboarding/entitlement"
import {
  patchOnboardingSession,
  readOnboardingSession,
} from "@/lib/onboarding/server-session"
import type { OnboardingPlanSelection } from "@/lib/onboarding/storage"
import { calculatePricing } from "@/lib/onboarding/plans"

function isPlanSelection(value: unknown): value is OnboardingPlanSelection {
  if (!value || typeof value !== "object") return false
  const v = value as Partial<OnboardingPlanSelection>
  return typeof v.planId === "string" && typeof v.users === "number"
}

/** Activate free plan or persist paid selection before checkout. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    plan?: OnboardingPlanSelection
    activateFree?: boolean
  } | null

  if (!isPlanSelection(body?.plan)) {
    return NextResponse.json({ error: "Valid plan is required" }, { status: 400 })
  }

  const existing = await readOnboardingSession()
  if (!existing) {
    return NextResponse.json(
      { error: "No onboarding session. Verify your email first." },
      { status: 401 }
    )
  }

  const plan = body.plan
  const pricing = calculatePricing({
    planId: plan.planId,
    users: plan.planId === "free_trial" ? 1 : plan.users,
    period: plan.period,
    branchesEnabled:
      plan.planId === "free_trial" ? false : plan.branchesEnabled,
    branchCount: plan.branchCount,
    moduleIds: plan.planId === "free_trial" ? [] : plan.moduleIds,
  })

  if (pricing.isFree || body?.activateFree) {
    // Idempotent: reuse existing entitlement subscription id if already trial
    const existingSubId =
      existing.entitlement?.isTrial && existing.entitlement.planId === plan.planId
        ? existing.entitlement.subscriptionId
        : undefined
    const entitlement = buildEntitlementFromPlan(plan, {
      paymentMethod: null,
      subscriptionId: existingSubId,
    })

    const session = await patchOnboardingSession({
      plan,
      entitlement,
      payment: null,
      paymentSubStatus: "active",
      // Payment step done; company setup is next
      status: "plan_active",
      // Adding another organization: the company step creates a new one
      ...(existing.status === "complete" ? { companyId: null } : {}),
    })

    return NextResponse.json({ session, checkoutRequired: false })
  }

  const session = await patchOnboardingSession({
    plan,
    paymentSubStatus: "selecting",
    status: "plan_pending",
  })

  return NextResponse.json({ session, checkoutRequired: true })
}
