export const PRODUCT_TYPES = ["goods", "service"] as const
export const PRODUCT_STATUSES = ["active", "inactive"] as const
export const PRODUCT_STOCK_VALUATIONS = [
  "FIFO",
  "LIFO",
  "Weighted Average",
] as const

export type ProductType = (typeof PRODUCT_TYPES)[number]
export type ProductStatus = (typeof PRODUCT_STATUSES)[number]
export type ProductStockValuation = (typeof PRODUCT_STOCK_VALUATIONS)[number]

export type Product = {
  id: string
  name: string
  totalQuantity: number
  category: string
  type: ProductType
  entryBy: string
  status: ProductStatus
  createdBranchId?: string
  addedBranchIds?: string[]
}

/**
 * Fully resolved product record used by the Product Details view. Mirrors the
 * fields shown on the legacy system's product overview: identity, inventory,
 * pricing, GL mapping and opening balances.
 */
export type ProductDetail = Product & {
  alias: string | null
  sku: string | null
  hsCode: string | null
  itemCode: string | null
  tax: string | null
  stockValuation: ProductStockValuation
  expiryDate: string | null
  primaryUnit: string
  subCategory: string | null
  reorderQty: number | null
  availableQuantity: number
  holdQuantity: number
  batchTracking: boolean
  inventoryManaged: boolean
  isSellable: boolean
  costPrice: number
  sellingPrice: number
  discountPercent: number
  purchaseAccount: string
  salesAccount: string
  inventoryAccount: string
  openingQuantity: number | null
  openingRate: number | null
}

export const productTypeLabels: Record<ProductType, string> = {
  goods: "Goods",
  service: "Service",
}

export const productStatusLabels: Record<ProductStatus, string> = {
  active: "Active",
  inactive: "Inactive",
}
