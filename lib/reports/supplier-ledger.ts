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

export type SupplierLedgerRow = {
  supplierName: string
  date: string
  type: string
  reference: string
  debit: number
  credit: number
  balanceAmount: number
  balanceSuffix: "Dr" | "Cr"
}

type SupplierLedgerOptions = {
  preset: ReportAsOfPreset
  customDate?: string
  supplierFilter: string | "all"
}

export function getSupplierLedgerReport({
  preset,
  customDate,
  supplierFilter,
}: SupplierLedgerOptions): SupplierLedgerRow[] {
  const { start, cutoff } = resolvePurchasePeriod(preset, customDate)
  const bills = getSupplierBills()
  const entries = buildPartyLedgerEntries(bills, "Purchase Bill", "Payment", "credit")
  const withBalance = withRunningBalance(entries)

  return withBalance
    .filter((entry) => supplierFilter === "all" || entry.partyId === supplierFilter)
    .filter((entry) => isWithinPurchasePeriod(entry.date, start, cutoff))
    .map((entry) => {
      const isCredit = entry.balance < 0
      return {
        supplierName: entry.partyName,
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
