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
import { createSalesReturnColumns } from "@/components/sales/return/sales-return-columns"
import { Button } from "@/components/ui/button"
import { Tabs } from "@/components/ui/tabs"
import { mockSalesReturns } from "@/lib/mock/sales-returns"
import {
  createSalesReturnId,
  readSalesReturns,
  saveSalesReturns,
} from "@/lib/sales-returns/storage"
import {
  SALES_RETURN_STATUSES,
  salesReturnStatusLabels,
  type SalesReturn,
  type SalesReturnStatus,
} from "@/types/sales-return"

export function SalesReturnPage() {
  const router = useRouter()
  const [returns, setReturns] = React.useState<SalesReturn[]>(mockSalesReturns)
  const [activeStatus, setActiveStatus] =
    React.useState<SalesReturnStatus>("approved")
  const [rowSize, setRowSize] = React.useState<DataTableRowSize>("md")
  const { isFullscreen, toggleFullscreen } = useDataTableFullscreen()

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReturns(readSalesReturns())
  }, [])

  const persist = React.useCallback((next: SalesReturn[]) => {
    setReturns(saveSalesReturns(next))
  }, [])

  const filteredData = React.useMemo(
    () => returns.filter((item) => item.status === activeStatus),
    [returns, activeStatus]
  )

  const statusTabItems = React.useMemo(
    () =>
      SALES_RETURN_STATUSES.map((status) => ({
        value: status,
        label: salesReturnStatusLabels[status],
        count: returns.filter((item) => item.status === status).length,
      })),
    [returns]
  )

  function openForm(entry?: SalesReturn) {
    if (entry) {
      router.push(`/sales/return/create?id=${encodeURIComponent(entry.id)}`)
      return
    }
    router.push("/sales/return/create")
  }

  function handleDuplicate(entry: SalesReturn) {
    const duplicate: SalesReturn = {
      ...entry,
      id: createSalesReturnId(returns),
      status: "draft",
    }
    persist([duplicate, ...returns])
    toast.success(`Duplicated ${entry.id} as ${duplicate.id}.`)
  }

  function handleDelete(entry: SalesReturn) {
    persist(returns.filter((item) => item.id !== entry.id))
    toast.success(`Deleted ${entry.id}.`)
  }

  const columns = React.useMemo(
    () =>
      createSalesReturnColumns({
        onView: openForm,
        onEdit: openForm,
        onDuplicate: handleDuplicate,
        onDelete: handleDelete,
      }),
    // Columns close over latest handlers; refresh when data changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [returns]
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
        item.entryDate.includes(query)
      )
    },
  })

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Sales Return"
        count={`${returns.length} returns`}
        actions={
          <>
            <Button variant="outline" size="sm">
              <DownloadIcon />
              Export
            </Button>
            <Button size="sm" onClick={() => openForm()}>
              <PlusIcon />
              Create Sales Return
            </Button>
          </>
        }
      />

      <DataTableCard
        table={table}
        columnCount={columns.length}
        searchPlaceholder="Search returns..."
        rowSize={rowSize}
        onRowSizeChange={setRowSize}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        emptyMessage={`No ${salesReturnStatusLabels[activeStatus].toLowerCase()} returns found.`}
        leading={
          <Tabs
            items={statusTabItems}
            value={activeStatus}
            onValueChange={(status) => {
              if (typeof status !== "string") return
              setActiveStatus(status as SalesReturnStatus)
              table.setPageIndex(0)
            }}
          />
        }
      />
    </div>
  )
}
