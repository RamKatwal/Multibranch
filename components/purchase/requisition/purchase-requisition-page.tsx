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
import { createPurchaseRequisitionColumns } from "@/components/purchase/requisition/purchase-requisition-columns"
import { Button } from "@/components/ui/button"
import { Tabs } from "@/components/ui/tabs"
import {
  createPurchaseRequisitionId,
  createPurchaseRequisitionItemId,
  readPurchaseRequisitions,
  savePurchaseRequisitions,
} from "@/lib/purchase-requisitions/storage"
import {
  PURCHASE_REQUISITION_STATUSES,
  purchaseRequisitionStatusLabels,
  type PurchaseRequisition,
  type PurchaseRequisitionStatus,
} from "@/types/purchase-requisition"

export function PurchaseRequisitionPage() {
  const router = useRouter()
  const [requisitions, setRequisitions] = React.useState<PurchaseRequisition[]>(
    []
  )
  const [activeStatus, setActiveStatus] =
    React.useState<PurchaseRequisitionStatus>("approved")
  const [rowSize, setRowSize] = React.useState<DataTableRowSize>("md")
  const { isFullscreen, toggleFullscreen } = useDataTableFullscreen()

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRequisitions(readPurchaseRequisitions())
  }, [])

  const persist = React.useCallback((next: PurchaseRequisition[]) => {
    setRequisitions(savePurchaseRequisitions(next))
  }, [])

  const filteredData = React.useMemo(
    () => requisitions.filter((item) => item.status === activeStatus),
    [requisitions, activeStatus]
  )

  const statusTabItems = React.useMemo(
    () =>
      PURCHASE_REQUISITION_STATUSES.map((status) => ({
        value: status,
        label: purchaseRequisitionStatusLabels[status],
        count: requisitions.filter((item) => item.status === status).length,
      })),
    [requisitions]
  )

  function openForm(requisition?: PurchaseRequisition) {
    if (requisition) {
      router.push(
        `/purchase/requisition/create?id=${encodeURIComponent(requisition.id)}`
      )
      return
    }
    router.push("/purchase/requisition/create")
  }

  function handleDuplicate(requisition: PurchaseRequisition) {
    const duplicate: PurchaseRequisition = {
      ...requisition,
      id: createPurchaseRequisitionId(requisitions),
      status: "draft",
      items: requisition.items.map((item, index) => ({
        ...item,
        id: createPurchaseRequisitionItemId(index),
      })),
    }
    persist([duplicate, ...requisitions])
    toast.success(`Duplicated ${requisition.id} as ${duplicate.id}.`)
  }

  function handleDelete(requisition: PurchaseRequisition) {
    persist(requisitions.filter((item) => item.id !== requisition.id))
    toast.success(`Deleted ${requisition.id}.`)
  }

  const columns = React.useMemo(
    () =>
      createPurchaseRequisitionColumns({
        onView: openForm,
        onEdit: openForm,
        onDuplicate: handleDuplicate,
        onDelete: handleDelete,
      }),
    // Columns close over latest requisition handlers; refresh when data changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [requisitions]
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
        item.entryDate.includes(query) ||
        item.remarks.toLowerCase().includes(query) ||
        item.items.some((line) => line.name.toLowerCase().includes(query))
      )
    },
  })

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Purchase Requisition"
        count={`${requisitions.length} requisitions`}
        actions={
          <>
            <Button variant="outline" size="sm">
              <DownloadIcon />
              Export
            </Button>
            <Button size="sm" onClick={() => openForm()}>
              <PlusIcon />
              Create Purchase Requisition
            </Button>
          </>
        }
      />

      <DataTableCard
        table={table}
        columnCount={columns.length}
        searchPlaceholder="Search requisitions..."
        rowSize={rowSize}
        onRowSizeChange={setRowSize}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        emptyMessage={`No ${purchaseRequisitionStatusLabels[activeStatus].toLowerCase()} requisitions found.`}
        leading={
          <Tabs
            items={statusTabItems}
            value={activeStatus}
            onValueChange={(status) => {
              if (typeof status !== "string") return
              setActiveStatus(status as PurchaseRequisitionStatus)
              table.setPageIndex(0)
            }}
          />
        }
      />
    </div>
  )
}
