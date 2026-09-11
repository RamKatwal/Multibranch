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
import { createPurchaseOrderColumns } from "@/components/purchase/order/purchase-order-columns"
import { Button } from "@/components/ui/button"
import { Tabs } from "@/components/ui/tabs"
import { mockPurchaseOrders } from "@/lib/mock/purchase-orders"
import {
  createPurchaseOrderId,
  createPurchaseOrderItemId,
  readPurchaseOrders,
  savePurchaseOrders,
} from "@/lib/purchase-orders/storage"
import {
  PURCHASE_ORDER_STATUSES,
  purchaseOrderStatusLabels,
  type PurchaseOrder,
  type PurchaseOrderStatus,
} from "@/types/purchase-order"

export function PurchaseOrderPage() {
  const router = useRouter()
  const [orders, setOrders] = React.useState<PurchaseOrder[]>(mockPurchaseOrders)
  const [activeStatus, setActiveStatus] =
    React.useState<PurchaseOrderStatus>("draft")
  const [rowSize, setRowSize] = React.useState<DataTableRowSize>("md")
  const { isFullscreen, toggleFullscreen } = useDataTableFullscreen()

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrders(readPurchaseOrders())
  }, [])

  const persist = React.useCallback((next: PurchaseOrder[]) => {
    setOrders(savePurchaseOrders(next))
  }, [])

  const filteredData = React.useMemo(
    () => orders.filter((item) => item.status === activeStatus),
    [orders, activeStatus]
  )

  const statusTabItems = React.useMemo(
    () =>
      PURCHASE_ORDER_STATUSES.map((status) => ({
        value: status,
        label: purchaseOrderStatusLabels[status],
        count: orders.filter((item) => item.status === status).length,
      })),
    [orders]
  )

  function openForm(order?: PurchaseOrder) {
    if (order) {
      router.push(
        `/purchase/order/create?id=${encodeURIComponent(order.id)}`
      )
      return
    }
    router.push("/purchase/order/create")
  }

  function handleDuplicate(order: PurchaseOrder) {
    const duplicate: PurchaseOrder = {
      ...order,
      id: createPurchaseOrderId(orders),
      status: "draft",
      items: order.items.map((item, index) => ({
        ...item,
        id: createPurchaseOrderItemId(index),
      })),
    }
    persist([duplicate, ...orders])
    toast.success(`Duplicated ${order.id} as ${duplicate.id}.`)
  }

  function handleDelete(order: PurchaseOrder) {
    persist(orders.filter((item) => item.id !== order.id))
    toast.success(`Deleted ${order.id}.`)
  }

  const columns = React.useMemo(
    () =>
      createPurchaseOrderColumns({
        onView: openForm,
        onEdit: openForm,
        onDuplicate: handleDuplicate,
        onDelete: handleDelete,
      }),
    // Columns close over latest order handlers; refresh when data changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orders]
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
        item.supplier.toLowerCase().includes(query) ||
        item.orderDate.includes(query) ||
        item.remarks.toLowerCase().includes(query) ||
        item.items.some((line) => line.name.toLowerCase().includes(query))
      )
    },
  })

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Purchase Order"
        count={`${orders.length} orders`}
        actions={
          <>
            <Button variant="outline" size="sm">
              <DownloadIcon />
              Export
            </Button>
            <Button size="sm" onClick={() => openForm()}>
              <PlusIcon />
              Create Purchase Order
            </Button>
          </>
        }
      />

      <DataTableCard
        table={table}
        columnCount={columns.length}
        searchPlaceholder="Search orders..."
        rowSize={rowSize}
        onRowSizeChange={setRowSize}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        emptyMessage={`No ${purchaseOrderStatusLabels[activeStatus].toLowerCase()} orders found.`}
        leading={
          <Tabs
            items={statusTabItems}
            value={activeStatus}
            onValueChange={(status) => {
              if (typeof status !== "string") return
              setActiveStatus(status as PurchaseOrderStatus)
              table.setPageIndex(0)
            }}
          />
        }
      />
    </div>
  )
}
