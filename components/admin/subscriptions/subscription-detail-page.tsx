"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ChevronDown,
  RefreshCwIcon,
  Settings2Icon,
  TriangleAlertIcon,
} from "lucide-react"

import { CancelSubscriptionDialog } from "@/components/admin/subscriptions/cancel-subscription-dialog"
import { RenewPlanDialog } from "@/components/admin/subscriptions/renew-plan-dialog"
import { CurrentPlanSection } from "@/components/admin/subscriptions/sections/current-plan-section"
import { InvoicesSection } from "@/components/admin/subscriptions/sections/invoices-section"
import {
  UpdatePlanLimitsDialog,
  type UpdatePlanLimitsResult,
} from "@/components/admin/subscriptions/update-plan-limits-dialog"
import { PageHeader } from "@/components/layout/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuDivider,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getSubscriptionById } from "@/lib/mock/subscriptions"
import { invoiceReceiptPath } from "@/lib/mock/invoice-receipt"
import {
  subscriptionStatusLabels,
  type Subscription,
  type SubscriptionStatus,
} from "@/types/subscription"
import type { PaymentMethodId } from "@/lib/onboarding/plans"

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

export function SubscriptionDetailPage({
  subscriptionId,
}: {
  subscriptionId: string
}) {
  const [subscription, setSubscription] = React.useState<
    Subscription | undefined
  >(() => getSubscriptionById(subscriptionId))
  const [renewOpen, setRenewOpen] = React.useState(false)
  const [cancelOpen, setCancelOpen] = React.useState(false)
  const [limitsOpen, setLimitsOpen] = React.useState(false)
  const [limitsFocus, setLimitsFocus] = React.useState<"branches" | "users">(
    "branches"
  )

  if (!subscription) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <h1 className="text-xl font-semibold">Subscription not found</h1>
        <p className="text-sm text-fg-secondary">
          This subscription does not exist or has been removed.
        </p>
        <Button variant="outline" color="neutral" asChild
        ><Link href="/admin/subscriptions">
          Back to subscriptions
        </Link></Button>
      </div>
    )
  }

  function handleRenewConfirm(
    paymentMethod: PaymentMethodId,
    amountPaid: number
  ) {
    setSubscription((prev) => {
      if (!prev) return prev
      const end = new Date(prev.periodEnd)
      if (prev.interval === "year") {
        end.setFullYear(end.getFullYear() + 1)
      } else {
        end.setMonth(end.getMonth() + 1)
      }
      const newEnd = end.toISOString().slice(0, 10)
      const remaining = Math.max(
        0,
        Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      )
      const today = new Date().toISOString().slice(0, 10)
      const invoiceId = `inv_${prev.id}_${Date.now()}`
      const invoiceNumber = `INV-${prev.companyName
        .slice(0, 3)
        .toUpperCase()}-${Date.now().toString().slice(-6)}`
      const payment = {
        provider: paymentMethod,
        billingEmail: prev.paymentMethod?.billingEmail ?? "",
      }

      return {
        ...prev,
        periodEnd: newEnd,
        nextBillingDate: newEnd,
        remainingDays: remaining,
        status: "active",
        amount: amountPaid,
        paymentMethod: payment,
        invoices: [
          {
            invoiceId,
            invoiceNumber,
            issueDate: today,
            periodStart: today,
            periodEnd: newEnd,
            amountPaid,
            currency: prev.currency,
            status: "Paid",
            pdfDownloadUrl: invoiceReceiptPath(invoiceId),
            planName: prev.planName,
            chargeType: "plan",
            interval: prev.interval,
            paymentMethod: payment,
            usersUsed: prev.usersUsed,
            usersLimit: prev.usersLimit,
            branchesUsed: prev.branchesUsed,
            branchesLimit: prev.branchesLimit,
          },
          ...prev.invoices,
        ],
      }
    })
  }

  function handleCancelConfirm() {
    setSubscription((prev) =>
      prev ? { ...prev, status: "canceled" } : prev
    )
  }

  function handleLimitsConfirm(result: UpdatePlanLimitsResult) {
    setSubscription((prev) => {
      if (!prev) return prev

      const today = new Date().toISOString().slice(0, 10)
      const invoiceId = `inv_${prev.id}_${Date.now()}`
      const invoiceNumber = `INV-${prev.companyName
        .slice(0, 3)
        .toUpperCase()}-${Date.now().toString().slice(-6)}`
      const payment = {
        provider: result.paymentMethod,
        billingEmail: prev.paymentMethod?.billingEmail ?? "",
      }

      return {
        ...prev,
        branchesLimit: result.branchesLimit,
        usersLimit: result.usersLimit,
        paymentMethod: payment,
        invoices: [
          {
            invoiceId,
            invoiceNumber,
            issueDate: today,
            periodStart: today,
            periodEnd: prev.periodEnd,
            amountPaid: result.amountPaid,
            currency: prev.currency,
            status: "Paid",
            pdfDownloadUrl: invoiceReceiptPath(invoiceId),
            planName: prev.planName,
            chargeType: result.chargeType,
            addedUsers: result.addedUsers,
            addedBranches: result.addedBranches,
            interval: prev.interval,
            paymentMethod: payment,
            usersUsed: prev.usersUsed,
            usersLimit: result.usersLimit,
            branchesUsed: prev.branchesUsed,
            branchesLimit: result.branchesLimit,
          },
          ...prev.invoices,
        ],
      }
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={`${subscription.planName} - ${subscription.companyName}`}
        badge={
          <Badge variant="outline" size="20"
            className={statusBadgeClassName(subscription.status)}
          >
            {subscriptionStatusLabels[subscription.status]}
          </Badge>
        }
        breadcrumb={
          <Button size="32" variant="link"
            className="mb-0.5 h-auto self-start px-0 text-fg-secondary" asChild
          ><Link href="/admin/subscriptions">
            <ArrowLeft />
            Back to Subscriptions
          </Link></Button>
        }
        actions={
          <DropdownMenu>
            <DropdownMenuTrigger asChild
            ><Button size="32" variant="outline" color="neutral">
              <Settings2Icon className="mr-1 size-4" />
              Manage Plan
              <ChevronDown />
            </Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-auto min-w-52">
              <DropdownMenuItem
                className="whitespace-nowrap"
                onClick={() => setRenewOpen(true)}
              >
                <RefreshCwIcon className="mr-2 size-4" />
                Renew plan
              </DropdownMenuItem>
              <DropdownMenuDivider />
              <DropdownMenuItem
                className="whitespace-nowrap"
                variant="destructive"
                onClick={() => setCancelOpen(true)}
              >
                <TriangleAlertIcon className="mr-2 size-4" />
                Cancel subscription
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <CurrentPlanSection
        subscription={subscription}
        onUpdateBranchLimits={() => {
          setLimitsFocus("branches")
          setLimitsOpen(true)
        }}
        onUpdateUserLimits={() => {
          setLimitsFocus("users")
          setLimitsOpen(true)
        }}
      />

      <InvoicesSection subscription={subscription} />

      <RenewPlanDialog
        open={renewOpen}
        onOpenChange={setRenewOpen}
        subscription={subscription}
        onConfirm={handleRenewConfirm}
      />

      <CancelSubscriptionDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        subscription={subscription}
        onConfirm={handleCancelConfirm}
      />

      <UpdatePlanLimitsDialog
        focus={limitsFocus}
        open={limitsOpen}
        onOpenChange={setLimitsOpen}
        subscription={subscription}
        onConfirm={handleLimitsConfirm}
      />
    </div>
  )
}
