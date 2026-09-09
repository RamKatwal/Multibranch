export const STOCK_TRANSFER_STATUSES = [
  "requested",
  "approved",
  "in-transit",
  "completed",
  "returned",
  "rejected",
] as const

export type StockTransferStatus = (typeof STOCK_TRANSFER_STATUSES)[number]

/** Workflow actions that move a transfer between statuses. */
export type StockTransferAction =
  | "approve"
  | "reject"
  | "dispatch"
  | "receive"
  | "return"

export type StockTransferItem = {
  id: string
  productId: string
  name: string
  quantity: number
  rate: number
  totalPrice: number
}

export const stockTransferStatusBadgeClassName: Record<
  StockTransferStatus,
  string
> = {
  requested: "border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400",
  approved: "border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  "in-transit": "border-transparent bg-info/15 text-info",
  completed: "border-transparent bg-success/15 text-success",
  returned: "border-border text-muted-foreground",
  rejected: "border-transparent bg-destructive/15 text-destructive",
}

export type StockTransfer = {
  id: string
  fromBranch: string
  fromBranchId: string
  toBranch: string
  toBranchId: string
  date: string
  remarks: string
  /** Required when status is `rejected`. */
  rejectionReason?: string
  items: StockTransferItem[]
  totalQuantity: number
  totalAmount: number
  entryBy: string
  status: StockTransferStatus
}

export const stockTransferStatusLabels: Record<StockTransferStatus, string> = {
  requested: "Requested",
  approved: "Approved",
  "in-transit": "In Transit",
  completed: "Completed",
  returned: "Returned",
  rejected: "Rejected",
}
