"use client"

import * as React from "react"
import { FlaskConicalIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Tabs } from "@/components/ui/tabs"
import {
  billToScenarioLabels,
  renewalScenarioLabels,
  type BillToScenario,
  type RenewalScenario,
} from "@/lib/mock/account-billing"

type BillingSandboxPanelProps = {
  onRenewalChange: (scenario: RenewalScenario) => void
  onBillToChange: (scenario: BillToScenario) => void
  onPaymentsChange: (withHistory: boolean) => void
}

function toItems<T extends string>(labels: Record<T, string>) {
  return (Object.keys(labels) as T[]).map((value) => ({
    value,
    label: labels[value],
  }))
}

/** Dev-only controls for the billing page's states. Not rendered in production builds. */
export function BillingSandboxPanel({
  onRenewalChange,
  onBillToChange,
  onPaymentsChange,
}: BillingSandboxPanelProps) {
  const [renewal, setRenewal] = React.useState<RenewalScenario>("default")
  const [billTo, setBillTo] = React.useState<BillToScenario>("company")
  const [payments, setPayments] = React.useState("history")

  if (process.env.NODE_ENV === "production") return null

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="32" variant="outline" color="neutral">
          <FlaskConicalIcon />
          Sandbox
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="flex w-auto flex-col gap-4 p-4">
        <div>
          <p className="text-sm font-medium text-fg">Billing sandbox</p>
          <p className="text-xs text-fg-secondary">Dev only. Switch the page state.</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-fg-secondary">Renewal scenario</p>
          <Tabs
            value={renewal}
            onValueChange={(value) => {
              setRenewal(value as RenewalScenario)
              onRenewalChange(value as RenewalScenario)
            }}
            items={toItems(renewalScenarioLabels)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-fg-secondary">Bill to</p>
          <Tabs
            value={billTo}
            onValueChange={(value) => {
              setBillTo(value as BillToScenario)
              onBillToChange(value as BillToScenario)
            }}
            items={toItems(billToScenarioLabels)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-fg-secondary">Payments</p>
          <Tabs
            value={payments}
            onValueChange={(value) => {
              setPayments(value)
              onPaymentsChange(value === "history")
            }}
            items={[
              { value: "history", label: "History" },
              { value: "none", label: "None" },
            ]}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
