import { mockChartOfAccounts } from "@/lib/mock/chart-of-accounts"
import { getGeneralLedgerEntries } from "@/lib/reports/general-ledger"
import {
  isWithinPurchasePeriod,
  resolvePurchasePeriod,
} from "@/lib/reports/purchase-date-range"
import type { ReportAsOfPreset } from "@/types/report"

export { mockChartOfAccounts }

export type GeneralLedgerReportRow = {
  glCode: string
  glName: string
  description: string
  reference: string
  transactionType: string
  date: string
  debit: number
  credit: number
  balanceAmount: number
  balanceSuffix: "Dr" | "Cr"
  entryBy: string
}

type GeneralLedgerReportOptions = {
  preset: ReportAsOfPreset
  customDate?: string
  accountFilter: string | "all"
}

export function getGeneralLedgerReport({
  preset,
  customDate,
  accountFilter,
}: GeneralLedgerReportOptions): GeneralLedgerReportRow[] {
  const { start, cutoff } = resolvePurchasePeriod(preset, customDate)
  const runningByAccount = new Map<string, number>()

  return getGeneralLedgerEntries()
    .filter((entry) => isWithinPurchasePeriod(entry.date, start, cutoff))
    .map((entry) => {
      const current = runningByAccount.get(entry.glCode) ?? 0
      const next = current + entry.debit - entry.credit
      runningByAccount.set(entry.glCode, next)

      return {
        ...entry,
        balanceAmount: Math.abs(next),
        balanceSuffix: next < 0 ? ("Cr" as const) : ("Dr" as const),
      }
    })
    .filter((entry) => accountFilter === "all" || entry.glCode === accountFilter)
}
