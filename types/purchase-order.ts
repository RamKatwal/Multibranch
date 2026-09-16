export const PURCHASE_ORDER_STATUSES = [
  "approved",
  "draft",
  "for-approval",
  "cancelled",
] as const

export type PurchaseOrderStatus = (typeof PURCHASE_ORDER_STATUSES)[number]

export const purchaseOrderStatusLabels: Record<PurchaseOrderStatus, string> = {
  approved: "Approved",
  draft: "Draft",
  "for-approval": "For Approval",
  cancelled: "Cancelled",
}

export const purchaseOrderStatusBadgeClassName: Record<
  PurchaseOrderStatus,
  string
> = {
  approved: "border-transparent bg-success/15 text-success",
  draft: "border-transparent bg-warning/15 text-warning-foreground dark:text-warning",
  "for-approval": "border-transparent bg-info/15 text-info",
  cancelled: "border-transparent bg-destructive/15 text-destructive",
}

export const PURCHASE_ORDER_VAT_OPTIONS = ["no-vat", "vat"] as const

export type PurchaseOrderVatOption = (typeof PURCHASE_ORDER_VAT_OPTIONS)[number]

export const purchaseOrderVatLabels: Record<PurchaseOrderVatOption, string> = {
  "no-vat": "No VAT",
  vat: "VAT (13%)",
}

export const PURCHASE_ORDER_VAT_RATE = 0.13

export type PurchaseOrderItem = {
  id: string
  productId: string
  name: string
  unit: string
  quantity: number
  rate: number
  discountPercent: number
  vat: PurchaseOrderVatOption
  amount: number
}

export type PurchaseOrder = {
  id: string
  supplierId: string
  supplier: string
  referenceId: string
  reference: string
  entryDate: string
  deliveryDate: string
  paymentPeriodId: string
  paymentPeriod: string
  status: PurchaseOrderStatus
  remarks: string
  entryBy?: string
  items: PurchaseOrderItem[]
  additionalDiscount: number
  subTotal: number
  taxableTotal: number
  nonTaxableTotal: number
  vatAmount: number
  grandTotal: number
}
