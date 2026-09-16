export const SALES_ORDER_STATUSES = [
  "approved",
  "draft",
  "for-approval",
  "cancelled",
] as const

export type SalesOrderStatus = (typeof SALES_ORDER_STATUSES)[number]

export const salesOrderStatusLabels: Record<SalesOrderStatus, string> = {
  approved: "Approved",
  draft: "Draft",
  "for-approval": "For Approval",
  cancelled: "Cancelled",
}

export const salesOrderStatusBadgeClassName: Record<SalesOrderStatus, string> = {
  approved: "border-transparent bg-success/15 text-success",
  draft: "border-transparent bg-warning/15 text-warning-foreground dark:text-warning",
  "for-approval": "border-transparent bg-info/15 text-info",
  cancelled: "border-transparent bg-destructive/15 text-destructive",
}

export const SALES_ORDER_VAT_OPTIONS = ["no-vat", "vat"] as const

export type SalesOrderVatOption = (typeof SALES_ORDER_VAT_OPTIONS)[number]

export const salesOrderVatLabels: Record<SalesOrderVatOption, string> = {
  "no-vat": "No VAT",
  vat: "VAT (13%)",
}

export const SALES_ORDER_VAT_RATE = 0.13

export type SalesOrderItem = {
  id: string
  productId: string
  name: string
  unit: string
  quantity: number
  rate: number
  discountPercent: number
  vat: SalesOrderVatOption
  amount: number
}

export type SalesOrder = {
  id: string
  customerId: string
  customer: string
  entryDate: string
  deliveryDate: string
  status: SalesOrderStatus
  remarks: string
  entryBy?: string
  items: SalesOrderItem[]
  additionalDiscount: number
  subTotal: number
  taxableTotal: number
  nonTaxableTotal: number
  vatAmount: number
  grandTotal: number
}
