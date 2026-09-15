export const STOCK_ADJUSTMENT_STATUSES = [
  "approved",
  "draft",
  "for-approval",
  "cancelled",
] as const

export type StockAdjustmentStatus = (typeof STOCK_ADJUSTMENT_STATUSES)[number]

export const STOCK_ADJUSTMENT_TYPES = ["addition", "deduction"] as const

export type StockAdjustmentType = (typeof STOCK_ADJUSTMENT_TYPES)[number]

export type StockAdjustmentItem = {
  id: string
  productId: string
  name: string
  batch: string
  quantity: number
  unit: string
  rate: number
  itemTotal: number
}

export type StockAdjustment = {
  id: string
  date: string
  type: StockAdjustmentType
  billReference: string
  remarks: string
  entryBy: string
  status: StockAdjustmentStatus
  items: StockAdjustmentItem[]
}

export const stockAdjustmentStatusLabels: Record<
  StockAdjustmentStatus,
  string
> = {
  approved: "Approved",
  draft: "Draft",
  "for-approval": "For Approval",
  cancelled: "Cancelled",
}

export const stockAdjustmentTypeLabels: Record<StockAdjustmentType, string> = {
  addition: "Addition",
  deduction: "Deduction",
}

export const stockAdjustmentStatusBadgeClassName: Record<
  StockAdjustmentStatus,
  string
> = {
  approved:
    "border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  draft: "border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400",
  "for-approval": "border-transparent bg-info/15 text-info",
  cancelled: "border-transparent bg-destructive/15 text-destructive",
}
