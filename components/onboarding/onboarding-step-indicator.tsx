"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"

import {
  fetchOnboardingSession,
  loadOnboardingSessionClient,
} from "@/lib/onboarding/client-session"
import {
  SETUP_STEPS,
  canAccessSetupStep,
  isSetupStepComplete,
  pathForSetupStep,
  setupStepIndexFromPath,
  type OnboardingStatus,
} from "@/lib/onboarding/status"
import { cn } from "@/lib/utils"

/** Post-account setup stepper: Payment → Company */
export function OnboardingStepIndicator() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const emailFromQuery = searchParams.get("email")?.trim()

  const [status, setStatus] = React.useState<OnboardingStatus>("plan_pending")
  const [email, setEmail] = React.useState(emailFromQuery ?? "")

  React.useEffect(() => {
    const local = loadOnboardingSessionClient()
    if (local) {
      setStatus(local.status)
      setEmail(local.email || emailFromQuery || "")
    }
    fetchOnboardingSession().then((session) => {
      if (!session) return
      setStatus(session.status)
      setEmail(session.email || emailFromQuery || "")
    })
  }, [emailFromQuery, pathname])

  const activeIndex = setupStepIndexFromPath(pathname)

  return (
    <nav aria-label="Workspace setup steps" className="flex items-center gap-2">
      {SETUP_STEPS.map((step, index) => {
        const isActive = index === activeIndex
        const isComplete = isSetupStepComplete(status, index)
        const canLink =
          isComplete ||
          (index < activeIndex && canAccessSetupStep(status, index))

        const href = pathForSetupStep(step.id, email || emailFromQuery)

        const content = (
          <>
            <span
              className={cn(
                "flex size-6 items-center justify-center rounded-full text-xs font-semibold",
                isActive && "bg-primary text-primary-foreground",
                isComplete && !isActive && "bg-primary/15 text-primary",
                !isActive && !isComplete && "bg-muted text-muted-foreground"
              )}
            >
              {index + 1}
            </span>
            <span
              className={cn(
                "hidden text-sm font-medium sm:inline",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </>
        )

        return (
          <div key={step.id} className="flex items-center gap-2">
            {index > 0 ? (
              <span
                className="mx-1 h-px w-4 bg-border sm:w-8"
                aria-hidden
              />
            ) : null}
            {canLink ? (
              <Link
                href={href}
                className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
              >
                {content}
              </Link>
            ) : (
              <div className="flex items-center gap-2">{content}</div>
            )}
          </div>
        )
      })}
    </nav>
  )
}
