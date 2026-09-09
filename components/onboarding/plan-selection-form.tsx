"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Add01Icon,
  Remove01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { ChevronDown } from "lucide-react"

import { PlanCompareDialog } from "@/components/onboarding/plan-compare-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import {
  ADDITIONAL_MODULES,
  calculatePricing,
  DEFAULT_PAYMENT_METHOD_ID,
  formatNpr,
  PERIOD_MONTH_MULTIPLIER,
  PAYMENT_METHODS,
  PAYMENT_PERIODS,
  PLANS,
  type AdditionalModuleId,
  type PaymentMethodId,
  type PaymentPeriod,
  type PlanId,
} from "@/lib/onboarding/plans"
import { homeAfterOrgCreated } from "@/lib/organizations/home-after-created"
import {
  apiJson,
  restoreOnboardingSessionFromClient,
  saveOnboardingSessionClient,
} from "@/lib/onboarding/client-session"
import type { OnboardingSessionData } from "@/lib/onboarding/session-types"
import {
  DEFAULT_PLAN_SELECTION,
  loadPlanSelection,
  savePlanSelection,
  type OnboardingPlanSelection,
} from "@/lib/onboarding/storage"
import { cn } from "@/lib/utils"

function NumberStepper({
  label,
  value,
  min = 1,
  onChange,
}: {
  label: string
  value: number
  min?: number
  onChange: (value: number) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label={`Decrease ${label}`}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          <HugeiconsIcon icon={Remove01Icon} className="size-3.5" />
        </Button>
        <span className="min-w-8 text-center text-sm font-semibold tabular-nums">
          {value}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label={`Increase ${label}`}
          onClick={() => onChange(value + 1)}
        >
          <HugeiconsIcon icon={Add01Icon} className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}

export default function PlanSelectionForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")?.trim() ?? ""

  const [selection, setSelection] =
    React.useState<OnboardingPlanSelection>(DEFAULT_PLAN_SELECTION)
  const [hydrated, setHydrated] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [paymentError, setPaymentError] = React.useState<string | null>(null)
  const [compareOpen, setCompareOpen] = React.useState(false)
  const [paymentSubStatus, setPaymentSubStatus] = React.useState<
    "idle" | "selecting" | "checkout" | "confirming" | "active" | "failed"
  >("idle")

  React.useEffect(() => {
    const paymentFlag = searchParams.get("payment")
    if (paymentFlag === "failed") {
      setPaymentError("Payment was cancelled or failed. You can retry below.")
      setPaymentSubStatus("failed")
    }

    const stored = loadPlanSelection()
    if (stored) setSelection(stored)

    ;(async () => {
      try {
        const session = await restoreOnboardingSessionFromClient()
        if (session?.plan) {
          setSelection(session.plan)
          savePlanSelection(session.plan)
        }
        if (session?.paymentSubStatus) {
          setPaymentSubStatus(session.paymentSubStatus)
        }
        if (session) saveOnboardingSessionClient(session)
      } catch {
        // local draft is enough for demo resume within browser
      } finally {
        setHydrated(true)
      }
    })()
  }, [searchParams])

  const pricing = calculatePricing({
    planId: selection.planId,
    users: selection.planId === "free_trial" ? 1 : selection.users,
    period: selection.period,
    branchesEnabled:
      selection.planId === "free_trial" ? false : selection.branchesEnabled,
    branchCount: selection.branchCount,
    moduleIds: selection.planId === "free_trial" ? [] : selection.moduleIds,
  })

  const selectedPlan = PLANS.find((p) => p.id === selection.planId) ?? PLANS[0]
  const isFreeTrial = selection.planId === "free_trial"
  const selectedPeriodLabel =
    PAYMENT_PERIODS.find((p) => p.id === selection.period)?.label ?? "Monthly"

  const periodPriceHint =
    selectedPlan.monthlyPerUser === 0
      ? "Free"
      : `${formatNpr(
          selectedPlan.monthlyPerUser *
            selection.users *
            (PERIOD_MONTH_MULTIPLIER[selection.period] ?? 1)
        )} / ${pricing.periodLabel}`

  function update(partial: Partial<OnboardingPlanSelection>) {
    setSelection((prev) => ({ ...prev, ...partial }))
    setPaymentError(null)
  }

  function selectPlan(planId: PlanId) {
    if (planId === "free_trial") {
      update({
        planId,
        users: 1,
        branchesEnabled: false,
        branchCount: 1,
        moduleIds: [],
      })
      return
    }
    update({ planId })
  }

  function selectPeriod(period: PaymentPeriod) {
    update({ period })
  }

  function selectPayment(method: PaymentMethodId) {
    update({ paymentMethod: method })
  }

  function toggleModule(moduleId: AdditionalModuleId) {
    setSelection((prev) => {
      const exists = prev.moduleIds.includes(moduleId)
      return {
        ...prev,
        moduleIds: exists
          ? prev.moduleIds.filter((id) => id !== moduleId)
          : [...prev.moduleIds, moduleId],
      }
    })
    setPaymentError(null)
  }

  async function handleContinue() {
    if (!pricing.isFree && !selection.paymentMethod) {
      setPaymentError("Select eSewa or Fonepay to continue.")
      return
    }

    const payload: OnboardingPlanSelection = {
      ...selection,
      ...(selection.planId === "free_trial"
        ? {
            users: 1,
            branchesEnabled: false,
            branchCount: 1,
            moduleIds: [],
          }
        : {}),
      paymentMethod: selection.paymentMethod ?? DEFAULT_PAYMENT_METHOD_ID,
    }
    savePlanSelection(payload)
    setIsLoading(true)
    setPaymentError(null)
    setPaymentSubStatus(pricing.isFree ? "confirming" : "checkout")

    try {
      // Ensure session exists (verification should have created it)
      if (email) {
        await apiJson("/api/auth/session", {
          method: "POST",
          body: JSON.stringify({ email }),
        }).catch(() => null)
      }

      const planRes = await apiJson<{
        session: OnboardingSessionData
        checkoutRequired: boolean
      }>("/api/onboarding/plan", {
        method: "POST",
        body: JSON.stringify({
          plan: payload,
          activateFree: pricing.isFree,
        }),
      })
      saveOnboardingSessionClient(planRes.session)

      if (!planRes.checkoutRequired) {
        setPaymentSubStatus("active")
        router.push(homeAfterOrgCreated(planRes.session.companyId))
        return
      }

      const payRes = await apiJson<{
        session: OnboardingSessionData
        checkoutUrl: string | null
        alreadyActive?: boolean
      }>("/api/onboarding/payment/initiate", {
        method: "POST",
        body: JSON.stringify({ returnBase: window.location.origin }),
      })
      saveOnboardingSessionClient(payRes.session)

      if (payRes.alreadyActive) {
        setPaymentSubStatus("active")
        router.push(homeAfterOrgCreated(payRes.session.companyId))
        return
      }

      if (!payRes.checkoutUrl) {
        throw new Error("Could not start checkout.")
      }

      setPaymentSubStatus("checkout")
      router.push(payRes.checkoutUrl)
    } catch (e) {
      setPaymentSubStatus("failed")
      setPaymentError(
        e instanceof Error ? e.message : "Could not continue. Try again."
      )
    } finally {
      setIsLoading(false)
    }
  }

  const ctaLabel = pricing.isFree
    ? "Continue with Free Trial"
    : `Pay ${formatNpr(pricing.total)} & continue`

  if (!hydrated) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Spinner size={24} variant="default" />
      </div>
    )
  }

  return (
    <div className="-mx-5 flex flex-1 flex-col lg:-mx-8 lg:flex-row">
      <PlanCompareDialog
        selectedPlanId={selection.planId}
        onSelectPlan={selectPlan}
        open={compareOpen}
        onOpenChange={setCompareOpen}
        hideTrigger
      />

      <section className="flex flex-1 flex-col border-b border-border lg:border-r lg:border-b-0">
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-5 py-8 md:px-8 lg:px-10">
          <div className="flex items-end justify-between gap-3">
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Choose your plan
            </h1>
            <button
              type="button"
              onClick={() => setCompareOpen(true)}
              className="shrink-0 text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Compare all
            </button>
          </div>

          <fieldset aria-label="Plans">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {PLANS.map((plan) => {
                const isSelected = selection.planId === plan.id
                const isFree = plan.monthlyPerUser === 0

                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => selectPlan(plan.id)}
                    aria-pressed={isSelected}
                    className={cn(
                      "relative flex flex-col gap-3 rounded-lg bg-card p-4 text-left text-card-foreground ring-1 ring-foreground/10 transition-all outline-none",
                      "focus-visible:ring-2 focus-visible:ring-ring/30",
                      isSelected
                        ? "ring-2 ring-primary"
                        : "hover:ring-foreground/20"
                    )}
                  >
                    {plan.badge === "popular" ? (
                      <span className="absolute -top-2.5 left-3 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold tracking-wide text-primary-foreground uppercase">
                        Popular
                      </span>
                    ) : null}

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                        <h3 className="text-sm font-semibold tracking-tight text-foreground">
                          {plan.name}
                        </h3>
                        {plan.badge === "default" ? (
                          <Badge
                            variant="secondary"
                            className="h-5 rounded-md px-1.5 text-[10px] font-medium"
                          >
                            Default
                          </Badge>
                        ) : null}
                      </div>
                      <span
                        className={cn(
                          "flex size-4 shrink-0 items-center justify-center rounded-full border",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input bg-card"
                        )}
                        aria-hidden
                      >
                        {isSelected ? (
                          <HugeiconsIcon
                            icon={Tick02Icon}
                            className="size-2.5"
                          />
                        ) : null}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      {plan.listMonthlyPerUser && !isFree ? (
                        <span className="block text-xs tabular-nums text-muted-foreground line-through">
                          {formatNpr(plan.listMonthlyPerUser)}
                        </span>
                      ) : null}
                      <p className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
                        {isFree ? "Free" : formatNpr(plan.monthlyPerUser)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {plan.priceNote}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </fieldset>

          <div className="flex flex-col gap-4 rounded-lg bg-card p-4 text-card-foreground ring-1 ring-foreground/10 md:p-5">
            <p className="text-sm font-medium text-foreground">Customization</p>

            <div className="divide-y divide-border">
              <div className="flex items-center justify-between gap-4 pb-4">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">
                    Payment period
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {periodPriceHint}
                  </span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        className="h-9 min-w-36 justify-between gap-2 px-3 text-sm font-normal"
                        disabled={isFreeTrial}
                      />
                    }
                  >
                    {isFreeTrial ? "14 days" : selectedPeriodLabel}
                    <ChevronDown className="size-3.5 opacity-60" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-36">
                    {PAYMENT_PERIODS.map((period) => (
                      <DropdownMenuItem
                        key={period.id}
                        onClick={() => selectPeriod(period.id)}
                      >
                        {period.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {!isFreeTrial ? (
                <>
                  <div className="py-4">
                    <NumberStepper
                      label="No. of users"
                      value={selection.users}
                      onChange={(users) => update({ users })}
                    />
                  </div>

                  <div className="flex flex-col gap-3 py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-foreground">
                          No. of branches
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Enable multi-branch and set count
                        </span>
                      </div>
                      <Switch
                        checked={selection.branchesEnabled}
                        onCheckedChange={(checked) =>
                          update({ branchesEnabled: Boolean(checked) })
                        }
                      />
                    </div>
                    {selection.branchesEnabled ? (
                      <NumberStepper
                        label="Branches"
                        value={selection.branchCount}
                        onChange={(branchCount) => update({ branchCount })}
                      />
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-3 pt-4">
                    <p className="text-sm font-medium text-foreground">
                      Additional modules
                    </p>
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {ADDITIONAL_MODULES.map((mod) => {
                        const isSelected = selection.moduleIds.includes(mod.id)
                        return (
                          <div
                            key={mod.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => toggleModule(mod.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault()
                                toggleModule(mod.id)
                              }
                            }}
                            className={cn(
                              "flex cursor-pointer items-center gap-3 rounded-lg bg-background px-3 py-3 text-left ring-1 ring-foreground/10 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
                              isSelected
                                ? "ring-2 ring-primary"
                                : "hover:ring-foreground/20"
                            )}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-foreground">
                                {mod.name}
                              </p>
                              <p className="text-xs text-muted-foreground tabular-nums">
                                {formatNpr(mod.monthlyPrice)} /monthly
                              </p>
                            </div>
                            <Checkbox
                              checked={isSelected}
                              tabIndex={-1}
                              aria-hidden
                              className="pointer-events-none"
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <aside className="flex w-full flex-col lg:w-[min(100%,30rem)] lg:shrink-0">
        <div className="sticky top-20 flex flex-col gap-6 px-5 py-8 md:px-8 lg:px-8">
          <h2 className="text-xl font-semibold tracking-tight">
            Order summary
          </h2>

          <div className="rounded-lg bg-card text-card-foreground ring-1 ring-foreground/10">
            <dl className="flex flex-col gap-2.5 px-4 py-3.5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">
                  Amount ({formatNpr(pricing.unitMonthlyPrice)} x{" "}
                  {pricing.users} Users x {pricing.periodDisplayLabel})
                </dt>
                <dd className="shrink-0 tabular-nums text-foreground">
                  {formatNpr(pricing.amount)}
                </dd>
              </div>
              {pricing.branchesSubtotal > 0 ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">
                    Branches × {selection.branchCount}
                  </dt>
                  <dd className="shrink-0 tabular-nums text-foreground">
                    {formatNpr(pricing.branchesSubtotal)}
                  </dd>
                </div>
              ) : null}
              {pricing.moduleLines.map((line) => (
                <div key={line.id} className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{line.name}</dt>
                  <dd className="shrink-0 tabular-nums text-foreground">
                    {formatNpr(line.amount)}
                  </dd>
                </div>
              ))}
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Discount</dt>
                <dd className="shrink-0 tabular-nums text-foreground">
                  {formatNpr(pricing.discount)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Total Taxable Amount</dt>
                <dd className="shrink-0 tabular-nums text-foreground">
                  {formatNpr(pricing.taxableAmount)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">VAT</dt>
                <dd className="shrink-0 tabular-nums text-foreground">
                  {formatNpr(pricing.tax)}
                </dd>
              </div>
            </dl>

            <div className="flex items-center justify-between gap-4 border-t border-border px-4 py-3.5 text-sm">
              <span className="text-muted-foreground">Total Amount</span>
              <span className="font-semibold tabular-nums text-primary">
                {formatNpr(pricing.total)}
              </span>
            </div>
          </div>

          {!pricing.isFree ? (
            <div className="flex flex-col gap-2.5">
              <p className="text-sm font-medium text-foreground">
                Payment method
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {PAYMENT_METHODS.map((method) => {
                  const isSelected = selection.paymentMethod === method.id
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => selectPayment(method.id)}
                      aria-pressed={isSelected}
                      className={cn(
                        "flex h-12 cursor-pointer items-center gap-2.5 rounded-lg bg-card px-3 text-left text-card-foreground ring-1 ring-foreground/10 transition-colors",
                        isSelected
                          ? "ring-2 ring-primary"
                          : "hover:ring-foreground/20"
                      )}
                    >
                      <img
                        src={method.logoSrc}
                        alt=""
                        aria-hidden
                        className="size-6 shrink-0 object-contain"
                      />
                      <span className="truncate text-sm font-medium">
                        {method.name}
                      </span>
                    </button>
                  )
                })}
              </div>
              {paymentError ? (
                <p className="text-xs text-destructive">{paymentError}</p>
              ) : null}
            </div>
          ) : (
            <p className="rounded-lg bg-card px-3 py-2.5 text-xs text-muted-foreground ring-1 ring-foreground/10">
              Free trial — no payment required. You can upgrade later from
              billing settings.
            </p>
          )}

          <div className="mt-auto flex flex-col gap-3 pt-2">
            <Button
              type="button"
              className="h-11 w-full text-sm font-semibold"
              disabled={isLoading}
              onClick={handleContinue}
            >
              {isLoading ? <Spinner size={18} variant="default" /> : ctaLabel}
            </Button>
            <p className="text-center text-[11px] text-muted-foreground">
              {pricing.isFree
                ? "No payment required. Upgrade later from Billing & Plans."
                : paymentSubStatus === "failed"
                  ? "Previous payment did not complete. Retry when ready."
                  : "You will confirm payment on the secure checkout step, then enter your workspace."}
            </p>
          </div>
        </div>
      </aside>
    </div>
  )
}
