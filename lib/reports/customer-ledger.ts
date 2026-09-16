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

export type CustomerLedgerRow = {
  customerName: string
  date: string
  type: string
  reference: string
  debit: number
  credit: number
  balanceAmount: number
  balanceSuffix: "Dr" | "Cr"
}

type CustomerLedgerOptions = {
  preset: ReportAsOfPreset
  customDate?: string
  customerFilter: string | "all"
}

export function getCustomerLedgerReport({
  preset,
  customDate,
  customerFilter,
}: CustomerLedgerOptions): CustomerLedgerRow[] {
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
    .filter((entry) => customerFilter === "all" || entry.partyId === customerFilter)
    .filter((entry) => isWithinPurchasePeriod(entry.date, start, cutoff))
    .map((entry) => {
      const isCredit = entry.balance < 0
      return {
        customerName: entry.partyName,
        date: entry.date,
        type: entry.type,
        reference: entry.reference,
        debit: entry.debit,
        credit: entry.credit,
        balanceAmount: Math.abs(entry.balance),
        balanceSuffix: isCredit ? "Cr" : "Dr",
      }
    })
}
