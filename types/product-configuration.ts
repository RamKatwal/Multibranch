export const COSTING_METHODS = ["fifo", "lifo", "weighted_average"] as const

export type CostingMethod = (typeof COSTING_METHODS)[number]

export const costingMethodLabels: Record<CostingMethod, string> = {
  fifo: "FIFO (First In, First Out)",
  lifo: "LIFO (Last In, First Out)",
  weighted_average: "Weighted Average",
}

export const BARCODE_FORMATS = ["code128", "ean13", "qr"] as const

export type BarcodeFormat = (typeof BARCODE_FORMATS)[number]

export const barcodeFormatLabels: Record<BarcodeFormat, string> = {
  code128: "Code 128",
  ean13: "EAN-13",
  qr: "QR Code",
}

export type ProductConfiguration = {
  defaultUnit: string
  costingMethod: CostingMethod
  autoGenerateSku: boolean
  skuPrefix: string
  lowStockThreshold: number
  barcodeFormat: BarcodeFormat
}
