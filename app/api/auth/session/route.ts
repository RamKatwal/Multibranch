import { NextResponse } from "next/server"

import { DEMO_ADMIN, DEMO_USER } from "@/lib/demo/auth"
import {
  readAuthSession,
  readOnboardingSession,
  writeAuthSession,
  writeOnboardingSession,
} from "@/lib/onboarding/server-session"
import {
  createEmptyOnboardingSession,
  type AuthSessionData,
} from "@/lib/onboarding/session-types"

/** Create / refresh auth session after signup verification or sign-in. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    email?: string
    name?: string
    /** When true, mark onboarding complete (demo admin). */
    completeOnboarding?: boolean
  } | null

  const email = body?.email?.trim().toLowerCase()
  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 })
  }

  const auth: AuthSessionData = {
    email,
    name: body?.name,
    verifiedAt: new Date().toISOString(),
  }
  await writeAuthSession(auth)

  const isDemoAdmin = email === DEMO_ADMIN.email.toLowerCase()
  const isDemoUser = email === DEMO_USER.email.toLowerCase()
  const existing = await readOnboardingSession()

  if (body?.completeOnboarding || isDemoAdmin || isDemoUser) {
    const session =
      existing && existing.email === email
        ? { ...existing, status: "complete" as const, updatedAt: new Date().toISOString() }
        : createEmptyOnboardingSession(email, "complete")
    await writeOnboardingSession(session)
    return NextResponse.json({ auth, session })
  }

  // Do not downgrade an in-progress onboarding status on re-auth
  if (existing && existing.email === email) {
    return NextResponse.json({ auth, session: existing })
  }

  const session = createEmptyOnboardingSession(email, "plan_pending")
  await writeOnboardingSession(session)
  return NextResponse.json({ auth, session })
}

export async function GET() {
  const auth = await readAuthSession()
  return NextResponse.json({ auth })
}
