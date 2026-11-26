"use client"

import * as React from "react"

import {
  pricingFor,
  shiftPeriodEnd,
} from "@/components/admin/subscriptions/billing-utils"
import { OrderPaymentPanel } from "@/components/admin/subscriptions/order-payment-panel"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatLongDate } from "@/lib/format"
import {
  DEFAULT_PAYMENT_METHOD_ID,
  formatNpr,
  type PaymentMethodId,
} from "@/lib/onboarding/plans"
import {
  billingIntervalLabels,
  type Subscription,
} from "@/types/subscription"

type RenewPlanDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscription: Subscription
  onConfirm: (paymentMethod: PaymentMethodId, amountPaid: number) => void
}

export function RenewPlanDialog({
  open,
  onOpenChange,
  subscription,
  onConfirm,
}: RenewPlanDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethodId>(
    subscription.paymentMethod?.provider ?? DEFAULT_PAYMENT_METHOD_ID
  )

  const [prevOpen, setPrevOpen] = React.useState(open)
  if (prevOpen !== open) {
    setPrevOpen(open)
    if (open) {
        setIsLoading(false)
        setPaymentMethod(
          subscription.paymentMethod?.provider ?? DEFAULT_PAYMENT_METHOD_ID
        )
    }
  }

  const newEnd = shiftPeriodEnd(subscription.periodEnd, subscription.interval)
  const newEndFormatted = newEnd.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  const calculated = pricingFor(
    subscription,
    subscription.usersLimit,
    subscription.branchesLimit
  )
  const amountDue =
    subscription.amount > 0 ? subscription.amount : calculated.total
  const periodLabel =
    subscription.interval === "year" ? "Annually" : "Monthly"

  const orderLines = [
    { label: "Plan", value: subscription.planName },
    { label: "Billing cycle", value: periodLabel },
    { label: "Users", value: `${subscription.usersLimit} seats` },
    {
      label: "Branches",
      value: String(Math.max(subscription.branchesLimit, 0)),
    },
    {
      label: "Taxable amount",
      value: formatNpr(
        subscription.amount > 0
          ? roundMoney(amountDue / 1.13)
          : calculated.taxableAmount
      ),
    },
    {
      label: "VAT",
      value: formatNpr(
        subscription.amount > 0
          ? roundMoney(amountDue - amountDue / 1.13)
          : calculated.tax
      ),
    },
  ]

  function handleConfirm() {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      onConfirm(paymentMethod, amountDue)
      onOpenChange(false)
    }, 1200)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-11/12 flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="border-b px-5 py-4 pr-12">
          <DialogTitle>Renew subscription</DialogTitle>
          <DialogDescription>
            Review your current plan and pay to extend it for the next billing
            period.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden sm:flex-row">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
            <div className="rounded-lg bg-card px-4 py-4 border">
              <p className="text-xs font-medium text-fg-secondary">
                Current plan
              </p>
              <p className="mt-1 text-base font-semibold">
                {subscription.planName}
              </p>
              <p className="mt-1 text-sm text-fg-secondary">
                {subscription.planDescription}
              </p>
            </div>

            <dl className="flex flex-col gap-3 rounded-lg bg-card px-4 py-4 text-sm border">
              <div className="flex justify-between gap-4">
                <dt className="text-fg-secondary">Billing cycle</dt>
                <dd className="font-medium">
                  {billingIntervalLabels[subscription.interval]}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-fg-secondary">Users</dt>
                <dd className="font-medium tabular-nums">
                  {subscription.usersUsed} / {subscription.usersLimit} seats
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-fg-secondary">Branches</dt>
                <dd className="font-medium tabular-nums">
                  {subscription.branchesUsed} / {subscription.branchesLimit}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-fg-secondary">Current period ends</dt>
                <dd className="font-medium">
                  {formatLongDate(subscription.periodEnd)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-fg-secondary">New period ends</dt>
                <dd className="font-medium text-primary">{newEndFormatted}</dd>
              </div>
              {subscription.features.length > 0 ? (
                <div className="border-t pt-3">
                  <dt className="mb-2 text-fg-secondary">Includes</dt>
                  <dd>
                    <ul className="flex flex-col gap-1 text-fg">
                      {subscription.features.slice(0, 6).map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>

          <div className="min-h-0 shrink-0 overflow-y-auto sm:w-76 border-t bg-fill2/20 p-5 sm:border-t-0 sm:border-l">
            <OrderPaymentPanel
              lines={orderLines}
              total={amountDue}
              totalLabel="Amount due now"
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              showPayment={amountDue > 0}
              confirmLabel={
                amountDue > 0
                  ? `Pay ${formatNpr(amountDue)}`
                  : "Confirm renewal"
              }
              confirming={isLoading}
              onCancel={() => onOpenChange(false)}
              onConfirm={handleConfirm}
              footnote="You will confirm payment on the checkout step. This demo applies the renewal immediately."
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100
}
