import { NextResponse } from "next/server"

import type { OnboardingCompanyDraft } from "@/lib/onboarding/company-storage"
import {
  patchOnboardingSession,
  readOnboardingSession,
} from "@/lib/onboarding/server-session"

function isCompanyDraft(value: unknown): value is OnboardingCompanyDraft {
  if (!value || typeof value !== "object") return false
  const v = value as Partial<OnboardingCompanyDraft>
  return Boolean(v.companyName && v.email && v.pan)
}

/** Save company draft / finalize company → plan_pending (payment step). */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    company?: OnboardingCompanyDraft
    finalize?: boolean
  } | null

  if (!isCompanyDraft(body?.company)) {
    return NextResponse.json(
      { error: "Valid company details are required." },
      { status: 400 }
    )
  }

  const existing = await readOnboardingSession()
  if (!existing) {
    return NextResponse.json({ error: "No onboarding session." }, { status: 401 })
  }

  if (
    existing.status !== "account_verified" &&
    existing.status !== "company_pending" &&
    existing.status !== "plan_pending" &&
    existing.status !== "payment_pending" &&
    existing.status !== "plan_active" &&
    existing.status !== "branches_pending" &&
    existing.status !== "users_pending" &&
    existing.status !== "complete"
  ) {
    return NextResponse.json(
      { error: "Verify your account before creating a company." },
      { status: 403 }
    )
  }

  // Idempotent company id — keep existing when re-saving during onboarding
  const companyId =
    existing.status === "complete" && body?.finalize
      ? `comp_${body.company.pan.replace(/\W/g, "").toLowerCase() || Date.now().toString(36)}`
      : existing.companyId ??
        `comp_${body.company.pan.replace(/\W/g, "").toLowerCase() || Date.now().toString(36)}`

  // Company is step 2: finalizing after payment finishes onboarding
  const nextStatus =
    existing.status === "complete" || existing.status === "users_pending"
      ? "complete"
      : existing.status === "plan_active" ||
          existing.status === "company_pending"
        ? body?.finalize === false
          ? "company_pending"
          : "complete"
        : existing.status

  const session = await patchOnboardingSession({
    company: body.company,
    companyId,
    status: nextStatus,
  })

  return NextResponse.json({ session })
}

export async function GET() {
  const session = await readOnboardingSession()
  return NextResponse.json({
    company: session?.company ?? null,
    companyId: session?.companyId ?? null,
  })
}
