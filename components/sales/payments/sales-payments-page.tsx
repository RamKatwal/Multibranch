"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { DownloadIcon, PlusIcon } from "lucide-react"
import { toast } from "sonner"

import {
  type DataTableRowSize,
  DataTableCard,
  useDataTable,
  useDataTableFullscreen,
} from "@/components/data-table/data-table"
import { PageHeader } from "@/components/layout/page-header"
import { createSalesPaymentColumns } from "@/components/sales/payments/sales-payments-columns"
import { Button } from "@/components/ui/button"
import { Tabs } from "@/components/ui/tabs"
import { mockSalesPayments } from "@/lib/mock/sales-payments"
import {
  createSalesPaymentId,
  readSalesPayments,
  saveSalesPayments,
} from "@/lib/sales-payments/storage"
import {
  SALES_PAYMENT_STATUSES,
  salesPaymentModeLabels,
  salesPaymentStatusLabels,
  type SalesPayment,
  type SalesPaymentStatus,
} from "@/types/sales-payment"

export function SalesPaymentsPage() {
  const router = useRouter()
  const [payments, setPayments] =
    React.useState<SalesPayment[]>(mockSalesPayments)
  const [activeStatus, setActiveStatus] =
    React.useState<SalesPaymentStatus>("approved")
  const [rowSize, setRowSize] = React.useState<DataTableRowSize>("md")
  const { isFullscreen, toggleFullscreen } = useDataTableFullscreen()

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPayments(readSalesPayments())
  }, [])

  const persist = React.useCallback((next: SalesPayment[]) => {
    setPayments(saveSalesPayments(next))
  }, [])

  const filteredData = React.useMemo(
    () => payments.filter((item) => item.status === activeStatus),
    [payments, activeStatus]
  )

  const statusTabItems = React.useMemo(
    () =>
      SALES_PAYMENT_STATUSES.map((status) => ({
        value: status,
        label: salesPaymentStatusLabels[status],
        count: payments.filter((item) => item.status === status).length,
      })),
    [payments]
  )

  function openForm(payment?: SalesPayment) {
    if (payment) {
      router.push(
        `/sales/payments/create?id=${encodeURIComponent(payment.id)}`
      )
      return
    }
    router.push("/sales/payments/create")
  }

  function handleDuplicate(payment: SalesPayment) {
    const duplicate: SalesPayment = {
      ...payment,
      id: createSalesPaymentId(payments),
      status: "draft",
    }
    persist([duplicate, ...payments])
    toast.success(`Duplicated ${payment.id} as ${duplicate.id}.`)
  }

  function handleDelete(payment: SalesPayment) {
    persist(payments.filter((item) => item.id !== payment.id))
    toast.success(`Deleted ${payment.id}.`)
  }

  const columns = React.useMemo(
    () =>
      createSalesPaymentColumns({
        onView: openForm,
        onEdit: openForm,
        onDuplicate: handleDuplicate,
        onDelete: handleDelete,
      }),
    // Columns close over latest handlers; refresh when data changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [payments]
  )

  const table = useDataTable({
    data: filteredData,
    columns,
    pageSize: 10,
    globalFilterFn: (row, _columnId, filterValue) => {
      const query = filterValue.toLowerCase()
      const item = row.original

      return (
        item.id.toLowerCase().includes(query) ||
        item.customer.toLowerCase().includes(query) ||
        item.refInvoice.toLowerCase().includes(query) ||
        item.entryDate.includes(query) ||
        salesPaymentModeLabels[item.mode].toLowerCase().includes(query) ||
        item.remarks.toLowerCase().includes(query)
      )
    },
  })

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Sales Payments"
        count={`${payments.length} payments`}
        actions={
          <>
            <Button variant="outline" size="sm">
              <DownloadIcon />
              Export
            </Button>
            <Button size="sm" onClick={() => openForm()}>
              <PlusIcon />
              Record Payment
            </Button>
          </>
        }
      />

      <DataTableCard
        table={table}
        columnCount={columns.length}
        searchPlaceholder="Search payments..."
        rowSize={rowSize}
        onRowSizeChange={setRowSize}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        emptyMessage={`No ${salesPaymentStatusLabels[activeStatus].toLowerCase()} payments found.`}
        leading={
          <Tabs
            items={statusTabItems}
            value={activeStatus}
            onValueChange={(status) => {
              if (typeof status !== "string") return
              setActiveStatus(status as SalesPaymentStatus)
              table.setPageIndex(0)
            }}
          />
        }
      />
    </div>
  )
}
