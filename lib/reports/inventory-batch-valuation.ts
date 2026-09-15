import { getBranchProductStock } from "@/lib/inventory/branch-stock"
import { isOnOrBefore, resolvePeriodStart } from "@/lib/reports/date-range"
import { referenceHref } from "@/lib/reports/inventory-valuation"
import {
  getProductDetailById,
  getProductTransactions,
  mockProducts,
} from "@/lib/mock/products"
import { productBelongsToBranch } from "@/types/product"
import type { ReportAsOfPreset } from "@/types/report"

const reportNumberFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 2,
})

/** Grouped-number display used across the report tables (no currency prefix). */
export function formatReportNumber(value: number) {
  // Collapse negative zero so cells never render "-0".
  return reportNumberFormatter.format(value === 0 ? 0 : value)
}

/** One printed row of the Batch-wise Inventory Valuation Report. */
export type BatchValuationLine = {
  /** ISO date of the movement; empty for opening/closing summary rows. */
  date: string
  /** "Opening Balance", "Closing Balance", or the movement type. */
  particulars: string
  /** ISO expiry date of the product's batch, blank if none is set. */
  expiresOn: string
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
export type BatchValuationGroup = {
  productId: string
  productName: string
  lines: BatchValuationLine[]
}

type BatchValuationOptions = {
  branchId: string
  preset: ReportAsOfPreset
  customDate?: string
  /** `"all"` or an explicit list of product ids to include. */
  productIds: string[] | "all"
}

export type BatchValuationProduct = {
  id: string
  name: string
  /** Human-facing product code, e.g. "PRD1". */
  code: string
  status: "active" | "inactive"
  /** Selling price, shown in the product picker. */
  price: number
}

/** Goods products available to pick in the report's "Products" filter. */
export function getBatchValuationProducts(
  branchId: string
): BatchValuationProduct[] {
  return scopedProducts(branchId, "all").map((product) => ({
    id: product.id,
    name: product.name,
    code: product.id,
    status: product.status,
    price: getProductDetailById(product.id)?.sellingPrice ?? 0,
  }))
}

function scopedProducts(branchId: string, productIds: string[] | "all") {
  const wanted = productIds === "all" ? null : new Set(productIds)

  // Batch valuation covers stock-tracked goods, active or inactive — an
  // inactive product can still hold stock that carries a value.
  const goods = mockProducts.filter((product) => product.type === "goods")

  const forBranch = goods.filter(
    (product) =>
      productBelongsToBranch(product, branchId) ||
      getBranchProductStock(branchId, product.id) > 0
  )

  const base = forBranch.length > 0 ? forBranch : goods

  return wanted ? base.filter((product) => wanted.has(product.id)) : base
}

function emptyLine(
  partial: Partial<BatchValuationLine> &
    Pick<BatchValuationLine, "kind" | "particulars">
): BatchValuationLine {
  return {
    date: "",
    expiresOn: "",
    reference: "",
    inwardQty: 0,
    inwardRate: 0,
    inwardAmount: 0,
    outwardQty: 0,
    outwardRate: 0,
    outwardAmount: 0,
    balanceQty: 0,
    balanceRate: 0,
    balanceAmount: 0,
    ...partial,
  }
}

/**
 * Builds the Batch-wise Inventory Valuation Report for one branch: per product, an
 * opening balance, each stock movement within the selected period split into inward /
 * outward columns with a running balance, and a closing balance — plus the batch's
 * expiry date on every row.
 *
 * Figures are derived from the mock inventory model — current on-hand comes from
 * `getBranchProductStock` (Head Office holds the full catalogue; other branches
 * derive from stock transfers) and unit rate from the product's cost price. The
 * opening balance is back-calculated from the closing on-hand less the period's
 * net movement, then lifted so the running balance never dips below zero. The
 * expiry date comes from `ProductDetail.expiryDate` and is blank when unset.
 */
export function getBatchValuationReport({
  branchId,
  preset,
  customDate,
  productIds,
}: BatchValuationOptions): BatchValuationGroup[] {
  if (!branchId) return []

  const periodStart = resolvePeriodStart(preset, customDate)
  // "As of" is today for every non-custom preset; for `custom` it is the picked
  // date. Movements after the cut-off are excluded.
  const cutoff =
    preset === "custom" && customDate?.trim() ? customDate : todayIso()

  return scopedProducts(branchId, productIds).map((product) => {
    const detail = getProductDetailById(product.id)
    const rate = detail?.costPrice ?? 0
    const expiresOn = detail?.expiryDate ?? ""
    const onHand = getBranchProductStock(branchId, product.id)

    const movements = getProductTransactions(product.id)
      .filter(
        (txn) =>
          isOnOrBefore(periodStart, txn.date) && isOnOrBefore(txn.date, cutoff)
      )
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))

    const netInPeriod = movements.reduce((sum, txn) => sum + txn.quantity, 0)

    // Deepest cumulative outflow across the period — the opening balance must be
    // at least this high for the running balance to stay non-negative.
    let cumulative = 0
    let deepestDip = 0
    for (const txn of movements) {
      cumulative += txn.quantity
      deepestDip = Math.min(deepestDip, cumulative)
    }

    const openingQty = Math.max(onHand - netInPeriod, Math.abs(deepestDip))
    const closingQty = openingQty + netInPeriod

    const lines: BatchValuationLine[] = []
    let runningQty = openingQty

    if (openingQty !== 0 || movements.length > 0) {
      lines.push(
        emptyLine({
          kind: "opening",
          particulars: "Opening Balance",
          expiresOn,
          balanceQty: openingQty,
          balanceRate: rate,
          balanceAmount: openingQty * rate,
        })
      )
    }

    let periodInwardQty = 0
    let periodOutwardQty = 0

    for (const txn of movements) {
      const isInward = txn.quantity >= 0
      const qty = Math.abs(txn.quantity)
      runningQty += txn.quantity

      if (isInward) periodInwardQty += qty
      else periodOutwardQty += qty

      lines.push(
        emptyLine({
          kind: "movement",
          particulars: txn.type,
          date: txn.date,
          expiresOn,
          reference: txn.reference,
          referenceHref: referenceHref(txn.reference),
          inwardQty: isInward ? qty : 0,
          inwardRate: isInward ? rate : 0,
          inwardAmount: isInward ? qty * rate : 0,
          outwardQty: isInward ? 0 : qty,
          outwardRate: isInward ? 0 : rate,
          outwardAmount: isInward ? 0 : qty * rate,
          balanceQty: runningQty,
          balanceRate: rate,
          balanceAmount: runningQty * rate,
        })
      )
    }

    lines.push(
      emptyLine({
        kind: "closing",
        particulars: "Closing Balance",
        expiresOn,
        inwardQty: periodInwardQty,
        inwardRate: periodInwardQty > 0 ? rate : 0,
        inwardAmount: periodInwardQty * rate,
        outwardQty: periodOutwardQty,
        outwardRate: periodOutwardQty > 0 ? rate : 0,
        outwardAmount: periodOutwardQty * rate,
        balanceQty: closingQty,
        balanceRate: rate,
        balanceAmount: closingQty * rate,
      })
    )

    return {
      productId: product.id,
      productName: product.name,
      lines,
    }
  })
}

function todayIso() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}
