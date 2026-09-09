"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { Spinner } from "@/components/ui/spinner"
import { homeAfterOrgCreated } from "@/lib/organizations/home-after-created"
import {
  apiJson,
  saveOnboardingSessionClient,
} from "@/lib/onboarding/client-session"
import type { OnboardingSessionData } from "@/lib/onboarding/session-types"
import {
  isOnboardingComplete,
  resumePathForStatus,
} from "@/lib/onboarding/status"

/** Handles gateway return URLs: /onboarding/payment/return?intent=…&status=success|failed */
export default function PaymentReturnClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const intentId = searchParams.get("intent")?.trim() ?? ""
  const statusParam = searchParams.get("status")?.trim() ?? "failed"
  const [message, setMessage] = React.useState("Confirming payment…")

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      const outcome = statusParam === "success" ? "success" : "failed"
      try {
        await apiJson("/api/onboarding/payment/webhook", {
          method: "POST",
          body: JSON.stringify({
            intentId,
            status: outcome === "success" ? "success" : "failed",
            secret: "providhy_demo_webhook",
          }),
        })

        const confirmed = await apiJson<{ session: OnboardingSessionData }>(
          "/api/onboarding/payment/confirm",
          {
            method: "POST",
            body: JSON.stringify({ intentId, outcome, source: "return" }),
          }
        )

        if (cancelled) return
        saveOnboardingSessionClient(confirmed.session)
        if (outcome === "success" && isOnboardingComplete(confirmed.session.status)) {
          router.replace(homeAfterOrgCreated(confirmed.session.companyId))
          return
        }
        const path = resumePathForStatus(
          confirmed.session.status,
          confirmed.session.email
        )
        const withFlag =
          outcome === "failed"
            ? path.includes("?")
              ? `${path}&payment=failed`
              : `${path}?payment=failed`
            : path
        router.replace(withFlag)
      } catch {
        if (cancelled) return
        setMessage("Payment confirmation failed. Redirecting…")
        router.replace("/onboarding/plan?payment=failed")
      }
    })()
    return () => {
      cancelled = true
    }
  }, [intentId, router, statusParam])

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24">
      <Spinner size={24} variant="default" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
