import type { ProductConfiguration } from "@/types/product-configuration"

export const mockProductConfiguration: ProductConfiguration = {
  defaultUnit: "Pcs",
  costingMethod: "weighted_average",
  autoGenerateSku: true,
  skuPrefix: "PRD-",
  lowStockThreshold: 10,
  barcodeFormat: "code128",
}
