import { ACCOUNTS_PAYABLE, ACCOUNTS_RECEIVABLE } from "@/lib/mock/chart-of-accounts"
import { getAccountBalance } from "@/lib/reports/general-ledger"
import { getProfitLossReport } from "@/lib/reports/profit-loss"
import {
  PURCHASE_MOCK_DATASET_TODAY,
  resolvePurchasePeriod,
} from "@/lib/reports/purchase-date-range"
import type { ReportAsOfPreset } from "@/types/report"

export type BalanceSheetReport = {
  asset: number
  liabilities: number
  equity: number
  differenceInOpeningBalance: number
  totalLiabilitiesAndEquity: number
}

type BalanceSheetOptions = {
  preset: ReportAsOfPreset
  customDate?: string
}

/**
 * Equity is this period's Net Profit/Loss (no owner capital is modeled).
 * "Difference in Opening Balance" plugs Assets = Liabilities + Equity, the
 * same balancing line the live reference shows for a tenant with no opening
 * trial balance on file.
 */
export function getBalanceSheetReport({
  preset,
  customDate,
}: BalanceSheetOptions): BalanceSheetReport {
  const { cutoff } = resolvePurchasePeriod(preset, customDate)
  const asOfDate = cutoff || PURCHASE_MOCK_DATASET_TODAY

  const asset = getAccountBalance(ACCOUNTS_RECEIVABLE, asOfDate)
  const liabilities = -getAccountBalance(ACCOUNTS_PAYABLE, asOfDate)
  const equity = getProfitLossReport({ preset, customDate }).netProfit
  const differenceInOpeningBalance = asset - liabilities - equity

  return {
    asset,
    liabilities,
    equity,
    differenceInOpeningBalance,
    totalLiabilitiesAndEquity: liabilities + equity + differenceInOpeningBalance,
  }
}
