"use client"

import * as React from "react"
import { TriangleAlertIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type {
  StockTransfer,
  StockTransferAction,
} from "@/types/stock-transfer"

export type { StockTransferAction }

export type StockTransferActionConfirmPayload = {
  rejectionReason?: string
}

type StockTransferActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  action: StockTransferAction
  transfer: StockTransfer | null
  blockedReason?: string | null
  onConfirm: (payload?: StockTransferActionConfirmPayload) => void
}

const ACTION_COPY: Record<
  StockTransferAction,
  {
    title: string
    confirmLabel: string
    destructive?: boolean
    body: (transfer: StockTransfer) => string
  }
> = {
  approve: {
    title: "Approve stock request",
    confirmLabel: "Approve",
    body: (t) =>
      `${t.id} will be marked Approved and become eligible for dispatch to ${t.toBranch}. Stock stays at ${t.fromBranch} until you dispatch.`,
  },
  reject: {
    title: "Reject stock request",
    confirmLabel: "Reject",
    destructive: true,
    body: (t) =>
      `${t.toBranch} will be notified that ${t.id} was rejected. No stock will move. They can raise a new request.`,
  },
  dispatch: {
    title: "Dispatch stock",
    confirmLabel: "Dispatch",
    body: (t) =>
      `${t.totalQuantity} unit${t.totalQuantity === 1 ? "" : "s"} across ${
        t.items.length
      } item${t.items.length === 1 ? "" : "s"} will be released from ${
        t.fromBranch
      } and marked in transit to ${t.toBranch}.`,
  },
  receive: {
    title: "Confirm receipt",
    confirmLabel: "Confirm receipt",
    body: (t) =>
      `Confirm that ${t.id} has arrived at ${t.toBranch}. ${
        t.totalQuantity
      } unit${t.totalQuantity === 1 ? "" : "s"} will be added to ${
        t.toBranch
      } stock.`,
  },
  return: {
    title: "Return stock",
    confirmLabel: "Return",
    destructive: true,
    body: (t) =>
      `${t.totalQuantity} unit${
        t.totalQuantity === 1 ? "" : "s"
      } will leave ${t.toBranch} and go back to ${t.fromBranch}.`,
  },
}

export function StockTransferActionDialog({
  open,
  onOpenChange,
  action,
  transfer,
  blockedReason,
  onConfirm,
}: StockTransferActionDialogProps) {
  const copy = ACTION_COPY[action]
  const isBlocked = Boolean(blockedReason)
  const isReject = action === "reject" && !isBlocked
  const [rejectionReason, setRejectionReason] = React.useState("")
  const [reasonError, setReasonError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) return
    // Reset when the dialog opens for a new action.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRejectionReason("")
    setReasonError(null)
  }, [open, action, transfer?.id])

  function handleConfirm() {
    if (isReject) {
      const trimmed = rejectionReason.trim()
      if (!trimmed) {
        setReasonError("Rejection reason is required.")
        return
      }
      onConfirm({ rejectionReason: trimmed })
      return
    }
    onConfirm()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isBlocked ? (
              <TriangleAlertIcon className="size-5 text-destructive" />
            ) : null}
            {isBlocked ? "Cannot proceed" : copy.title}
          </DialogTitle>
          <DialogDescription>
            {isBlocked
              ? blockedReason
              : transfer
                ? copy.body(transfer)
                : null}
          </DialogDescription>
        </DialogHeader>

        {isReject ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="stock-transfer-2-rejection-reason">
              Rejection reason <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="stock-transfer-2-rejection-reason"
              value={rejectionReason}
              onChange={(event) => {
                setRejectionReason(event.target.value)
                if (reasonError) setReasonError(null)
              }}
              placeholder="Explain why this request is being rejected…"
              rows={3}
              aria-invalid={Boolean(reasonError)}
              aria-describedby={
                reasonError ? "stock-transfer-2-rejection-reason-error" : undefined
              }
            />
            {reasonError ? (
              <p
                id="stock-transfer-2-rejection-reason-error"
                className="text-xs text-destructive"
              >
                {reasonError}
              </p>
            ) : null}
          </div>
        ) : null}

        <DialogFooter>
          {isBlocked ? (
            <Button type="button" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant={copy.destructive ? "destructive" : "default"}
                onClick={handleConfirm}
              >
                {copy.confirmLabel}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
