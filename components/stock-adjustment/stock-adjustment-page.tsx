"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { CheckIcon, ChevronDownIcon, DownloadIcon, PlusIcon } from "lucide-react"
import { toast } from "sonner"

import {
  type DataTableRowSize,
  DataTableCard,
  useDataTable,
  useDataTableFullscreen,
} from "@/components/data-table/data-table"
import { PageHeader } from "@/components/layout/page-header"
import { createStockAdjustmentColumns } from "@/components/stock-adjustment/stock-adjustment-columns"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs } from "@/components/ui/tabs"
import { mockStockAdjustments } from "@/lib/mock/stock-adjustments"
import {
  readStockAdjustments,
  saveStockAdjustments,
} from "@/lib/stock-adjustment/storage"
import { cn } from "@/lib/utils"
import {
  STOCK_ADJUSTMENT_STATUSES,
  STOCK_ADJUSTMENT_TYPES,
  stockAdjustmentStatusLabels,
  stockAdjustmentTypeLabels,
  type StockAdjustment,
  type StockAdjustmentStatus,
  type StockAdjustmentType,
} from "@/types/stock-adjustment"

type TypeFilter = "all" | StockAdjustmentType

export function StockAdjustmentPage() {
  const router = useRouter()
  const [adjustments, setAdjustments] =
    React.useState<StockAdjustment[]>(mockStockAdjustments)
  const [statusTab, setStatusTab] =
    React.useState<StockAdjustmentStatus>("approved")
  const [typeFilter, setTypeFilter] = React.useState<TypeFilter>("all")
  const [rowSize, setRowSize] = React.useState<DataTableRowSize>("md")
  const { isFullscreen, toggleFullscreen } = useDataTableFullscreen()

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAdjustments(readStockAdjustments())
  }, [])

  const persist = React.useCallback((next: StockAdjustment[]) => {
    setAdjustments(saveStockAdjustments(next))
  }, [])

  const filteredData = React.useMemo(
    () =>
      adjustments.filter((item) => {
        if (item.status !== statusTab) return false
        if (typeFilter !== "all" && item.type !== typeFilter) return false
        return true
      }),
    [adjustments, statusTab, typeFilter]
  )

  const statusTabItems = React.useMemo(
    () =>
      STOCK_ADJUSTMENT_STATUSES.map((status) => ({
        value: status,
        label: stockAdjustmentStatusLabels[status],
        count: adjustments.filter((item) => item.status === status).length,
      })),
    [adjustments]
  )

  function handleCancel(adjustment: StockAdjustment) {
    persist(
      adjustments.map((item) =>
        item.id === adjustment.id ? { ...item, status: "cancelled" } : item
      )
    )
    toast.success(`Adjustment "${adjustment.id}" cancelled.`)
  }

  const columns = React.useMemo(
    () =>
      createStockAdjustmentColumns({
        onCancel: handleCancel,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [adjustments]
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
        item.date.includes(query) ||
        item.type.toLowerCase().includes(query) ||
        item.entryBy.toLowerCase().includes(query) ||
        item.billReference.toLowerCase().includes(query) ||
        item.remarks.toLowerCase().includes(query) ||
        item.items.some((line) => line.name.toLowerCase().includes(query))
      )
    },
  })

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Stock Adjustment"
        count={`${adjustments.length} adjustments`}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info("Export is coming soon.")}
            >
              <DownloadIcon />
              Export
            </Button>
            <Button
              size="sm"
              onClick={() => router.push("/inventory/stock-adjustment/create")}
            >
              <PlusIcon />
              Adjust Stock
            </Button>
          </>
        }
      />

      <DataTableCard
        table={table}
        columnCount={columns.length}
        searchPlaceholder="Search adjustments..."
        rowSize={rowSize}
        onRowSizeChange={setRowSize}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        showFilter={false}
        emptyMessage={`No ${stockAdjustmentStatusLabels[
          statusTab
        ].toLowerCase()} adjustments found.`}
        leading={
          <div className="flex flex-wrap items-center gap-2">
            <Tabs
              items={statusTabItems}
              value={statusTab}
              onValueChange={(status) => {
                if (typeof status !== "string") return
                setStatusTab(status as StockAdjustmentStatus)
                table.setPageIndex(0)
              }}
            />

            <div className="hidden h-4 w-px bg-border sm:block" />

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-8 gap-1.5 text-xs font-normal",
                      typeFilter !== "all" &&
                        "border-primary bg-primary/5 font-medium text-primary"
                    )}
                  >
                    <span>
                      Type:{" "}
                      {typeFilter === "all"
                        ? "All"
                        : stockAdjustmentTypeLabels[typeFilter]}
                    </span>
                    <ChevronDownIcon className="size-3 opacity-60" />
                  </Button>
                }
              />
              <DropdownMenuContent align="start" className="min-w-40">
                <DropdownMenuItem
                  className="cursor-pointer text-xs"
                  onClick={() => {
                    setTypeFilter("all")
                    table.setPageIndex(0)
                  }}
                >
                  <span>All</span>
                  {typeFilter === "all" ? (
                    <CheckIcon className="ml-auto size-4 text-primary" />
                  ) : null}
                </DropdownMenuItem>
                {STOCK_ADJUSTMENT_TYPES.map((type) => (
                  <DropdownMenuItem
                    key={type}
                    className="cursor-pointer text-xs"
                    onClick={() => {
                      setTypeFilter(type)
                      table.setPageIndex(0)
                    }}
                  >
                    <span>{stockAdjustmentTypeLabels[type]}</span>
                    {typeFilter === type ? (
                      <CheckIcon className="ml-auto size-4 text-primary" />
                    ) : null}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />
    </div>
  )
}
