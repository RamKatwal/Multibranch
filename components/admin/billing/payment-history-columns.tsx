"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { EyeIcon } from "lucide-react"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatLongDate } from "@/lib/format"
import {
  billingIntervalLabels,
  invoiceBilledForLabel,
  type BillingInterval,
  type SubscriptionInvoice,
} from "@/types/subscription"

export function invoiceCycleLabel(
  invoice: SubscriptionInvoice,
  fallback: BillingInterval
) {
  return billingIntervalLabels[invoice.interval ?? fallback]
}

export function invoicePeriodLabel(invoice: SubscriptionInvoice) {
  return `${formatLongDate(invoice.periodStart)} – ${formatLongDate(invoice.periodEnd)}`
}

export function createPaymentHistoryColumns({
  interval,
  onView,
}: {
  interval: BillingInterval
  onView: (invoice: SubscriptionInvoice) => void
}): ColumnDef<SubscriptionInvoice>[] {
  return [
    {
      accessorKey: "issueDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {formatLongDate(row.original.issueDate)}
        </span>
      ),
    },
    {
      id: "description",
      accessorFn: (invoice) => invoiceBilledForLabel(invoice),
      header: "Description",
      enableSorting: false,
      cell: ({ getValue }) => (
        <span className="font-medium">{getValue<string>()}</span>
      ),
    },
    {
      id: "cycle",
      accessorFn: (invoice) => invoiceCycleLabel(invoice, interval),
      header: "Billing Cycle",
      enableSorting: false,
      cell: ({ getValue }) => (
        <span className="text-fg-secondary">{getValue<string>()}</span>
      ),
    },
    {
      id: "period",
      accessorFn: (invoice) => invoicePeriodLabel(invoice),
      header: "Payment Period",
      enableSorting: false,
      cell: ({ getValue }) => (
        <span className="whitespace-nowrap text-fg-secondary">
          {getValue<string>()}
        </span>
      ),
    },
    {
      accessorKey: "amountPaid",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Amount"
          className="justify-end"
        />
      ),
      cell: ({ row }) => (
        <div className="text-right font-medium tabular-nums">
          {formatCurrency(row.original.amountPaid, row.original.currency)}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            size="28"
            variant="ghost"
            color="neutral"
            onClick={(event) => {
              event.stopPropagation()
              onView(row.original)
            }}
          >
            <EyeIcon />
            View
          </Button>
        </div>
      ),
    },
  ]
}
