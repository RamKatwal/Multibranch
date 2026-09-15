import { getBranchProductStock } from "@/lib/inventory/branch-stock"
import {
  getProductDetailById,
  mockProducts,
} from "@/lib/mock/products"
import { productBelongsToBranch, productTypeLabels } from "@/types/product"

const reportNumberFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 2,
})

/** Grouped-number display used across the report tables (no currency prefix). */
export function formatReportNumber(value: number) {
  return reportNumberFormatter.format(value === 0 ? 0 : value)
}

/** One row of the Reorder Inventory Report. */
export type ReorderInventoryRow = {
  itemCode: string
  productName: string
  sku: string
  productType: string
  category: string
  subCategory: string
  uom: string
  reorderQty: number
  closingStock: number
  isBelowReorder: boolean
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

type ReorderInventoryOptions = {
  branchId: string
  categoryFilter: string | "all"
  productIds: string[] | "all"
}

/**
 * Builds the Reorder Inventory Report for one branch: one row per goods
 * product with its reorder threshold and current closing stock.
 */
export function getReorderInventoryReport({
  branchId,
  categoryFilter,
  productIds,
}: ReorderInventoryOptions): ReorderInventoryRow[] {
  if (!branchId) return []

  return scopedProducts(branchId, productIds)
    .filter(
      (product) => categoryFilter === "all" || product.category === categoryFilter
    )
    .map((product) => {
      const detail = getProductDetailById(product.id)
      const reorderQty = detail?.reorderQty ?? 0
      const closingStock = getBranchProductStock(branchId, product.id)

      return {
        itemCode: product.id,
        productName: product.name,
        sku: detail?.sku ?? "",
        productType: productTypeLabels[product.type],
        category: product.category,
        subCategory: detail?.subCategory ?? "",
        uom: detail?.primaryUnit ?? "",
        reorderQty,
        closingStock,
        isBelowReorder: reorderQty > 0 && closingStock <= reorderQty,
      }
    })
}
