import { getSupplierBills, getSupplierOptions } from "@/lib/reports/supplier-summary"
import {
  buildPartyLedgerEntries,
  withRunningBalance,
} from "@/lib/reports/party-bill-ledger"
import {
  isWithinPurchasePeriod,
  resolvePurchasePeriod,
} from "@/lib/reports/purchase-date-range"
import type { ReportAsOfPreset } from "@/types/report"

export { getSupplierOptions }

export type SupplierTransactionRow = {
  date: string
  type: string
  total: number
  closingBalanceAmount: number
  closingBalanceSuffix: "Dr" | "Cr"
}

type SupplierTransactionOptions = {
  preset: ReportAsOfPreset
  customDate?: string
  supplierId: string
}

export function getSupplierTransactionReport({
  preset,
  customDate,
  supplierId,
}: SupplierTransactionOptions): SupplierTransactionRow[] {
  const { start, cutoff } = resolvePurchasePeriod(preset, customDate)
  const bills = getSupplierBills()
  const entries = buildPartyLedgerEntries(bills, "Purchase Bill", "Payment", "credit")
  const withBalance = withRunningBalance(entries)

  return withBalance
    .filter((entry) => entry.partyId === supplierId)
    .filter((entry) => isWithinPurchasePeriod(entry.date, start, cutoff))
    .map((entry) => ({
      date: entry.date,
      type: entry.type,
      total: entry.credit - entry.debit,
      closingBalanceAmount: Math.abs(entry.balance),
      closingBalanceSuffix: entry.balance < 0 ? "Cr" : "Dr",
    }))
}
