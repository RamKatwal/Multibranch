"use client"

import { PlusIcon, RefreshCwIcon, TriangleAlertIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatLongDate } from "@/lib/format"
import type { RenewalState } from "@/lib/mock/account-billing"
import { formatNpr } from "@/lib/onboarding/plans"
import { cn } from "@/lib/utils"
import type { Subscription } from "@/types/subscription"

type Stat = {
  label: string
  value: string
  warning?: string | null
  tone?: "error" | "warning"
}

function limitWarning(used: number, limit: number, noun: string) {
  return used >= limit
    ? `Limit reached. Add slots to create more ${noun}.`
    : null
}

type CurrentPlanCardProps = {
  subscription: Subscription
  daysLeft: number
  renewalState: RenewalState
  onAddCompany: () => void
  onAddBranch: () => void
  onAddUsers: () => void
  onRenew: () => void
  className?: string
}

export function CurrentPlanCard({
  subscription,
  daysLeft,
  renewalState,
  onAddCompany,
  onAddBranch,
  onAddUsers,
  onRenew,
  className,
}: CurrentPlanCardProps) {
  const expired = renewalState === "expired"
  const companiesUsed = subscription.companiesUsed ?? 0
  const companiesLimit = subscription.companiesLimit ?? 0
  const cycle = subscription.interval === "year" ? "Yearly" : "Monthly"

  const stats: Stat[] = [
    {
      label: "Days left",
      value: expired ? "0" : String(daysLeft),
      warning: expired
        ? "Plan expired."
        : renewalState === "expiring"
          ? "Renew soon to avoid interruption."
          : null,
      tone: expired ? "error" : "warning",
    },
    {
      label: "Companies",
      value: `${companiesUsed} / ${companiesLimit}`,
      warning: limitWarning(companiesUsed, companiesLimit, "companies"),
    },
    {
      label: "Branches",
      value: `${subscription.branchesUsed} / ${subscription.branchesLimit}`,
      warning: limitWarning(
        subscription.branchesUsed,
        subscription.branchesLimit,
        "branches"
      ),
    },
    {
      label: "Users",
      value: `${subscription.usersUsed} / ${subscription.usersLimit}`,
      warning: limitWarning(
        subscription.usersUsed,
        subscription.usersLimit,
        "users"
      ),
    },
    { label: "Next renewal", value: formatNpr(subscription.amount) },
  ]

  return (
    <Card size="sm" className={cn("shadow-none", className)}>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>{subscription.planName}</CardTitle>
          <Badge size="20" variant="soft" color={expired ? "error" : "success"}>
            {expired ? "Expired" : "Current plan"}
          </Badge>
        </div>
        <CardDescription>
          {expired ? "Expired on" : "Active until"}{" "}
          {formatLongDate(subscription.periodEnd)} · {cycle}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
          {stats.map((stat) => (
            <div key={stat.label} className="flex min-w-0 flex-col gap-1">
              <dt className="text-xs text-fg-secondary">{stat.label}</dt>
              <dd className="text-sm font-semibold text-fg tabular-nums">
                {stat.value}
              </dd>
              {stat.warning ? (
                <dd
                  className={cn(
                    "flex items-start gap-1 text-xs",
                    stat.tone === "error" ? "text-error-text" : "text-warning-text"
                  )}
                >
                  <TriangleAlertIcon className="mt-0.5 size-3 shrink-0" />
                  {stat.warning}
                </dd>
              ) : null}
            </div>
          ))}
        </dl>
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2">
        <Button size="32" variant="outline" color="neutral" onClick={onAddCompany}>
          <PlusIcon />
          Add company
        </Button>
        <Button size="32" variant="outline" color="neutral" onClick={onAddBranch}>
          <PlusIcon />
          Add branch
        </Button>
        <Button size="32" variant="outline" color="neutral" onClick={onAddUsers}>
          <PlusIcon />
          Add users
        </Button>
        <Button
          size="32"
          variant={expired ? "strong" : "outline"}
          color={expired ? "primary" : "neutral"}
          onClick={onRenew}
        >
          <RefreshCwIcon />
          {expired ? "Renew now" : "Renew"}
        </Button>
      </CardFooter>
    </Card>
  )
}
