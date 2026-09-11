import { mockProductConfiguration } from "@/lib/mock/product-configuration"
import type { ProductConfiguration } from "@/types/product-configuration"

const PRODUCT_CONFIGURATION_STORAGE_KEY = "ibmerp-product-configuration-v1"

export function readProductConfiguration(): ProductConfiguration {
  try {
    const saved = window.localStorage.getItem(PRODUCT_CONFIGURATION_STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved) as ProductConfiguration
    }
  } catch {
    // Fall back to mock seed data.
  }

  return { ...mockProductConfiguration }
}

export function saveProductConfiguration(configuration: ProductConfiguration) {
  window.localStorage.setItem(
    PRODUCT_CONFIGURATION_STORAGE_KEY,
    JSON.stringify(configuration)
  )
  return configuration
}
