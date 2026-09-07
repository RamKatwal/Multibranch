"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { DownloadIcon, PlusIcon } from "lucide-react"

import {
  type DataTableRowSize,
  DataTableCard,
  useDataTable,
  useDataTableFullscreen,
} from "@/components/data-table/data-table"
import { PageHeader } from "@/components/layout/page-header"
import { createStockTransferColumns } from "@/components/stock-transfer/stock-transfer-columns"
import { Button } from "@/components/ui/button"
import { Tabs } from "@/components/ui/tabs"
import { getAllStockTransfers } from "@/lib/stock-transfer/storage"
import {
  STOCK_TRANSFER_STATUSES,
  stockTransferStatusLabels,
  type StockTransfer,
  type StockTransferStatus,
} from "@/types/stock-transfer"

export function StockTransferPage() {
  const router = useRouter()
  const [transfers, setTransfers] = React.useState<StockTransfer[]>([])
  const [statusTab, setStatusTab] = React.useState<StockTransferStatus>(
    "completed"
  )
  const [rowSize, setRowSize] = React.useState<DataTableRowSize>("md")
  const { isFullscreen, toggleFullscreen } = useDataTableFullscreen()

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTransfers(getAllStockTransfers())
  }, [])

  const filteredData = React.useMemo(
    () => transfers.filter((item) => item.status === statusTab),
    [transfers, statusTab]
  )

  const statusTabItems = React.useMemo(
    () =>
      STOCK_TRANSFER_STATUSES.map((status) => ({
        value: status,
        label: stockTransferStatusLabels[status],
        count: transfers.filter((item) => item.status === status).length,
      })),
    [transfers]
  )

  const columns = React.useMemo(
    () =>
      createStockTransferColumns({
        onView: (transfer) => {
          router.push(
            `/inventory/stock-transfer/${encodeURIComponent(transfer.id)}`
          )
        },
        onEdit: (transfer) => {
          if (transfer.status === "draft") {
            router.push(
              `/inventory/stock-transfer/${encodeURIComponent(transfer.id)}/edit`
            )
            return
          }
          router.push(
            `/inventory/stock-transfer/${encodeURIComponent(transfer.id)}`
          )
        },
      }),
    [router]
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
        item.fromBranch.toLowerCase().includes(query) ||
        item.toBranch.toLowerCase().includes(query) ||
        item.date.includes(query) ||
        item.remarks.toLowerCase().includes(query) ||
        item.entryBy.toLowerCase().includes(query) ||
        item.items.some((it) => it.name.toLowerCase().includes(query))
      )
    },
  })

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Stock Transfer"
        count={`${transfers.length} transfers`}
        actions={
          <>
            <Button variant="outline" size="sm">
              <DownloadIcon />
              Export
            </Button>
            <Button
              size="sm"
              onClick={() => router.push("/inventory/stock-transfer/create")}
            >
              <PlusIcon />
              Create Stock Transfer
            </Button>
          </>
        }
      />

      <DataTableCard
        table={table}
        columnCount={columns.length}
        searchPlaceholder="Search by ID, branch, item..."
        rowSize={rowSize}
        onRowSizeChange={setRowSize}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        emptyMessage={`No ${stockTransferStatusLabels[
          statusTab
        ].toLowerCase()} transfers found.`}
        leading={
          <Tabs
            items={statusTabItems}
            value={statusTab}
            onValueChange={(status) => {
              if (typeof status !== "string") return
              setStatusTab(status as StockTransferStatus)
              table.setPageIndex(0)
            }}
          />
        }
      />
    </div>
  )
}
