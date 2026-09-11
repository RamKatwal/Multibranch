export const PURCHASE_ORDER_STATUSES = [
  "draft",
  "ordered",
  "received",
  "cancelled",
] as const

export type PurchaseOrderStatus = (typeof PURCHASE_ORDER_STATUSES)[number]

export type PurchaseOrderItem = {
  id: string
  productId: string
  name: string
  quantity: number
  unitCost: number
  totalPrice: number
}

export type PurchaseOrder = {
  id: string
  supplierId: string
  supplier: string
  orderDate: string
  status: PurchaseOrderStatus
  remarks: string
  items: PurchaseOrderItem[]
  totalAmount: number
}

export const purchaseOrderStatusLabels: Record<PurchaseOrderStatus, string> = {
  draft: "Draft",
  ordered: "Ordered",
  received: "Received",
  cancelled: "Cancelled",
}

export const purchaseOrderStatusBadgeClassName: Record<
  PurchaseOrderStatus,
  string
> = {
  draft: "border-transparent bg-warning/15 text-warning-foreground dark:text-warning",
  ordered: "border-transparent bg-info/15 text-info",
  received: "border-transparent bg-success/15 text-success",
  cancelled: "border-transparent bg-destructive/15 text-destructive",
}
