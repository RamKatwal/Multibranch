"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  apiJson,
  loadOnboardingSessionClient,
  saveOnboardingSessionClient,
} from "@/lib/onboarding/client-session"
import {
  locationFromCompanyDraft,
  upsertHomeOrganizationFromSubscription,
} from "@/lib/organizations/home-organizations"
import {
  entitlementToSubscription,
  loadEntitlementClient,
  loadWorkspaceSubscriptionClient,
  saveEntitlementClient,
  saveWorkspaceSubscriptionClient,
} from "@/lib/onboarding/entitlement"
import {
  DEFAULT_PAYMENT_METHOD_ID,
  PLANS,
  calculatePricing,
  formatNpr,
  type PlanId,
} from "@/lib/onboarding/plans"
import type { OnboardingSessionData } from "@/lib/onboarding/session-types"
import {
  DEFAULT_PLAN_SELECTION,
  type OnboardingPlanSelection,
} from "@/lib/onboarding/storage"
import { persistBranchLimit } from "@/lib/branches/subscription"
import { cn } from "@/lib/utils"

const UPGRADE_PLANS = PLANS.filter((p) => p.id !== "free_trial")

/**
 * Post-onboarding Free → Paid upgrade.
 * Does not re-run company or branch setup.
 */
export function BillingPlansUpgradePanel() {
  const [entitlement, setEntitlement] = React.useState(() =>
    loadEntitlementClient()
  )
  const [subscription, setSubscription] = React.useState(() =>
    loadWorkspaceSubscriptionClient()
  )
  const [planId, setPlanId] = React.useState<PlanId>("standard")
  const [users, setUsers] = React.useState(3)
  const [isLoading, setIsLoading] = React.useState(false)
  const [message, setMessage] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const session = loadOnboardingSessionClient()
    if (session?.entitlement) {
      setEntitlement(session.entitlement)
    }
  }, [])

  const pricing = calculatePricing({
    planId,
    users,
    period: "monthly",
    branchesEnabled: true,
    branchCount: Math.max(entitlement?.branchCount ?? 1, 2),
    moduleIds: [],
  })

  const isTrial = entitlement?.isTrial ?? true
  const alreadyPaid = entitlement && !entitlement.isTrial

  async function handleUpgrade() {
    setIsLoading(true)
    setError(null)
    setMessage(null)

    const plan: OnboardingPlanSelection = {
      ...DEFAULT_PLAN_SELECTION,
      planId,
      users,
      period: "monthly",
      branchesEnabled: true,
      branchCount: Math.max(entitlement?.branchCount ?? 1, 2),
      moduleIds: [],
      paymentMethod: DEFAULT_PAYMENT_METHOD_ID,
    }

    try {
      const res = await apiJson<{
        session: OnboardingSessionData
      }>("/api/onboarding/upgrade", {
        method: "POST",
        body: JSON.stringify({ plan, paymentOutcome: "success" }),
      })

      saveOnboardingSessionClient(res.session)
      if (res.session.entitlement) {
        saveEntitlementClient(res.session.entitlement)
        persistBranchLimit(res.session.entitlement.branchCount)
        setEntitlement(res.session.entitlement)

        if (res.session.companyId && res.session.company) {
          const sub = entitlementToSubscription(res.session.entitlement, {
            id: res.session.companyId,
            name: res.session.company.companyName,
            website: res.session.company.companyWebsite,
          })
          saveWorkspaceSubscriptionClient(sub)
          upsertHomeOrganizationFromSubscription(
            sub,
            locationFromCompanyDraft(res.session.company)
          )
          setSubscription(sub)
        }
      }

      setMessage(
        `Upgraded to ${res.session.entitlement?.planName ?? "paid plan"}. Company and branches were left unchanged.`
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upgrade failed.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-5 py-8 md:px-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Billing & Plans</h1>
        <p className="text-sm text-muted-foreground">
          Manage your subscription. Upgrading does not re-run company or branch
          setup.
        </p>
      </div>

      <div className="rounded-lg bg-card p-5 ring-1 ring-foreground/10">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Current plan
        </p>
        <p className="mt-1 text-lg font-semibold">
          {entitlement?.planName ?? subscription?.planName ?? "No plan linked"}
        </p>
        <p className="text-sm text-muted-foreground">
          {isTrial
            ? "Free trial — upgrade anytime without leaving your workspace."
            : alreadyPaid
              ? "Paid entitlement active."
              : "Complete onboarding to link a plan here."}
        </p>
        {subscription ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Subscription {subscription.id} · {subscription.usersLimit} users ·{" "}
            {subscription.branchesLimit} branches
          </p>
        ) : null}
      </div>

      {isTrial || !entitlement ? (
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold">Upgrade to a paid plan</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {UPGRADE_PLANS.map((plan) => {
              const selected = planId === plan.id
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setPlanId(plan.id)}
                  className={cn(
                    "rounded-lg bg-card p-4 text-left ring-1 ring-foreground/10 transition-colors",
                    selected ? "ring-2 ring-primary" : "hover:ring-foreground/20"
                  )}
                >
                  <p className="font-semibold">{plan.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatNpr(plan.monthlyPerUser)} / user / month
                  </p>
                </button>
              )
            })}
          </div>

          <label className="flex items-center justify-between gap-4 text-sm">
            <span className="font-medium">Users</span>
            <input
              type="number"
              min={1}
              value={users}
              onChange={(e) =>
                setUsers(Math.max(1, Number.parseInt(e.target.value, 10) || 1))
              }
              className="h-9 w-20 rounded-md border border-input bg-background px-2 text-sm tabular-nums"
            />
          </label>

          <p className="text-sm text-muted-foreground">
            Estimated total:{" "}
            <span className="font-semibold text-foreground">
              {formatNpr(pricing.total)}
            </span>{" "}
            / month (mock charge)
          </p>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {message ? <p className="text-sm text-primary">{message}</p> : null}

          <Button
            type="button"
            className="h-11 w-full sm:w-auto sm:self-start"
            disabled={isLoading}
            onClick={handleUpgrade}
          >
            {isLoading ? (
              <Spinner size={18} variant="default" />
            ) : (
              `Upgrade · Pay ${formatNpr(pricing.total)}`
            )}
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          You are already on a paid plan. Contact support to change tiers in a
          future release.
        </p>
      )}
    </div>
  )
}
