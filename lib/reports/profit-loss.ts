import { getAccountBalance } from "@/lib/reports/general-ledger"
import { PURCHASES_COGS, SALES_REVENUE } from "@/lib/mock/chart-of-accounts"
import {
  PURCHASE_MOCK_DATASET_TODAY,
  resolvePurchasePeriod,
} from "@/lib/reports/purchase-date-range"
import type { ReportAsOfPreset } from "@/types/report"

export type ProfitLossReport = {
  sales: number
  directIncome: number
  cogs: number
  grossProfit: number
  indirectIncome: number
  indirectExpense: number
  netProfit: number
}

type ProfitLossOptions = {
  preset: ReportAsOfPreset
  customDate?: string
}

/**
 * Indirect income/expense (rent, utilities, etc.) aren't modeled anywhere in
 * this codebase, so they report zero — Gross Profit and Net Profit end up
 * equal, which is also what a freshly-provisioned tenant with no such
 * bookings shows on the live reference.
 */
export function getProfitLossReport({
  preset,
  customDate,
}: ProfitLossOptions): ProfitLossReport {
  const { cutoff } = resolvePurchasePeriod(preset, customDate)
  const asOfDate = cutoff || PURCHASE_MOCK_DATASET_TODAY

  const sales = -getAccountBalance(SALES_REVENUE, asOfDate)
  const cogs = getAccountBalance(PURCHASES_COGS, asOfDate)
  const grossProfit = sales - cogs

  return {
    sales,
    directIncome: 0,
    cogs,
    grossProfit,
    indirectIncome: 0,
    indirectExpense: 0,
    netProfit: grossProfit,
  }
}
