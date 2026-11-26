import { NextResponse } from "next/server"

import { buildEntitlementFromPlan } from "@/lib/onboarding/entitlement"
import {
  patchOnboardingSession,
  readOnboardingSession,
} from "@/lib/onboarding/server-session"

/**
 * Mock payment provider webhook.
 * Idempotent: repeated success callbacks do not re-create entitlement.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    intentId?: string
    status?: "success" | "failed"
    secret?: string
  } | null

  // Demo webhook secret (optional)
  if (body?.secret && body.secret !== "providhy_demo_webhook") {
    return NextResponse.json({ error: "Invalid webhook secret" }, { status: 401 })
  }

  const existing = await readOnboardingSession()
  if (!existing?.payment) {
    return NextResponse.json({ ok: true, ignored: true })
  }

  if (body?.intentId && body.intentId !== existing.payment.id) {
    return NextResponse.json({ ok: true, ignored: true })
  }

  if (
    existing.payment.status === "confirmed" &&
    (existing.status === "plan_active" || existing.status === "complete")
  ) {
    return NextResponse.json({ ok: true, alreadyConfirmed: true })
  }

  if (body?.status === "failed") {
    await patchOnboardingSession({
      payment: { ...existing.payment, status: "failed" },
      paymentSubStatus: "failed",
      status: "plan_pending",
    })
    return NextResponse.json({ ok: true, success: false })
  }

  if (!existing.plan) {
    return NextResponse.json({ error: "Missing plan" }, { status: 400 })
  }

  const entitlement = buildEntitlementFromPlan(existing.plan, {
    paymentMethod: existing.payment.method,
    subscriptionId: existing.entitlement?.subscriptionId,
  })

  await patchOnboardingSession({
    payment: { ...existing.payment, status: "confirmed" },
    paymentSubStatus: "active",
    entitlement,
    // Payment step done; company setup is next
    status: "plan_active",
    ...(existing.status === "complete" ? { companyId: null } : {}),
  })

  return NextResponse.json({ ok: true, success: true })
}
