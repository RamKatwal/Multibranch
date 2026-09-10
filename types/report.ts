export const REPORT_AS_OF_PRESETS = [
  "fiscal-year-to-date",
  "this-month",
  "last-month",
  "this-quarter",
  "this-year",
  "custom",
] as const

export type ReportAsOfPreset = (typeof REPORT_AS_OF_PRESETS)[number]

export const reportAsOfPresetLabels: Record<ReportAsOfPreset, string> = {
  "fiscal-year-to-date": "This fiscal year to date",
  "this-month": "This month",
  "last-month": "Last month",
  "this-quarter": "This quarter",
  "this-year": "This year",
  custom: "Custom date",
}

/** One printed row of the Inventory Valuation Report. */
export type InventoryValuationLine = {
  /** ISO date of the movement; empty for opening/closing summary rows. */
  date: string
  /** "Opening Balance", "Closing Balance", or the movement type. */
  particulars: string
  reference: string
  /** Route to the source document for `reference`, when one can be resolved. */
  referenceHref?: string
  inwardQty: number
  inwardRate: number
  inwardAmount: number
  outwardQty: number
  outwardRate: number
  outwardAmount: number
  balanceQty: number
  balanceRate: number
  balanceAmount: number
  kind: "opening" | "movement" | "closing"
}

/** All rows for one product, rendered under a collapsible group header. */
export type InventoryValuationGroup = {
  productId: string
  productName: string
  lines: InventoryValuationLine[]
}
