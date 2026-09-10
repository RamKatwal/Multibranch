import { addNotification } from "@/lib/notifications/storage"
import { upsertStockTransfer } from "@/lib/stock-transfer-2/storage"
import type {
  StockTransfer,
  StockTransferAction,
  StockTransferStatus,
} from "@/types/stock-transfer"

/** The status a transfer moves to when each action is confirmed. */
export const NEXT_STATUS: Record<StockTransferAction, StockTransferStatus> = {
  approve: "approved",
  reject: "rejected",
  dispatch: "in-transit",
  receive: "completed",
  return: "returned",
}

export const ACTION_TOAST: Record<StockTransferAction, string> = {
  approve: "Request approved — eligible for dispatch.",
  reject: "Request rejected. Requester notified.",
  dispatch: "Dispatched — stock is in transit.",
  receive: "Receipt confirmed — stock added to your branch.",
  return: "Stock returned to Head Office.",
}

export type RunStockTransferActionOptions = {
  /** Required when action is `reject`. */
  rejectionReason?: string
}

/**
 * Apply a workflow action to a transfer. Branch inventory is derived from
 * transfer status (see `lib/inventory/branch-stock.ts`), so the only write is
 * the status change itself.
 *
 * Flow: requested → approve → approved → dispatch → in-transit → receive → completed
 */
export function runStockTransferAction(
  transfer: StockTransfer,
  action: StockTransferAction,
  options?: RunStockTransferActionOptions
): StockTransfer {
  if (action === "reject") {
    const reason = options?.rejectionReason?.trim() ?? ""
    if (!reason) {
      throw new Error("Rejection reason is required.")
    }

    const next: StockTransfer = {
      ...transfer,
      status: "rejected",
      rejectionReason: reason,
    }
    upsertStockTransfer(next)
    notifyRequesterOfRejection(next)
    return next
  }

  const next: StockTransfer = {
    ...transfer,
    status: NEXT_STATUS[action],
    // Clear any prior rejection reason if the record is reused.
    rejectionReason: undefined,
  }
  upsertStockTransfer(next)
  return next
}

function notifyRequesterOfRejection(transfer: StockTransfer) {
  const reason = transfer.rejectionReason?.trim() || "No reason provided."
  const entryBy = transfer.entryBy.trim() || "Requester"
  addNotification({
    title: `Stock request ${transfer.id} rejected`,
    description: `${transfer.fromBranch} rejected the request from ${transfer.toBranch} (entered by ${entryBy}). Reason: ${reason}`,
    icon: "check",
    badges: [{ label: "Rejected", tone: "urgent" }],
    actions: [
      { id: "view", label: "View request", variant: "secondary" },
    ],
  })
}
