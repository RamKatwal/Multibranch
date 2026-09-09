"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  PackageIcon,
  PencilIcon,
  TruckIcon,
  Undo2Icon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/page-header"
import {
  StockTransferActionDialog,
  type StockTransferAction,
  type StockTransferActionConfirmPayload,
} from "@/components/stock-transfer/stock-transfer-action-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatCurrency, formatDate } from "@/lib/format"
import {
  assertHeadOfficeHasStock,
  getActiveBranchContext,
} from "@/lib/inventory/branch-stock"
import { ACTION_TOAST, runStockTransferAction } from "@/lib/stock-transfer/actions"
import { getStockTransferById } from "@/lib/stock-transfer/storage"
import { cn } from "@/lib/utils"
import type { Branch } from "@/types/branch"
import {
  stockTransferStatusBadgeClassName,
  stockTransferStatusLabels,
  type StockTransfer,
} from "@/types/stock-transfer"

function formatEntryBy(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return "—"
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

function DetailRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <dt className="shrink-0 text-xs text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right text-sm font-medium wrap-break-word">
        {children}
      </dd>
    </div>
  )
}

export function StockTransferDetailPage({
  transferId,
}: {
  transferId: string
}) {
  const router = useRouter()
  const [transfer, setTransfer] = React.useState<StockTransfer | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [activeBranch, setActiveBranch] = React.useState<Branch | null>(null)
  const [isHeadOffice, setIsHeadOffice] = React.useState(false)

  const [pendingAction, setPendingAction] = React.useState<{
    action: StockTransferAction
    blockedReason: string | null
  } | null>(null)

  React.useEffect(() => {
    const decoded = decodeURIComponent(transferId)
    const { branch, isHeadOffice: ho } = getActiveBranchContext()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveBranch(branch)
    setIsHeadOffice(ho)
    setTransfer(getStockTransferById(decoded) ?? null)
    setIsLoading(false)
  }, [transferId])

  function openAction(action: StockTransferAction) {
    if (!transfer) return
    const blockedReason =
      action === "approve" || action === "dispatch"
        ? assertHeadOfficeHasStock(transfer)
        : null
    setPendingAction({ action, blockedReason })
  }

  function confirmAction(payload?: StockTransferActionConfirmPayload) {
    if (!transfer || !pendingAction || pendingAction.blockedReason) return
    try {
      const next = runStockTransferAction(
        transfer,
        pendingAction.action,
        payload
      )
      setTransfer(next)
      toast.success(ACTION_TOAST[pendingAction.action])
      setPendingAction(null)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update transfer."
      )
    }
  }

  if (isLoading) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        Loading transfer…
      </div>
    )
  }

  if (!transfer) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <h1 className="text-xl font-semibold">Transfer not found</h1>
        <p className="text-sm text-muted-foreground">
          This stock transfer does not exist or has been removed.
        </p>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/inventory/stock-transfer" />}
        >
          Back to transfers
        </Button>
      </div>
    )
  }

  const isRequestingBranch = activeBranch?.id === transfer.toBranchId
  const canApprove = isHeadOffice && transfer.status === "requested"
  const canDispatch = isHeadOffice && transfer.status === "approved"
  const canEdit = isRequestingBranch && transfer.status === "requested"
  const canReceive = isRequestingBranch && transfer.status === "in-transit"
  const canReturn = isRequestingBranch && transfer.status === "completed"

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={transfer.id}
        badge={
          <Badge
            variant="outline"
            className={cn(stockTransferStatusBadgeClassName[transfer.status])}
          >
            {stockTransferStatusLabels[transfer.status]}
          </Badge>
        }
        breadcrumb={
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 h-7 w-fit px-2 text-muted-foreground"
            nativeButton={false}
            render={<Link href="/inventory/stock-transfer" />}
          >
            <ArrowLeftIcon />
            Back to transfers
          </Button>
        }
        actions={
          <>
            {canEdit ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  router.push(
                    `/inventory/stock-transfer/${encodeURIComponent(transfer.id)}/edit`
                  )
                }
              >
                <PencilIcon />
                Edit
              </Button>
            ) : null}
            {canApprove ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openAction("reject")}
                >
                  <XIcon />
                  Reject
                </Button>
                <Button size="sm" onClick={() => openAction("approve")}>
                  <CheckIcon />
                  Approve
                </Button>
              </>
            ) : null}
            {canDispatch ? (
              <Button size="sm" onClick={() => openAction("dispatch")}>
                <TruckIcon />
                Dispatch
              </Button>
            ) : null}
            {canReceive ? (
              <Button size="sm" onClick={() => openAction("receive")}>
                <CheckIcon />
                Confirm receipt
              </Button>
            ) : null}
            {canReturn ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openAction("return")}
              >
                <Undo2Icon />
                Return
              </Button>
            ) : null}
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="flex flex-col gap-4">
          <Card
            size="sm"
            className="overflow-hidden ring-primary/15 bg-gradient-to-br from-primary/5 via-card to-card"
          >
            <CardContent className="pt-(--card-spacing)">
              <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                <div className="rounded-lg border bg-background/80 p-4">
                  <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                    From
                  </p>
                  <p className="mt-1 text-base font-semibold tracking-tight">
                    {transfer.fromBranch}
                  </p>
                </div>
                <div className="flex justify-center">
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                    <ArrowRightIcon className="size-4" />
                  </span>
                </div>
                <div className="rounded-lg border bg-background/80 p-4">
                  <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                    To
                  </p>
                  <p className="mt-1 text-base font-semibold tracking-tight">
                    {transfer.toBranch}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card size="sm" className="ring-foreground/10">
            <CardHeader className="border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <PackageIcon className="size-3.5" />
                </span>
                <div>
                  <CardTitle>Requested items</CardTitle>
                  <CardDescription>
                    {transfer.items.length} line
                    {transfer.items.length === 1 ? "" : "s"} ·{" "}
                    {transfer.totalQuantity} total qty
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 text-left text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                      <th className="px-4 py-2.5 font-medium">#</th>
                      <th className="px-4 py-2.5 font-medium">Item</th>
                      <th className="px-4 py-2.5 text-right font-medium">Qty</th>
                      <th className="px-4 py-2.5 text-right font-medium">Rate</th>
                      <th className="px-4 py-2.5 text-right font-medium">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transfer.items.map((item, index) => (
                      <tr
                        key={item.id}
                        className="border-b last:border-0 hover:bg-muted/30"
                      >
                        <td className="px-4 py-3 text-muted-foreground tabular-nums">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 font-medium">{item.name}</td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {formatCurrency(item.rate)}
                        </td>
                        <td className="px-4 py-3 text-right font-medium tabular-nums">
                          {formatCurrency(item.totalPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted/40">
                      <td
                        colSpan={4}
                        className="px-4 py-3 text-right text-xs font-medium text-muted-foreground"
                      >
                        Grand total
                      </td>
                      <td className="px-4 py-3 text-right text-base font-semibold tabular-nums">
                        {formatCurrency(transfer.totalAmount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>

          {transfer.remarks.trim() ? (
            <Card size="sm" className="ring-foreground/10">
              <CardHeader className="border-b pb-3">
                <CardTitle>Remarks</CardTitle>
              </CardHeader>
              <CardContent className="pt-(--card-spacing)">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {transfer.remarks}
                </p>
              </CardContent>
            </Card>
          ) : null}

          {transfer.status === "rejected" &&
          transfer.rejectionReason?.trim() ? (
            <Card size="sm" className="ring-destructive/20">
              <CardHeader className="border-b pb-3">
                <CardTitle className="text-destructive">
                  Rejection reason
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-(--card-spacing)">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {transfer.rejectionReason}
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-4 lg:self-start">
          <Card size="sm" className="ring-foreground/10">
            <CardHeader className="border-b pb-3">
              <CardTitle>Details</CardTitle>
              <CardDescription>Transfer metadata</CardDescription>
            </CardHeader>
            <CardContent className="pt-(--card-spacing)">
              <dl className="flex flex-col">
                <DetailRow label="Date">{formatDate(transfer.date)}</DetailRow>
                <DetailRow label="Status">
                  {stockTransferStatusLabels[transfer.status]}
                </DetailRow>
                <DetailRow label="Entry by">
                  {formatEntryBy(transfer.entryBy)}
                </DetailRow>
                <DetailRow label="Items">{transfer.items.length}</DetailRow>
                <DetailRow label="Total qty">
                  <span className="tabular-nums">{transfer.totalQuantity}</span>
                </DetailRow>
                <div className="mt-2 border-t pt-2">
                  <DetailRow label="Amount">
                    <span className="text-base font-semibold tabular-nums">
                      {formatCurrency(transfer.totalAmount)}
                    </span>
                  </DetailRow>
                </div>
              </dl>
            </CardContent>
          </Card>
        </aside>
      </div>

      <StockTransferActionDialog
        open={Boolean(pendingAction)}
        onOpenChange={(open) => {
          if (!open) setPendingAction(null)
        }}
        action={pendingAction?.action ?? "approve"}
        transfer={transfer}
        blockedReason={pendingAction?.blockedReason}
        onConfirm={confirmAction}
      />
    </div>
  )
}
