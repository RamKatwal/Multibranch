"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { InfoIcon, PlusIcon } from "lucide-react"
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
} from "@/components/stock-transfer-2/stock-transfer-action-dialog"
import {
  createStockTransferColumns,
  type StockTransferRole,
} from "@/components/stock-transfer-2/stock-transfer-columns"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs } from "@/components/ui/tabs"
import {
  assertHeadOfficeHasStock,
  getActiveBranchContext,
} from "@/lib/inventory/branch-stock"
import { ACTION_TOAST, runStockTransferAction } from "@/lib/stock-transfer-2/actions"
import { getAllStockTransfers } from "@/lib/stock-transfer-2/storage"
import type { Branch } from "@/types/branch"
import {
  STOCK_TRANSFER_STATUSES,
  stockTransferStatusLabels,
  type StockTransfer,
  type StockTransferStatus,
} from "@/types/stock-transfer"

export function StockTransferPage() {
  const router = useRouter()
  const [transfers, setTransfers] = React.useState<StockTransfer[]>([])
  const [activeBranch, setActiveBranch] = React.useState<Branch | null>(null)
  const [isHeadOffice, setIsHeadOffice] = React.useState(false)
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveBranch(branch)
    setIsHeadOffice(ho)
    refresh()
  }, [refresh])

  const role: StockTransferRole = isHeadOffice ? "head-office" : "branch"

  const scopedTransfers = React.useMemo(() => {
    if (!activeBranch) return []
    return transfers.filter((item) =>
      isHeadOffice
        ? item.fromBranchId === activeBranch.id
        : item.toBranchId === activeBranch.id
    )
  }, [transfers, activeBranch, isHeadOffice])

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
        role,
        onEdit: (transfer) =>
          router.push(
            `/inventory/stock-transfer-2/${encodeURIComponent(transfer.id)}/edit`
          ),
        onDispatch: (transfer) => openAction("dispatch", transfer),
        onReceive: (transfer) => openAction("receive", transfer),
        onReturn: (transfer) => openAction("return", transfer),
      }),
    [role, router]
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
        title="Stock Transfer 2"
        count={`${scopedTransfers.length} transfers`}
        actions={
          isHeadOffice ? null : (
            <Button
              size="sm"
              onClick={() => router.push("/inventory/stock-transfer-2/create")}
            >
              <PlusIcon />
              New Stock Request
            </Button>
          )
        }
      />

      <Card size="sm" className="ring-foreground/10">
        <CardContent className="flex items-start gap-3 pt-(--card-spacing) text-sm">
          <InfoIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div className="text-muted-foreground">
            {isHeadOffice ? (
              <>
                You are acting as{" "}
                <span className="font-medium text-foreground">
                  {activeBranch?.name ?? "Head Office"}
                </span>
                . Review incoming stock requests — approve (status becomes{" "}
                <em>Approved</em>, eligible for dispatch) or reject with a
                reason. Dispatch releases stock from Head Office inventory; the
                branch confirms receipt once goods arrive.
              </>
            ) : (
              <>
                You are acting as{" "}
                <span className="font-medium text-foreground">
                  {activeBranch?.name ?? "your branch"}
                </span>
                . Raise a request to pull stock from Head Office. After approval
                and dispatch (status becomes <em>In transit</em>), confirm
                receipt when the goods arrive.
              </>
            )}
          </div>
        </CardContent>
      </Card>

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
        ].toLowerCase()} transfers.`}
        onRowClick={(transfer) =>
          router.push(
            `/inventory/stock-transfer-2/${encodeURIComponent(transfer.id)}`
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
