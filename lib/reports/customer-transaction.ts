import { getCustomerBills, getCustomerOptions } from "@/lib/reports/customer-summary"
import {
  buildPartyLedgerEntries,
  withRunningBalance,
} from "@/lib/reports/party-bill-ledger"
import {
  isWithinPurchasePeriod,
  resolvePurchasePeriod,
} from "@/lib/reports/purchase-date-range"
import type { ReportAsOfPreset } from "@/types/report"

export { getCustomerOptions }

export type CustomerTransactionRow = {
  date: string
  type: string
  total: number
  closingBalanceAmount: number
  closingBalanceSuffix: "Dr" | "Cr"
}

type CustomerTransactionOptions = {
  preset: ReportAsOfPreset
  customDate?: string
  customerId: string
}

export function getCustomerTransactionReport({
  preset,
  customDate,
  customerId,
}: CustomerTransactionOptions): CustomerTransactionRow[] {
  const { start, cutoff } = resolvePurchasePeriod(preset, customDate)
  const bills = getCustomerBills()
  const entries = buildPartyLedgerEntries(
    bills,
    "Sales Invoice",
    "Payment Received",
    "debit"
  )
  const withBalance = withRunningBalance(entries)

  return withBalance
    .filter((entry) => entry.partyId === customerId)
    .filter((entry) => isWithinPurchasePeriod(entry.date, start, cutoff))
    .map((entry) => ({
      date: entry.date,
      type: entry.type,
      total: entry.debit - entry.credit,
      closingBalanceAmount: Math.abs(entry.balance),
      closingBalanceSuffix: entry.balance < 0 ? "Cr" : "Dr",
    }))
}
