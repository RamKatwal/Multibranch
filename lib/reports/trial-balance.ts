import {
  mockChartOfAccounts,
  type AccountCategory,
} from "@/lib/mock/chart-of-accounts"
import { getGeneralLedgerEntries } from "@/lib/reports/general-ledger"
import {
  isWithinPurchasePeriod,
  resolvePurchasePeriod,
} from "@/lib/reports/purchase-date-range"
import type { ReportAsOfPreset } from "@/types/report"

export type TrialBalanceRow = {
  category: AccountCategory
  glCode: string
  glName: string
  openingDebit: number
  openingCredit: number
  transactionDebit: number
  transactionCredit: number
  closingDebit: number
  closingCredit: number
}

type TrialBalanceOptions = {
  preset: ReportAsOfPreset
  customDate?: string
}

/**
 * Groups every account's period activity by top-level category, matching
 * the live reference's Current/Non-Current Assets, Liabilities, Equity,
 * Income, Expense layout. Categories with no modeled accounts (Non Current
 * Assets/Liability, Equity) legitimately report zero.
 */
export function getTrialBalanceReport({
  preset,
  customDate,
}: TrialBalanceOptions): TrialBalanceRow[] {
  const { start, cutoff } = resolvePurchasePeriod(preset, customDate)
  const entries = getGeneralLedgerEntries().filter((entry) =>
    isWithinPurchasePeriod(entry.date, start, cutoff)
  )

  return mockChartOfAccounts.map((account) => {
    const accountEntries = entries.filter((entry) => entry.glCode === account.code)
    const transactionDebit = accountEntries.reduce((sum, e) => sum + e.debit, 0)
    const transactionCredit = accountEntries.reduce((sum, e) => sum + e.credit, 0)
    const net = transactionDebit - transactionCredit

    return {
      category: account.category,
      glCode: account.code,
      glName: account.name,
      openingDebit: 0,
      openingCredit: 0,
      transactionDebit,
      transactionCredit,
      closingDebit: net > 0 ? net : 0,
      closingCredit: net < 0 ? -net : 0,
    }
  })
}
