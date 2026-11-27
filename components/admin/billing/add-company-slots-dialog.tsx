"use client"

import * as React from "react"

import { additionalCompaniesDue } from "@/components/admin/subscriptions/billing-utils"
import { OrderPaymentPanel } from "@/components/admin/subscriptions/order-payment-panel"
import { NumberStepper } from "@/components/admin/subscriptions/update-plan-limits-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatLongDate } from "@/lib/format"
import { COMPANY_SLOT_MONTHLY_PRICE } from "@/lib/mock/account-billing"
import {
  DEFAULT_PAYMENT_METHOD_ID,
  formatNpr,
  type PaymentMethodId,
} from "@/lib/onboarding/plans"
import type { Subscription } from "@/types/subscription"

type AddCompanySlotsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscription: Subscription
  onConfirm: (count: number, paymentMethod: PaymentMethodId, amountPaid: number) => void
}

export function AddCompanySlotsDialog({
  open,
  onOpenChange,
  subscription,
  onConfirm,
}: AddCompanySlotsDialogProps) {
  const [count, setCount] = React.useState(1)
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethodId>(
    subscription.paymentMethod?.provider ?? DEFAULT_PAYMENT_METHOD_ID
  )
  const [isLoading, setIsLoading] = React.useState(false)

  const [prevOpen, setPrevOpen] = React.useState(open)
  if (prevOpen !== open) {
    setPrevOpen(open)
    if (open) {
      setCount(1)
      setIsLoading(false)
      setPaymentMethod(
        subscription.paymentMethod?.provider ?? DEFAULT_PAYMENT_METHOD_ID
      )
    }
  }

  const due = additionalCompaniesDue(subscription, count, COMPANY_SLOT_MONTHLY_PRICE)
  const periodLabel = subscription.interval === "year" ? "Annually" : "Monthly"
  const used = subscription.companiesUsed ?? 0
  const limit = subscription.companiesLimit ?? 0

  function handleConfirm() {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      onConfirm(count, paymentMethod, due.total)
      onOpenChange(false)
    }, 1200)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-11/12 flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl">
        <DialogHeader className="border-b px-5 py-4 pr-12">
          <DialogTitle>Add company slots</DialogTitle>
          <DialogDescription>
            Each slot lets you create one more company on this account.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden sm:flex-row">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-y-auto p-5">
            <div className="flex flex-col gap-1.5 rounded-lg border bg-card px-4 py-4">
              <NumberStepper
                label="Additional companies"
                value={count}
                min={1}
                onChange={setCount}
              />
              <p className="text-xs text-fg-secondary">
                {limit} slots already paid · currently using {used}
              </p>
            </div>
          </div>

          <div className="min-h-0 shrink-0 overflow-y-auto border-t bg-fill2/20 p-5 sm:w-104 sm:border-t-0 sm:border-l">
            <OrderPaymentPanel
              lines={[
                { label: "Plan", value: subscription.planName },
                { label: "Current billing", value: formatLongDate(subscription.periodEnd) },
                {
                  label: `Company slots × ${count} (${periodLabel})`,
                  value: formatNpr(due.taxable),
                },
                { label: "Taxable amount", value: formatNpr(due.taxable) },
                { label: "VAT", value: formatNpr(due.tax) },
              ]}
              total={due.total}
              totalLabel="Amount due now"
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              showPayment
              confirmLabel={`Pay ${formatNpr(due.total)}`}
              confirming={isLoading}
              onCancel={() => onOpenChange(false)}
              onConfirm={handleConfirm}
              footnote="Payment is simulated (demo) — confirm to add the slots."
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
