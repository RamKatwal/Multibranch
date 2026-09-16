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
import { createSalesOrderColumns } from "@/components/sales/order/sales-order-columns"
import { Button } from "@/components/ui/button"
import { Tabs } from "@/components/ui/tabs"
import { mockSalesOrders } from "@/lib/mock/sales-orders"
import {
  createSalesOrderId,
  createSalesOrderItemId,
  readSalesOrders,
  saveSalesOrders,
} from "@/lib/sales-orders/storage"
import {
  SALES_ORDER_STATUSES,
  salesOrderStatusLabels,
  type SalesOrder,
  type SalesOrderStatus,
} from "@/types/sales-order"

export function SalesOrderPage() {
  const router = useRouter()
  const [orders, setOrders] = React.useState<SalesOrder[]>(mockSalesOrders)
  const [activeStatus, setActiveStatus] =
    React.useState<SalesOrderStatus>("approved")
  const [rowSize, setRowSize] = React.useState<DataTableRowSize>("md")
  const { isFullscreen, toggleFullscreen } = useDataTableFullscreen()

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrders(readSalesOrders())
  }, [])

  const persist = React.useCallback((next: SalesOrder[]) => {
    setOrders(saveSalesOrders(next))
  }, [])

  const filteredData = React.useMemo(
    () => orders.filter((item) => item.status === activeStatus),
    [orders, activeStatus]
  )

  const statusTabItems = React.useMemo(
    () =>
      SALES_ORDER_STATUSES.map((status) => ({
        value: status,
        label: salesOrderStatusLabels[status],
        count: orders.filter((item) => item.status === status).length,
      })),
    [orders]
  )

  function openForm(order?: SalesOrder) {
    if (order) {
      router.push(`/sales/order/create?id=${encodeURIComponent(order.id)}`)
      return
    }
    router.push("/sales/order/create")
  }

  function handleDuplicate(order: SalesOrder) {
    const duplicate: SalesOrder = {
      ...order,
      id: createSalesOrderId(orders),
      status: "draft",
      items: order.items.map((item, index) => ({
        ...item,
        id: createSalesOrderItemId(index),
      })),
    }
    persist([duplicate, ...orders])
    toast.success(`Duplicated ${order.id} as ${duplicate.id}.`)
  }

  function handleDelete(order: SalesOrder) {
    persist(orders.filter((item) => item.id !== order.id))
    toast.success(`Deleted ${order.id}.`)
  }

  const columns = React.useMemo(
    () =>
      createSalesOrderColumns({
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
        item.customer.toLowerCase().includes(query) ||
        item.entryDate.includes(query) ||
        item.deliveryDate.includes(query) ||
        item.remarks.toLowerCase().includes(query) ||
        item.items.some((line) => line.name.toLowerCase().includes(query))
      )
    },
  })

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Sales Order"
        count={`${orders.length} orders`}
        actions={
          <>
            <Button variant="outline" size="sm">
              <DownloadIcon />
              Export
            </Button>
            <Button size="sm" onClick={() => openForm()}>
              <PlusIcon />
              Create Sales Order
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
        emptyMessage={`No ${salesOrderStatusLabels[activeStatus].toLowerCase()} orders found.`}
        leading={
          <Tabs
            items={statusTabItems}
            value={activeStatus}
            onValueChange={(status) => {
              if (typeof status !== "string") return
              setActiveStatus(status as SalesOrderStatus)
              table.setPageIndex(0)
            }}
          />
        }
      />
    </div>
  )
}
