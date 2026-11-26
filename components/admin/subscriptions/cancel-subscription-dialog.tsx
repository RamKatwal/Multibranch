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
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import type { Subscription } from "@/types/subscription"

type CancelSubscriptionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscription: Subscription
  onConfirm: () => void
}

export function CancelSubscriptionDialog({
  open,
  onOpenChange,
  subscription,
  onConfirm,
}: CancelSubscriptionDialogProps) {
  const [confirmText, setConfirmText] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)

  const confirmValue = subscription.id
  const isMatch =
    confirmText.trim().toUpperCase() === confirmValue.toUpperCase()

  function handleOpenChange(nextOpen: boolean) {
    // Reset local dialog state when the dialog is closed.
    if (!nextOpen) {
      setConfirmText("")
      setIsLoading(false)
    }
    onOpenChange(nextOpen)
  }

  function handleConfirm() {
    if (!isMatch) return
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      onConfirm()
      onOpenChange(false)
    }, 1200)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-error-text">
            <TriangleAlertIcon className="size-5" />
            Cancel subscription
          </DialogTitle>
          <DialogDescription>
            This action is irreversible. Your subscription to{" "}
            <span className="font-medium text-fg">
              {subscription.planName}
            </span>{" "}
            for{" "}
            <span className="font-medium text-fg">
              {subscription.companyName}
            </span>{" "}
            will be canceled immediately. You will lose access to all paid
            features at the end of your current billing period.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
          <p className="text-sm text-error-text">
            All branch allocations, user seats, and module access tied to this
            subscription will be revoked. This cannot be undone.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="cancel-confirm-input"
            className="text-sm font-medium"
          >
            Type{" "}
            <span className="rounded bg-fill2 px-1.5 py-0.5 font-mono text-xs font-semibold">
              {confirmValue}
            </span>{" "}
            to confirm
          </label>
          <Input
            id="cancel-confirm-input"
            placeholder={confirmValue}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            autoComplete="off"
            autoFocus
          />
        </div>

        <DialogFooter>
          <Button variant="outline" color="neutral"
            type="button"
            onClick={() => onOpenChange(false)}
          >
            Keep subscription
          </Button>
          <Button variant="soft" color="error"
            type="button"
            disabled={!isMatch || isLoading}
            onClick={handleConfirm}
            className="whitespace-nowrap"
          >
            {isLoading ? (
              <Spinner size={18} variant="default" />
            ) : (
              "Cancel subscription"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
