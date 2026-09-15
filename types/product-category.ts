export const PRODUCT_CATEGORY_STATUSES = ["active", "inactive"] as const

export type ProductCategoryStatus = (typeof PRODUCT_CATEGORY_STATUSES)[number]

export type ProductCategory = {
  id: string
  name: string
  parentId: string | null
  parentName: string | null
  isSubCategory: boolean
  entryBy: string
  status: ProductCategoryStatus
}

export const productCategoryStatusLabels: Record<ProductCategoryStatus, string> =
  {
    active: "Active",
    inactive: "Inactive",
  }
