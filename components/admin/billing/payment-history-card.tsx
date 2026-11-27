"use client"

import * as React from "react"
import { createPaymentHistoryColumns } from "@/components/admin/billing/payment-history-columns"
import { InvoiceDetailSheet } from "@/components/admin/subscriptions/sections/invoices-section"
import {
  DataTableCard,
  useDataTable,
  useDataTableFullscreen,
  type DataTableRowSize,
} from "@/components/data-table/data-table"
import {
  invoiceBilledForLabel,
  type Subscription,
  type SubscriptionInvoice,
} from "@/types/subscription"

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
          <h2 className="text-sm font-semibold text-fg">Payment history</h2>
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
