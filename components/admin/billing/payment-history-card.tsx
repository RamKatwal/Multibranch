"use client"

import * as React from "react"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronsUpDownIcon,
  DownloadIcon,
  EyeIcon,
  ReceiptIcon,
} from "lucide-react"

import { InvoiceDetailSheet } from "@/components/admin/subscriptions/sections/invoices-section"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatCurrency, formatLongDate } from "@/lib/format"
import {
  billingIntervalLabels,
  invoiceBilledForLabel,
  type Subscription,
  type SubscriptionInvoice,
} from "@/types/subscription"

type SortKey = "date" | "amount"
type Sort = { key: SortKey; dir: "asc" | "desc" }

function cycleLabel(invoice: SubscriptionInvoice, subscription: Subscription) {
  return billingIntervalLabels[invoice.interval ?? subscription.interval]
}

function periodLabel(invoice: SubscriptionInvoice) {
  return `${formatLongDate(invoice.periodStart)} – ${formatLongDate(invoice.periodEnd)}`
}

function csvCell(value: string | number) {
  const text = String(value)
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function exportCsv(invoices: SubscriptionInvoice[], subscription: Subscription) {
  const rows = [
    ["Date", "Description", "Billing cycle", "Payment period", "Amount"],
    ...invoices.map((invoice) => [
      invoice.issueDate,
      invoiceBilledForLabel(invoice),
      cycleLabel(invoice, subscription),
      periodLabel(invoice),
      invoice.amountPaid,
    ]),
  ]
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n")
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }))
  const link = document.createElement("a")
  link.href = url
  link.download = "payment-history.csv"
  link.click()
  URL.revokeObjectURL(url)
}

function SortHeader({
  label,
  sortKey,
  sort,
  onSort,
  align = "left",
}: {
  label: string
  sortKey: SortKey
  sort: Sort
  onSort: (key: SortKey) => void
  align?: "left" | "right"
}) {
  const active = sort.key === sortKey
  const Icon = !active
    ? ChevronsUpDownIcon
    : sort.dir === "asc"
      ? ArrowUpIcon
      : ArrowDownIcon
  return (
    <th
      className={align === "right" ? "px-4 py-2.5 text-right font-medium" : "px-4 py-2.5 font-medium"}
      aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="inline-flex cursor-pointer items-center gap-1 hover:text-fg"
      >
        {label}
        <Icon className="size-3.5" />
      </button>
    </th>
  )
}

export function PaymentHistoryCard({ subscription }: { subscription: Subscription }) {
  const [sort, setSort] = React.useState<Sort>({ key: "date", dir: "desc" })
  const [selected, setSelected] = React.useState<SubscriptionInvoice | null>(null)

  const invoices = React.useMemo(() => {
    const sign = sort.dir === "asc" ? 1 : -1
    return [...subscription.invoices].sort((a, b) =>
      sort.key === "amount"
        ? sign * (a.amountPaid - b.amountPaid)
        : sign * a.issueDate.localeCompare(b.issueDate)
    )
  }, [subscription.invoices, sort])

  function handleSort(key: SortKey) {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "desc" }
    )
  }

  return (
    <>
      <Card className="gap-0 pb-0">
        <CardHeader className="border-b">
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Every payment made on this account.</CardDescription>
          <CardAction>
            <Button
              size="32"
              variant="outline"
              color="neutral"
              disabled={invoices.length === 0}
              onClick={() => exportCsv(invoices, subscription)}
            >
              <DownloadIcon />
              Export
            </Button>
          </CardAction>
        </CardHeader>

        {invoices.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <ReceiptIcon className="size-6 text-fg-tertiary" />
            <p className="text-sm font-medium text-fg">No payments yet</p>
            <p className="text-sm text-fg-secondary">
              Payments for your plan and add-ons will show up here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-200 text-sm">
              <thead className="border-b bg-fill1 text-left text-xs text-fg-secondary">
                <tr>
                  <SortHeader label="Date" sortKey="date" sort={sort} onSort={handleSort} />
                  <th className="px-4 py-2.5 font-medium">Description</th>
                  <th className="px-4 py-2.5 font-medium">Billing Cycle</th>
                  <th className="px-4 py-2.5 font-medium">Payment Period</th>
                  <SortHeader
                    label="Amount"
                    sortKey="amount"
                    sort={sort}
                    onSort={handleSort}
                    align="right"
                  />
                  <th className="px-4 py-2.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.invoiceId} className="border-b last:border-0">
                    <td className="px-4 py-2.5 whitespace-nowrap text-fg-secondary">
                      {formatLongDate(invoice.issueDate)}
                    </td>
                    <td className="px-4 py-2.5 text-fg">
                      {invoiceBilledForLabel(invoice)}
                    </td>
                    <td className="px-4 py-2.5 text-fg-secondary">
                      {cycleLabel(invoice, subscription)}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-fg-secondary">
                      {periodLabel(invoice)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium tabular-nums">
                      {formatCurrency(invoice.amountPaid, invoice.currency)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Button
                        size="28"
                        variant="ghost"
                        color="neutral"
                        onClick={() => setSelected(invoice)}
                      >
                        <EyeIcon />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {selected ? (
        <InvoiceDetailSheet
          invoice={selected}
          subscription={subscription}
          open
          onOpenChange={(open) => {
            if (!open) setSelected(null)
          }}
        />
      ) : null}
    </>
  )
}
