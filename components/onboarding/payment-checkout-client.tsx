"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { homeAfterOrgCreated } from "@/lib/organizations/home-after-created"
import {
  apiJson,
  saveOnboardingSessionClient,
} from "@/lib/onboarding/client-session"
import type { OnboardingSessionData } from "@/lib/onboarding/session-types"
import { formatNpr } from "@/lib/onboarding/plans"

/**
 * Mock eSewa / Fonepay checkout surface.
 * Success fires confirm + webhook; failure returns user to plan step.
 */
export default function PaymentCheckoutClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const intentId = searchParams.get("intent")?.trim() ?? ""

  const [session, setSession] = React.useState<OnboardingSessionData | null>(
    null
  )
  const [busy, setBusy] = React.useState<"success" | "fail" | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await apiJson<{ session: OnboardingSessionData | null }>(
          "/api/onboarding/status"
        )
        if (cancelled) return
        if (data.session) {
          saveOnboardingSessionClient(data.session)
          setSession(data.session)
        }
      } catch {
        if (!cancelled) setError("Could not load payment session.")
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function finish(outcome: "success" | "failed") {
    if (!intentId || busy) return
    setBusy(outcome === "success" ? "success" : "fail")
    setError(null)

    try {
      // Simulate provider webhook first (server of record)
      await apiJson("/api/onboarding/payment/webhook", {
        method: "POST",
        body: JSON.stringify({
          intentId,
          status: outcome === "success" ? "success" : "failed",
          secret: "providhy_demo_webhook",
        }),
      })

      const confirmed = await apiJson<{
        session: OnboardingSessionData
        success?: boolean
      }>("/api/onboarding/payment/confirm", {
        method: "POST",
        body: JSON.stringify({ intentId, outcome, source: "return" }),
      })

      saveOnboardingSessionClient(confirmed.session)

      if (outcome === "success") {
        router.replace(homeAfterOrgCreated(confirmed.session.companyId))
      } else {
        const email = confirmed.session.email
        const failQ = email
          ? `?email=${encodeURIComponent(email)}&payment=failed`
          : "?payment=failed"
        router.replace(`/onboarding/plan${failQ}`)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment confirmation failed.")
      setBusy(null)
    }
  }

  const payment = session?.payment
  const methodLabel =
    payment?.method === "fonepay"
      ? "Fonepay"
      : payment?.method === "esewa"
        ? "eSewa"
        : "Payment"

  if (!session && !error) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Spinner size={24} variant="default" />
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 py-16">
      <div className="flex flex-col gap-2 text-center">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Mock {methodLabel} checkout
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Complete payment
        </h1>
        <p className="text-sm text-muted-foreground">
          Demo gateway only — choose an outcome to continue onboarding.
        </p>
      </div>

      <div className="rounded-lg bg-card p-5 ring-1 ring-foreground/10">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Amount</span>
          <span className="font-semibold tabular-nums">
            {payment ? formatNpr(payment.amount) : "—"}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Intent</span>
          <span className="font-mono text-xs">{intentId || "—"}</span>
        </div>
      </div>

      {error ? <p className="text-center text-sm text-destructive">{error}</p> : null}

      <div className="flex flex-col gap-2.5">
        <Button
          type="button"
          className="h-11"
          disabled={!!busy || !intentId}
          onClick={() => finish("success")}
        >
          {busy === "success" ? (
            <Spinner size={18} variant="default" />
          ) : (
            "Simulate successful payment"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11"
          disabled={!!busy || !intentId}
          onClick={() => finish("failed")}
        >
          {busy === "fail" ? (
            <Spinner size={18} variant="default" />
          ) : (
            "Simulate failed / cancelled"
          )}
        </Button>
      </div>
    </div>
  )
}
