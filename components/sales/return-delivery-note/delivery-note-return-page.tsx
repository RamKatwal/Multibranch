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
import { createDeliveryNoteReturnColumns } from "@/components/sales/return-delivery-note/delivery-note-return-columns"
import { Button } from "@/components/ui/button"
import { Tabs } from "@/components/ui/tabs"
import {
  createDeliveryNoteReturnId,
  readDeliveryNoteReturns,
  saveDeliveryNoteReturns,
} from "@/lib/delivery-note-returns/storage"
import { mockDeliveryNoteReturns } from "@/lib/mock/delivery-note-returns"
import {
  DELIVERY_NOTE_RETURN_STATUSES,
  deliveryNoteReturnStatusLabels,
  type DeliveryNoteReturn,
  type DeliveryNoteReturnStatus,
} from "@/types/delivery-note-return"

export function DeliveryNoteReturnPage() {
  const router = useRouter()
  const [returns, setReturns] = React.useState<DeliveryNoteReturn[]>(
    mockDeliveryNoteReturns
  )
  const [activeStatus, setActiveStatus] =
    React.useState<DeliveryNoteReturnStatus>("approved")
  const [rowSize, setRowSize] = React.useState<DataTableRowSize>("md")
  const { isFullscreen, toggleFullscreen } = useDataTableFullscreen()

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReturns(readDeliveryNoteReturns())
  }, [])

  const persist = React.useCallback((next: DeliveryNoteReturn[]) => {
    setReturns(saveDeliveryNoteReturns(next))
  }, [])

  const filteredData = React.useMemo(
    () => returns.filter((item) => item.status === activeStatus),
    [returns, activeStatus]
  )

  const statusTabItems = React.useMemo(
    () =>
      DELIVERY_NOTE_RETURN_STATUSES.map((status) => ({
        value: status,
        label: deliveryNoteReturnStatusLabels[status],
        count: returns.filter((item) => item.status === status).length,
      })),
    [returns]
  )

  function openForm(entry?: DeliveryNoteReturn) {
    if (entry) {
      router.push(
        `/sales/return-delivery-note/create?id=${encodeURIComponent(entry.id)}`
      )
      return
    }
    router.push("/sales/return-delivery-note/create")
  }

  function handleDuplicate(entry: DeliveryNoteReturn) {
    const duplicate: DeliveryNoteReturn = {
      ...entry,
      id: createDeliveryNoteReturnId(returns),
      status: "draft",
    }
    persist([duplicate, ...returns])
    toast.success(`Duplicated ${entry.id} as ${duplicate.id}.`)
  }

  function handleDelete(entry: DeliveryNoteReturn) {
    persist(returns.filter((item) => item.id !== entry.id))
    toast.success(`Deleted ${entry.id}.`)
  }

  const columns = React.useMemo(
    () =>
      createDeliveryNoteReturnColumns({
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
        item.deliveryNoteId.toLowerCase().includes(query) ||
        item.entryDate.includes(query)
      )
    },
  })

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Return Delivery Note"
        count={`${returns.length} returns`}
        actions={
          <>
            <Button variant="outline" size="sm">
              <DownloadIcon />
              Export
            </Button>
            <Button size="sm" onClick={() => openForm()}>
              <PlusIcon />
              Create Return Delivery Note
            </Button>
          </>
        }
      />

      <DataTableCard
        table={table}
        columnCount={columns.length}
        searchPlaceholder="Search return notes..."
        rowSize={rowSize}
        onRowSizeChange={setRowSize}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        emptyMessage={`No ${deliveryNoteReturnStatusLabels[activeStatus].toLowerCase()} return notes found.`}
        leading={
          <Tabs
            items={statusTabItems}
            value={activeStatus}
            onValueChange={(status) => {
              if (typeof status !== "string") return
              setActiveStatus(status as DeliveryNoteReturnStatus)
              table.setPageIndex(0)
            }}
          />
        }
      />
    </div>
  )
}
