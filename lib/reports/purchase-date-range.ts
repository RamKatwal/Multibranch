import type { ReportAsOfPreset } from "@/types/report"

function toIso(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * The purchase mock generators (orders/requisitions/returns) date their
 * records on a synthetic "2082/83"-labelled epoch starting 2082-01-01, not
 * the real wall clock — the same convention the requisition/order/return
 * list pages already use. "As of" presets for these reports are resolved
 * relative to the last day of that epoch year rather than real "today", or
 * every record would fall outside a real-time cutoff. The largest generator
 * (purchase returns, 320 rows) only reaches day offset 319, safely inside
 * this year, so every mock record stays within the "fiscal-year-to-date" window.
 */
export const PURCHASE_MOCK_DATASET_TODAY = "2082-12-30"

/** Start/cutoff ISO dates for an "As of" preset, anchored to the purchase mock epoch. */
export function resolvePurchasePeriod(
  preset: ReportAsOfPreset,
  customDate: string | undefined
): { start: string; cutoff: string } {
  if (preset === "custom" && customDate?.trim()) {
    return { start: customDate, cutoff: customDate }
  }

  const cutoff = PURCHASE_MOCK_DATASET_TODAY
  const [year, month] = cutoff.split("-").map(Number)

  switch (preset) {
    case "this-month":
      return { start: toIso(new Date(year, month - 1, 1)), cutoff }
    case "last-month":
      return {
        start: toIso(new Date(year, month - 2, 1)),
        cutoff: toIso(new Date(year, month - 1, 0)),
      }
    case "this-quarter":
      return {
        start: toIso(new Date(year, Math.floor((month - 1) / 3) * 3, 1)),
        cutoff,
      }
    case "this-year":
    case "fiscal-year-to-date":
    default:
      return { start: toIso(new Date(year, 0, 1)), cutoff }
  }
}

export function isWithinPurchasePeriod(
  dateIso: string,
  start: string,
  cutoff: string
) {
  return dateIso >= start && dateIso <= cutoff
}
