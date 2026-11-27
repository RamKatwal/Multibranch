"use client"

import * as React from "react"
import { DownloadIcon } from "lucide-react"

import {
  createPaymentHistoryColumns,
  invoiceCycleLabel,
  invoicePeriodLabel,
} from "@/components/admin/billing/payment-history-columns"
import { InvoiceDetailSheet } from "@/components/admin/subscriptions/sections/invoices-section"
import {
  DataTableCard,
  useDataTable,
  useDataTableFullscreen,
  type DataTableRowSize,
} from "@/components/data-table/data-table"
import { Button } from "@/components/ui/button"
import {
  invoiceBilledForLabel,
  type Subscription,
  type SubscriptionInvoice,
} from "@/types/subscription"

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
      invoiceCycleLabel(invoice, subscription.interval),
      invoicePeriodLabel(invoice),
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

export function PaymentHistoryCard({ subscription }: { subscription: Subscription }) {
  const [selected, setSelected] = React.useState<SubscriptionInvoice | null>(null)
  const [rowSize, setRowSize] = React.useState<DataTableRowSize>("md")
  const { isFullscreen, toggleFullscreen } = useDataTableFullscreen()

  const columns = React.useMemo(
    () =>
      createPaymentHistoryColumns({
        interval: subscription.interval,
        onView: setSelected,
      }),
    [subscription.interval]
  )

  const table = useDataTable({
    data: subscription.invoices,
    columns,
    pageSize: 10,
    globalFilterFn: (row, _columnId, filterValue) =>
      invoiceBilledForLabel(row.original)
        .toLowerCase()
        .includes(String(filterValue).toLowerCase()),
  })

  return (
    <>
      <DataTableCard
        table={table}
        columnCount={columns.length}
        searchPlaceholder="Search payments..."
        rowSize={rowSize}
        onRowSizeChange={setRowSize}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        emptyMessage="No payments yet."
        showFilter={false}
        leading={
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-fg">Payment history</h2>
            <Button
              size="32"
              variant="outline"
              color="neutral"
              disabled={subscription.invoices.length === 0}
              onClick={() => exportCsv(table.getSortedRowModel().rows.map((row) => row.original), subscription)}
            >
              <DownloadIcon />
              Export
            </Button>
          </div>
        }
      />

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
