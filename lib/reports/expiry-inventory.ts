import { getBranchProductStock } from "@/lib/inventory/branch-stock"
import {
  getProductDetailById,
  mockProducts,
} from "@/lib/mock/products"
import {
  getInventoryValuationProducts,
  type InventoryValuationProduct,
} from "@/lib/reports/inventory-valuation"
import { productBelongsToBranch, productTypeLabels } from "@/types/product"

/** One row of the Expiry Inventory Report. */
export type ExpiryInventoryRow = {
  productCode: string
  productName: string
  batchNumber: string
  productType: string
  category: string
  subCategory: string
  uom: string
  expiryDate: string
  remainingDays: number
}

function scopedProducts(branchId: string, productIds: string[] | "all") {
  const wanted = productIds === "all" ? null : new Set(productIds)

  const goods = mockProducts.filter((product) => product.type === "goods")

  const forBranch = goods.filter(
    (product) =>
      productBelongsToBranch(product, branchId) ||
      getBranchProductStock(branchId, product.id) > 0
  )

  const base = forBranch.length > 0 ? forBranch : goods

  return wanted ? base.filter((product) => wanted.has(product.id)) : base
}

/** Goods products with an expiry date, available in the report's "Product" filter. */
export function getExpiryInventoryProducts(
  branchId: string
): InventoryValuationProduct[] {
  return getInventoryValuationProducts(branchId).filter(
    (product) => getProductDetailById(product.id)?.expiryDate
  )
}

function remainingDaysUntil(expiryDate: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(expiryDate)
  const expiry = match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date(expiryDate)

  const msPerDay = 24 * 60 * 60 * 1000
  return Math.round((expiry.getTime() - today.getTime()) / msPerDay)
}

type ExpiryInventoryOptions = {
  branchId: string
  categoryFilter: string | "all"
  productIds: string[] | "all"
}

/**
 * Builds the Expiry Inventory Report for one branch: one row per goods
 * product that has an expiry date set, with days remaining until it expires
 * (negative once it has already expired).
 */
export function getExpiryInventoryReport({
  branchId,
  categoryFilter,
  productIds,
}: ExpiryInventoryOptions): ExpiryInventoryRow[] {
  if (!branchId) return []

  const rows: ExpiryInventoryRow[] = []

  for (const product of scopedProducts(branchId, productIds)) {
    if (categoryFilter !== "all" && product.category !== categoryFilter) continue

    const detail = getProductDetailById(product.id)
    if (!detail?.expiryDate) continue

    rows.push({
      productCode: product.id,
      productName: product.name,
      batchNumber: detail.batchTracking ? `${product.id}-B1` : "",
      productType: productTypeLabels[product.type],
      category: product.category,
      subCategory: detail.subCategory ?? "",
      uom: detail.primaryUnit ?? "",
      expiryDate: detail.expiryDate,
      remainingDays: remainingDaysUntil(detail.expiryDate),
    })
  }

  return rows
}
