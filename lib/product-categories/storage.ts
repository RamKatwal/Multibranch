import { mockProductCategories } from "@/lib/mock/product-categories"
import type { ProductCategory } from "@/types/product-category"

const PRODUCT_CATEGORIES_STORAGE_KEY = "ibmerp-product-categories-v1"

export function readProductCategories(): ProductCategory[] {
  try {
    const saved = window.localStorage.getItem(PRODUCT_CATEGORIES_STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved) as ProductCategory[]
    }
  } catch {
    // Fall back to mock seed data.
  }

  return mockProductCategories.map((category) => ({ ...category }))
}

export function saveProductCategories(categories: ProductCategory[]) {
  window.localStorage.setItem(
    PRODUCT_CATEGORIES_STORAGE_KEY,
    JSON.stringify(categories)
  )
  return categories
}

export function createProductCategoryId(categories: ProductCategory[]) {
  const max = categories.reduce((highest, category) => {
    const match = /^PRC(\d+)$/i.exec(category.id)
    if (!match) return highest
    return Math.max(highest, Number(match[1]))
  }, 0)

  return `PRC${max + 1}`
}
