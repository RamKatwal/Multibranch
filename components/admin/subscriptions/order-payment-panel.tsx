"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  formatNpr,
  PAYMENT_METHODS,
  type PaymentMethodId,
} from "@/lib/onboarding/plans"
import { cn } from "@/lib/utils"

export type OrderLine = {
  label: string
  value: string
}

type OrderPaymentPanelProps = {
  lines: OrderLine[]
  total: number
  totalLabel?: string
  paymentMethod: PaymentMethodId
  onPaymentMethodChange: (id: PaymentMethodId) => void
  showPayment: boolean
  confirmLabel: string
  confirmDisabled?: boolean
  confirming: boolean
  onCancel: () => void
  onConfirm: () => void
  footnote?: string
}

export function OrderPaymentPanel({
  lines,
  total,
  totalLabel = "Total Amount",
  paymentMethod,
  onPaymentMethodChange,
  showPayment,
  confirmLabel,
  confirmDisabled,
  confirming,
  onCancel,
  onConfirm,
  footnote,
}: OrderPaymentPanelProps) {
  return (
    <div className="flex h-full flex-col gap-5">
      <h3 className="text-sm font-semibold tracking-tight">Order summary</h3>

      <div className="rounded-lg bg-card text-card-foreground border">
        <dl className="flex flex-col gap-2.5 px-4 py-3.5 text-sm">
          {lines.map((line) => (
            <div key={line.label} className="flex justify-between gap-4">
              <dt className="text-fg-secondary">{line.label}</dt>
              <dd className="shrink-0 text-right tabular-nums text-fg">
                {line.value}
              </dd>
            </div>
          ))}
        </dl>
        <div className="flex items-center justify-between gap-4 border-t border-border px-4 py-3.5 text-sm">
          <span className="text-fg-secondary">{totalLabel}</span>
          <span
            className={cn(
              "font-semibold tabular-nums",
              total > 0 ? "text-primary" : "text-fg-secondary"
            )}
          >
            {formatNpr(total)}
          </span>
        </div>
      </div>

      {showPayment ? (
        <div className="flex flex-col gap-2.5">
          <p className="text-sm font-medium text-fg">Payment method</p>
          <div className="grid grid-cols-2 gap-2.5">
            {PAYMENT_METHODS.map((method) => {
              const isSelected = paymentMethod === method.id
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => onPaymentMethodChange(method.id)}
                  aria-pressed={isSelected}
                  className={cn(
                    "flex h-12 cursor-pointer items-center gap-2.5 rounded-lg bg-card px-3 text-left text-card-foreground border transition-colors",
                    isSelected
                      ? "ring-2 ring-primary"
                      : "hover:ring-foreground/20"
                  )}
                >
                  <Image
                    src={method.logoSrc}
                    alt=""
                    width={24}
                    height={24}
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
        </div>
      ) : (
        <p className="rounded-lg bg-card px-3 py-2.5 text-xs text-fg-secondary border">
          No additional payment required for this change.
        </p>
      )}

      <div className="mt-auto flex flex-col gap-2 pt-1">
        <Button
          type="button"
          className="h-10 w-full"
          disabled={confirmDisabled || confirming}
          onClick={onConfirm}
        >
          {confirming ? <Spinner size={18} variant="default" /> : confirmLabel}
        </Button>
        <Button variant="outline" color="neutral"
          type="button"
          className="h-10 w-full"
          disabled={confirming}
          onClick={onCancel}
        >
          Cancel
        </Button>
        {footnote ? (
          <p className="text-center text-xs text-fg-secondary">
            {footnote}
          </p>
        ) : null}
      </div>
    </div>
  )
}
