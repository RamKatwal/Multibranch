"use client"

import { ReceiptTextIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { BillTo } from "@/lib/mock/account-billing"

type BillingDetailsCardProps = {
  billTo: BillTo | null
  onChange: () => void
}

export function BillingDetailsCard({ billTo, onChange }: BillingDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing details</CardTitle>
        <CardDescription>Invoices are issued to this name.</CardDescription>
        {billTo ? (
          <CardAction>
            <Button size="32" variant="outline" color="neutral" onClick={onChange}>
              Change
            </Button>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent>
        {billTo ? (
          <div className="flex flex-wrap items-center gap-2">
            <Badge size="20" variant="soft" color="neutral">
              {billTo.type === "company" ? "Company" : "Individual"}
            </Badge>
            <span className="text-sm font-medium text-fg">
              {billTo.type === "company" ? billTo.companyName : billTo.name}
            </span>
            {billTo.type === "individual" ? (
              <span className="text-sm text-fg-secondary">
                {billTo.email} · {billTo.phone}
                {billTo.pan ? ` · PAN ${billTo.pan}` : ""}
              </span>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-8 text-center">
            <ReceiptTextIcon className="size-6 text-fg-tertiary" />
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-medium text-fg">No billing details yet</p>
              <p className="text-sm text-fg-secondary">
                Choose who invoices are issued to: a company or an individual.
              </p>
            </div>
            <Button size="32" onClick={onChange}>
              Set billing details
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
