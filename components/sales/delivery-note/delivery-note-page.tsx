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
import { createDeliveryNoteColumns } from "@/components/sales/delivery-note/delivery-note-columns"
import { Button } from "@/components/ui/button"
import { Tabs } from "@/components/ui/tabs"
import {
  createDeliveryNoteId,
  readDeliveryNotes,
  saveDeliveryNotes,
} from "@/lib/delivery-notes/storage"
import { mockDeliveryNotes } from "@/lib/mock/delivery-notes"
import {
  DELIVERY_NOTE_STATUSES,
  deliveryNoteStatusLabels,
  type DeliveryNote,
  type DeliveryNoteStatus,
} from "@/types/delivery-note"

export function DeliveryNotePage() {
  const router = useRouter()
  const [notes, setNotes] = React.useState<DeliveryNote[]>(mockDeliveryNotes)
  const [activeStatus, setActiveStatus] =
    React.useState<DeliveryNoteStatus>("approved")
  const [rowSize, setRowSize] = React.useState<DataTableRowSize>("md")
  const { isFullscreen, toggleFullscreen } = useDataTableFullscreen()

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNotes(readDeliveryNotes())
  }, [])

  const persist = React.useCallback((next: DeliveryNote[]) => {
    setNotes(saveDeliveryNotes(next))
  }, [])

  const filteredData = React.useMemo(
    () => notes.filter((item) => item.status === activeStatus),
    [notes, activeStatus]
  )

  const statusTabItems = React.useMemo(
    () =>
      DELIVERY_NOTE_STATUSES.map((status) => ({
        value: status,
        label: deliveryNoteStatusLabels[status],
        count: notes.filter((item) => item.status === status).length,
      })),
    [notes]
  )

  function openForm(note?: DeliveryNote) {
    if (note) {
      router.push(
        `/sales/delivery-note/create?id=${encodeURIComponent(note.id)}`
      )
      return
    }
    router.push("/sales/delivery-note/create")
  }

  function handleDuplicate(note: DeliveryNote) {
    const duplicate: DeliveryNote = {
      ...note,
      id: createDeliveryNoteId(notes),
      status: "draft",
    }
    persist([duplicate, ...notes])
    toast.success(`Duplicated ${note.id} as ${duplicate.id}.`)
  }

  function handleDelete(note: DeliveryNote) {
    persist(notes.filter((item) => item.id !== note.id))
    toast.success(`Deleted ${note.id}.`)
  }

  const columns = React.useMemo(
    () =>
      createDeliveryNoteColumns({
        onView: openForm,
        onEdit: openForm,
        onDuplicate: handleDuplicate,
        onDelete: handleDelete,
      }),
    // Columns close over latest handlers; refresh when data changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [notes]
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
        item.entryDate.includes(query) ||
        item.invoiceStatus.toLowerCase().includes(query)
      )
    },
  })

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Delivery Note"
        count={`${notes.length} notes`}
        actions={
          <>
            <Button variant="outline" size="sm">
              <DownloadIcon />
              Export
            </Button>
            <Button size="sm" onClick={() => openForm()}>
              <PlusIcon />
              Create Delivery Note
            </Button>
          </>
        }
      />

      <DataTableCard
        table={table}
        columnCount={columns.length}
        searchPlaceholder="Search delivery notes..."
        rowSize={rowSize}
        onRowSizeChange={setRowSize}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        emptyMessage={`No ${deliveryNoteStatusLabels[activeStatus].toLowerCase()} delivery notes found.`}
        leading={
          <Tabs
            items={statusTabItems}
            value={activeStatus}
            onValueChange={(status) => {
              if (typeof status !== "string") return
              setActiveStatus(status as DeliveryNoteStatus)
              table.setPageIndex(0)
            }}
          />
        }
      />
    </div>
  )
}
