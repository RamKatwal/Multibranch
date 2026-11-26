import { NextResponse } from "next/server"

import {
  readOnboardingSession,
  writeOnboardingSession,
} from "@/lib/onboarding/server-session"
import { createEmptyOnboardingSession } from "@/lib/onboarding/session-types"
import { parseOnboardingStatus } from "@/lib/onboarding/status"

export async function GET() {
  const session = await readOnboardingSession()
  return NextResponse.json({ session })
}

export async function PUT(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    email?: string
    status?: string
  } | null

  const email = body?.email?.trim().toLowerCase()
  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 })
  }

  const status = parseOnboardingStatus(body?.status) ?? "plan_pending"
  const existing = await readOnboardingSession()
  const session =
    existing && existing.email === email
      ? { ...existing, status, updatedAt: new Date().toISOString() }
      : createEmptyOnboardingSession(email, status)

  await writeOnboardingSession(session)
  return NextResponse.json({ session })
}
