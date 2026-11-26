"use client"

import Link from "next/link"
import { CalendarDaysIcon, ClockIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatLongDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import {
  billingIntervalUnits,
  subscriptionStatusLabels,
  type Subscription,
  type SubscriptionStatus,
} from "@/types/subscription"

function statusBadgeClassName(status: SubscriptionStatus) {
  switch (status) {
    case "active":
      return "border-transparent bg-success/15 text-success"
    case "trialing":
      return "border-transparent bg-secondary text-secondary-foreground"
    case "past_due":
      return "border-transparent bg-destructive/10 text-error-text"
    case "pending":
      return "border-border text-fg"
    default:
      return "border-border text-fg-secondary"
  }
}

function nextPaymentAmount(subscription: Subscription) {
  const upcoming = subscription.invoices.find(
    (invoice) => invoice.status === "Open" || invoice.status === "Past due"
  )
  return upcoming?.amountPaid ?? subscription.amount
}

function UsageBar({
  label,
  used,
  limit,
  unit,
  manageHref,
  manageLabel,
  updateButtonLabel,
  onUpdate,
  hideUpdate,
}: {
  label: string
  used: number
  limit: number
  unit: string
  manageHref: string
  manageLabel: string
  updateButtonLabel: string
  onUpdate?: () => void
  hideUpdate?: boolean
}) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-fg-secondary">{label}</p>
        <div className="h-1.5 overflow-hidden rounded-full bg-fill2">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs tabular-nums text-fg-secondary">
          {used} of {limit} {unit} used
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button size="32" variant="outline" color="neutral"
          type="button"
          className="whitespace-nowrap" asChild
        ><Link href={manageHref}>
          {manageLabel}
        </Link></Button>
        {onUpdate && !hideUpdate ? (
          <Button size="32" variant="outline" color="neutral"
            type="button"
            className="whitespace-nowrap"
            onClick={onUpdate}
          >
            {updateButtonLabel}
          </Button>
        ) : null}
      </div>
    </div>
  )
}

type CurrentPlanSectionProps = {
  subscription: Subscription
  onUpdateBranchLimits?: () => void
  onUpdateUserLimits?: () => void
}

export function CurrentPlanSection({
  subscription,
  onUpdateBranchLimits,
  onUpdateUserLimits,
}: CurrentPlanSectionProps) {
  const remainingTone =
    subscription.remainingDays <= 7
      ? "text-error-text"
      : "text-fg"

  const isCanceled = subscription.status === "canceled"

  return (
    <section className="rounded-xl border bg-card shadow-xs">
      <div className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-medium text-fg-secondary">
              Current plan
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight">
                {subscription.planName}
              </h2>
              <Badge variant="outline" size="20"
                className={statusBadgeClassName(subscription.status)}
              >
                {subscriptionStatusLabels[subscription.status]}
              </Badge>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <p className="text-lg font-semibold tabular-nums">
              {formatCurrency(subscription.amount, subscription.currency)}
              <span className="ml-1 text-sm font-medium text-fg-secondary">
                / {billingIntervalUnits[subscription.interval]}
              </span>
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:gap-6">
          <p className="flex items-center gap-2 text-fg-secondary">
            <ClockIcon className="size-4 shrink-0" />
            <span>
              <span className={cn("font-medium tabular-nums", remainingTone)}>
                {subscription.remainingDays} days
              </span>{" "}
              remaining
            </span>
          </p>
          <p className="flex items-center gap-2 text-fg-secondary">
            <CalendarDaysIcon className="size-4 shrink-0" />
            <span>
              Next payment:{" "}
              <span className="font-medium text-fg">
                {formatCurrency(
                  nextPaymentAmount(subscription),
                  subscription.currency
                )}{" "}
                on {formatLongDate(subscription.nextBillingDate)}
              </span>
            </span>
          </p>
        </div>
      </div>

      <div className="border-t px-4 py-4 sm:px-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <UsageBar
            label="Branches"
            used={subscription.branchesUsed}
            limit={subscription.branchesLimit}
            unit="branches"
            manageHref="/admin/branches"
            manageLabel="Manage branches"
            updateButtonLabel="Update branches"
            onUpdate={onUpdateBranchLimits}
            hideUpdate={isCanceled}
          />
          <UsageBar
            label="Users"
            used={subscription.usersUsed}
            limit={subscription.usersLimit}
            unit="seats"
            manageHref="/admin/settings/users-permissions/users"
            manageLabel="Manage users"
            updateButtonLabel="Update users"
            onUpdate={onUpdateUserLimits}
            hideUpdate={isCanceled}
          />
        </div>
      </div>
    </section>
  )
}
