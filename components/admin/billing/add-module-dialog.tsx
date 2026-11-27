"use client"

import * as React from "react"

import { additionalModulesDue } from "@/components/admin/subscriptions/billing-utils"
import { OrderPaymentPanel } from "@/components/admin/subscriptions/order-payment-panel"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog } from "@/components/ui/dialog"
import {
  FormDialogBody,
  FormDialogContent,
  FormDialogDescription,
  FormDialogHeader,
  FormDialogTitle,
} from "@/components/ui/form-dialog"
import {
  ADDITIONAL_MODULES,
  DEFAULT_PAYMENT_METHOD_ID,
  formatNpr,
  type AdditionalModuleId,
  type PaymentMethodId,
} from "@/lib/onboarding/plans"
import type { Subscription } from "@/types/subscription"

type AddModuleDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscription: Subscription
  ownedModuleIds: AdditionalModuleId[]
  onConfirm: (
    ids: AdditionalModuleId[],
    paymentMethod: PaymentMethodId,
    amountPaid: number
  ) => void
}

export function AddModuleDialog({
  open,
  onOpenChange,
  subscription,
  ownedModuleIds,
  onConfirm,
}: AddModuleDialogProps) {
  const [selected, setSelected] = React.useState<AdditionalModuleId[]>([])
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethodId>(
    subscription.paymentMethod?.provider ?? DEFAULT_PAYMENT_METHOD_ID
  )
  const [isLoading, setIsLoading] = React.useState(false)

  const [prevOpen, setPrevOpen] = React.useState(open)
  if (prevOpen !== open) {
    setPrevOpen(open)
    if (open) {
      setSelected([])
      setIsLoading(false)
      setPaymentMethod(
        subscription.paymentMethod?.provider ?? DEFAULT_PAYMENT_METHOD_ID
      )
    }
  }

  const available = ADDITIONAL_MODULES.filter(
    (item) => !ownedModuleIds.includes(item.id)
  )
  const chosen = available.filter((item) => selected.includes(item.id))
  const due = additionalModulesDue(
    subscription,
    chosen.map((item) => item.monthlyPrice)
  )
  const periodLabel = subscription.interval === "year" ? "Annually" : "Monthly"

  function toggle(id: AdditionalModuleId, checked: boolean) {
    setSelected((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id)
    )
  }

  function handleConfirm() {
    if (chosen.length === 0) return
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      onConfirm(
        chosen.map((item) => item.id),
        paymentMethod,
        due.total
      )
      onOpenChange(false)
    }, 1200)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FormDialogContent size="4xl">
        <FormDialogHeader>
          <FormDialogTitle>Add module</FormDialogTitle>
          <FormDialogDescription>
            New modules are available in all your companies.
          </FormDialogDescription>
        </FormDialogHeader>

        <FormDialogBody>
          <div className="grid gap-5 md:grid-cols-5">
          <div className="flex min-w-0 flex-col gap-3 md:col-span-3">
            {available.map((item) => (
              <label
                key={item.id}
                className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border bg-card px-4 py-3"
              >
                <span className="flex items-center gap-3">
                  <Checkbox
                    size="sm"
                    checked={selected.includes(item.id)}
                    onCheckedChange={(value) => toggle(item.id, value === true)}
                  />
                  <span className="text-sm font-medium text-fg">{item.name}</span>
                </span>
                <span className="text-sm text-fg-secondary tabular-nums">
                  {formatNpr(item.monthlyPrice)} / month
                </span>
              </label>
            ))}
          </div>

          <div className="rounded-lg border bg-fill1 p-4 md:col-span-2">
            <OrderPaymentPanel
              lines={[
                { label: "Plan", value: subscription.planName },
                ...chosen.map((item) => ({
                  label: `${item.name} (${periodLabel})`,
                  value: formatNpr(
                    additionalModulesDue(subscription, [item.monthlyPrice]).taxable
                  ),
                })),
                ...(chosen.length > 0
                  ? [
                      { label: "Taxable amount", value: formatNpr(due.taxable) },
                      { label: "VAT", value: formatNpr(due.tax) },
                    ]
                  : []),
              ]}
              total={due.total}
              totalLabel={due.total > 0 ? "Amount due now" : "Select a module"}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              showPayment={due.total > 0}
              confirmLabel={due.total > 0 ? `Pay ${formatNpr(due.total)}` : "Add module"}
              confirmDisabled={chosen.length === 0}
              confirming={isLoading}
              onCancel={() => onOpenChange(false)}
              onConfirm={handleConfirm}
              footnote="Payment is simulated (demo) — confirm to add the modules."
            />
          </div>
          </div>
        </FormDialogBody>
      </FormDialogContent>
    </Dialog>
  )
}
