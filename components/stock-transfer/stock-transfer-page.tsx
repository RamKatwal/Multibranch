"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { PlusIcon } from "lucide-react"
import { toast } from "sonner"

import {
  type DataTableRowSize,
  DataTableCard,
  useDataTable,
  useDataTableFullscreen,
} from "@/components/data-table/data-table"
import { PageHeader } from "@/components/layout/page-header"
import {
  StockTransferActionDialog,
  type StockTransferAction,
  type StockTransferActionConfirmPayload,
} from "@/components/stock-transfer/stock-transfer-action-dialog"
import { createStockTransferColumns } from "@/components/stock-transfer/stock-transfer-columns"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { assertHeadOfficeHasStock, getActiveBranchContext } from "@/lib/inventory/branch-stock"
import { ACTION_TOAST, runStockTransferAction } from "@/lib/stock-transfer/actions"
import { getAllStockTransfers } from "@/lib/stock-transfer/storage"
import type { Branch } from "@/types/branch"
import {
  STOCK_TRANSFER_STATUSES,
  getStockTransferDirectionForBranch,
  parseStockTransferDirection,
  stockTransferDirectionLabels,
  stockTransferStatusLabels,
  type StockTransfer,
  type StockTransferDirection,
  type StockTransferStatus,
} from "@/types/stock-transfer"

function defaultDirection(isHeadOffice: boolean): StockTransferDirection {
  return isHeadOffice ? "out" : "in"
}

export function StockTransferPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [transfers, setTransfers] = React.useState<StockTransfer[]>([])
  const [activeBranch, setActiveBranch] = React.useState<Branch | null>(null)
  const [direction, setDirection] = React.useState<StockTransferDirection>("in")
  const [statusTab, setStatusTab] =
    React.useState<StockTransferStatus>("requested")
  const [rowSize, setRowSize] = React.useState<DataTableRowSize>("md")
  const { isFullscreen, toggleFullscreen } = useDataTableFullscreen()

  const [pendingAction, setPendingAction] = React.useState<{
    action: StockTransferAction
    transfer: StockTransfer
    blockedReason: string | null
  } | null>(null)

  const refresh = React.useCallback(() => {
    setTransfers(getAllStockTransfers())
  }, [])

  React.useEffect(() => {
    const { branch, isHeadOffice: ho } = getActiveBranchContext()
    const fromUrl = parseStockTransferDirection(searchParams.get("direction"))
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveBranch(branch)
    setDirection(fromUrl ?? defaultDirection(ho))
    refresh()
  }, [refresh, searchParams])

  const involvedTransfers = React.useMemo(() => {
    if (!activeBranch) return []
    return transfers.filter(
      (item) =>
        item.fromBranchId === activeBranch.id ||
        item.toBranchId === activeBranch.id
    )
  }, [transfers, activeBranch])

  const stockOutTransfers = React.useMemo(() => {
    if (!activeBranch) return []
    return involvedTransfers.filter(
      (item) => getStockTransferDirectionForBranch(item, activeBranch.id) === "out"
    )
  }, [involvedTransfers, activeBranch])

  const stockInTransfers = React.useMemo(() => {
    if (!activeBranch) return []
    return involvedTransfers.filter(
      (item) => getStockTransferDirectionForBranch(item, activeBranch.id) === "in"
    )
  }, [involvedTransfers, activeBranch])

  const scopedTransfers =
    direction === "out" ? stockOutTransfers : stockInTransfers

  const filteredData = React.useMemo(
    () => scopedTransfers.filter((item) => item.status === statusTab),
    [scopedTransfers, statusTab]
  )

  const statusTabItems = React.useMemo(
    () =>
      STOCK_TRANSFER_STATUSES.map((status) => ({
        value: status,
        label: stockTransferStatusLabels[status],
        count: scopedTransfers.filter((item) => item.status === status).length,
      })),
    [scopedTransfers]
  )

  function selectDirection(next: StockTransferDirection) {
    setDirection(next)
    const params = new URLSearchParams(searchParams.toString())
    params.set("direction", next)
    const query = params.toString()
    router.replace(query ? `?${query}` : "?", { scroll: false })
  }

  function openAction(action: StockTransferAction, transfer: StockTransfer) {
    const blockedReason =
      action === "approve" || action === "dispatch"
        ? assertHeadOfficeHasStock(transfer)
        : null
    setPendingAction({ action, transfer, blockedReason })
  }

  function confirmAction(payload?: StockTransferActionConfirmPayload) {
    if (!pendingAction || pendingAction.blockedReason) return
    try {
      runStockTransferAction(
        pendingAction.transfer,
        pendingAction.action,
        payload
      )
      toast.success(ACTION_TOAST[pendingAction.action])
      setPendingAction(null)
      refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update transfer."
      )
    }
  }

  const columns = React.useMemo(
    () =>
      createStockTransferColumns({
        currentBranchId: activeBranch?.id ?? "",
        onEdit: (transfer) =>
          router.push(
            `/inventory/stock-transfer/${encodeURIComponent(transfer.id)}/edit`
          ),
        onDispatch: (transfer) => openAction("dispatch", transfer),
        onReceive: (transfer) => openAction("receive", transfer),
        onReturn: (transfer) => openAction("return", transfer),
      }),
    [activeBranch?.id, router]
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

  const createHref = "/inventory/stock-transfer/create?direction=in"
  const canCreate = direction === "in"

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Stock Transfer"
        count={`${involvedTransfers.length} transfers`}
        actions={
          canCreate ? (
            <Button size="32" onClick={() => router.push(createHref)}>
              <PlusIcon />
              New Stock In
            </Button>
          ) : null
        }
      />

      <Tabs
        value={direction}
        onValueChange={(value) => {
          if (typeof value !== "string") return
          const next = parseStockTransferDirection(value)
          if (!next) return
          selectDirection(next)
          table.setPageIndex(0)
        }}
      >
        <TabsList variant="button">
          <TabsTrigger value="out" count={stockOutTransfers.length}>
            {stockTransferDirectionLabels.out}
          </TabsTrigger>
          <TabsTrigger value="in" count={stockInTransfers.length}>
            {stockTransferDirectionLabels.in}
          </TabsTrigger>
        </TabsList>
      </Tabs>

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
        ].toLowerCase()} ${stockTransferDirectionLabels[direction].toLowerCase()} transfers.`}
        onRowClick={(transfer) =>
          router.push(
            `/inventory/stock-transfer/${encodeURIComponent(transfer.id)}`
          )
        }
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

      <StockTransferActionDialog
        open={Boolean(pendingAction)}
        onOpenChange={(open) => {
          if (!open) setPendingAction(null)
        }}
        action={pendingAction?.action ?? "approve"}
        transfer={pendingAction?.transfer ?? null}
        blockedReason={pendingAction?.blockedReason}
        onConfirm={confirmAction}
      />
    </div>
  )
}
