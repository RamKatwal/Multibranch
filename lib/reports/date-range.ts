import { todayIsoDate } from "@/lib/branches/storage"

import type { ReportAsOfPreset } from "@/types/report"

function toIso(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * Resolves an "As of" preset to an ISO cut-off date (`YYYY-MM-DD`). Movements
 * dated on or before this date are included in the report.
 *
 * The fiscal year is assumed to start on 1 January (calendar year); adjust here
 * if the business runs a different fiscal calendar.
 */
export function resolveAsOfDate(
  preset: ReportAsOfPreset,
  customIso?: string
): string {
  const today = todayIsoDate()

  if (preset === "custom") {
    return customIso && customIso.trim() ? customIso : today
  }

  // Every non-custom preset reports up to today; the preset only frames the
  // period label for the reader. The cut-off is always "as of today".
  return today
}

/** Start date of the selected preset's period, used for period sub-totals. */
export function resolvePeriodStart(
  preset: ReportAsOfPreset,
  customIso?: string
): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  switch (preset) {
    case "this-month":
      return toIso(new Date(year, month, 1))
    case "last-month":
      return toIso(new Date(year, month - 1, 1))
    case "this-quarter":
      return toIso(new Date(year, Math.floor(month / 3) * 3, 1))
    case "this-year":
    case "fiscal-year-to-date":
      return toIso(new Date(year, 0, 1))
    case "custom":
      return customIso && customIso.trim() ? customIso : toIso(new Date(year, 0, 1))
    default:
      return toIso(new Date(year, 0, 1))
  }
}

export function isOnOrBefore(dateIso: string, cutoffIso: string) {
  return dateIso <= cutoffIso
}
