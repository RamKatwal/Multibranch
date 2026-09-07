export const STOCK_TRANSFER_STATUSES = [
  "completed",
  "in-transit",
  "draft",
] as const

export type StockTransferStatus = (typeof STOCK_TRANSFER_STATUSES)[number]

export type StockTransferItem = {
  id: string
  productId?: string
  name: string
  quantity: number
  rate: number
  totalPrice: number
}

export const stockTransferStatusBadgeClassName: Record<
  StockTransferStatus,
  string
> = {
  completed: "border-transparent bg-success/15 text-success",
  "in-transit": "border-transparent bg-info/15 text-info",
  draft: "border-border text-muted-foreground",
}

export type StockTransfer = {
  id: string
  fromBranch: string
  toBranch: string
  date: string
  remarks: string
  items: StockTransferItem[]
  totalQuantity: number
  totalAmount: number
  entryBy: string
  status: StockTransferStatus
}

export const stockTransferStatusLabels: Record<StockTransferStatus, string> = {
  completed: "Completed",
  "in-transit": "In Transit",
  draft: "Draft",
}
