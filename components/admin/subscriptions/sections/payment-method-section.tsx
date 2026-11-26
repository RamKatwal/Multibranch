"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { paymentMethodLogoSrc } from "@/lib/onboarding/plans"
import {
  formatPaymentMethodSummary,
  type SubscriptionPaymentMethod,
} from "@/types/subscription"

type PaymentMethodSectionProps = {
  paymentMethod: SubscriptionPaymentMethod | null
  autoRenew: boolean
  onAutoRenewChange: (value: boolean) => void
}

export function PaymentMethodSection({
  paymentMethod,
  autoRenew,
  onAutoRenewChange,
}: PaymentMethodSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-xl border bg-card p-4 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Payment method</h2>
            <p className="text-xs text-fg-secondary">
              Digital wallet used for recurring charges (eSewa or Fonepay).
            </p>
          </div>
          <Button size="32" variant="outline" color="neutral" type="button">
            Update payment method
          </Button>
        </div>

        {paymentMethod ? (
          <div className="mt-4 flex items-start gap-3 rounded-lg border bg-fill2/30 p-4">
            <div className="flex size-10 items-center justify-center rounded-md border bg-bg p-1.5">
              <Image
                src={paymentMethodLogoSrc[paymentMethod.provider]}
                alt=""
                width={28}
                height={28}
                className="size-7 object-contain"
              />
            </div>
            <dl className="grid flex-1 gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-fg-secondary">Provider</dt>
                <dd className="font-medium">
                  {formatPaymentMethodSummary(paymentMethod)}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-fg-secondary">Billing email</dt>
                <dd className="font-medium">
                  {paymentMethod.billingEmail || "—"}
                </dd>
              </div>
            </dl>
          </div>
        ) : (
          <p className="mt-4 rounded-lg border border-dashed px-4 py-8 text-center text-sm text-fg-secondary">
            No payment method on file.
          </p>
        )}
      </section>

      <section className="rounded-xl border bg-card p-4 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Auto-renewal</h2>
            <p className="text-xs text-fg-secondary">
              Automatically renew this subscription at the end of each period.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-fg-secondary">
              {autoRenew ? "Enabled" : "Disabled"}
            </span>
            <Switch
              checked={autoRenew}
              onCheckedChange={onAutoRenewChange}
              aria-label="Toggle auto-renewal"
            />
          </div>
        </div>
      </section>
    </div>
  )
}
