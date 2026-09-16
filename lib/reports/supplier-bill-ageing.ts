import { getSupplierBills, getSupplierOptions } from "@/lib/reports/supplier-summary"
import {
  computeBillDetail,
  overdueDaysAsOf,
  PARTY_LEDGER_DATASET_TODAY,
} from "@/lib/reports/party-bill-ledger"
import {
  isWithinPurchasePeriod,
  resolvePurchasePeriod,
} from "@/lib/reports/purchase-date-range"
import type { ReportAsOfPreset } from "@/types/report"

export { getSupplierOptions }

export type SupplierBillAgeingRow = {
  billId: string
  date: string
  dueDate: string
  supplierName: string
  totalAmount: number
  paidAmount: number
  billReturnAmount: number
  remainingBalance: number
  status: string
  overdueDays: number
}

type SupplierBillAgeingOptions = {
  preset: ReportAsOfPreset
  customDate?: string
  supplierFilter: string | "all"
}

export function getSupplierBillAgeingReport({
  preset,
  customDate,
  supplierFilter,
}: SupplierBillAgeingOptions): SupplierBillAgeingRow[] {
  const { start, cutoff } = resolvePurchasePeriod(preset, customDate)

  return getSupplierBills()
    .filter((bill) => isWithinPurchasePeriod(bill.date, start, cutoff))
    .filter((bill) => supplierFilter === "all" || bill.partyId === supplierFilter)
    .map((bill) => {
      const detail = computeBillDetail(bill)
      return {
        billId: bill.id,
        date: bill.date,
        dueDate: detail.dueDate,
        supplierName: bill.partyName,
        totalAmount: detail.amount,
        paidAmount: detail.paidAmount,
        billReturnAmount: 0,
        remainingBalance: detail.remainingBalance,
        status: detail.status,
        overdueDays:
          detail.remainingBalance > 0
            ? overdueDaysAsOf(detail.dueDate, PARTY_LEDGER_DATASET_TODAY)
            : 0,
      }
    })
}
