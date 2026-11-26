import { NextResponse } from "next/server"

import { buildEntitlementFromPlan } from "@/lib/onboarding/entitlement"
import {
  patchOnboardingSession,
  readOnboardingSession,
} from "@/lib/onboarding/server-session"

type ConfirmBody = {
  intentId?: string
  outcome?: "success" | "failed"
  /** When true, treat as gateway webhook (same logic, idempotent). */
  source?: "return" | "webhook"
}

async function confirmPayment(body: ConfirmBody) {
  const existing = await readOnboardingSession()
  if (!existing?.plan || !existing.payment) {
    return NextResponse.json(
      { error: "No pending payment to confirm." },
      { status: 400 }
    )
  }

  if (body.intentId && body.intentId !== existing.payment.id) {
    return NextResponse.json({ error: "Intent mismatch." }, { status: 400 })
  }

  // Idempotent success: already confirmed (plan_active legacy or complete)
  if (
    (existing.status === "plan_active" || existing.status === "complete") &&
    existing.payment.status === "confirmed"
  ) {
    return NextResponse.json({ session: existing, alreadyConfirmed: true })
  }

  const outcome = body.outcome ?? "failed"

  if (outcome === "failed") {
    const session = await patchOnboardingSession({
      payment: { ...existing.payment, status: "failed" },
      paymentSubStatus: "failed",
      status: "plan_pending",
    })
    return NextResponse.json({
      session,
      alreadyConfirmed: false,
      success: false,
    })
  }

  const entitlement = buildEntitlementFromPlan(existing.plan, {
    paymentMethod: existing.payment.method,
    subscriptionId: existing.entitlement?.subscriptionId,
  })

  const session = await patchOnboardingSession({
    payment: { ...existing.payment, status: "confirmed" },
    paymentSubStatus: "active",
    entitlement,
    // Payment step done; company setup is next
    status: "plan_active",
    ...(existing.status === "complete" ? { companyId: null } : {}),
  })

  return NextResponse.json({
    session,
    alreadyConfirmed: false,
    success: true,
  })
}

/** Browser return URL handler confirmation. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as ConfirmBody | null
  return confirmPayment(body ?? {})
}
