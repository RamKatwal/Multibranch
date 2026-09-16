import { getCustomerBills, getCustomerOptions } from "@/lib/reports/customer-summary"
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

export { getCustomerOptions }

export type CustomerBillAgeingRow = {
  billId: string
  date: string
  dueDate: string
  customerName: string
  totalAmount: number
  paidAmount: number
  billReturnAmount: number
  remainingBalance: number
  status: string
  overdueDays: number
}

type CustomerBillAgeingOptions = {
  preset: ReportAsOfPreset
  customDate?: string
  customerFilter: string | "all"
}

export function getCustomerBillAgeingReport({
  preset,
  customDate,
  customerFilter,
}: CustomerBillAgeingOptions): CustomerBillAgeingRow[] {
  const { start, cutoff } = resolvePurchasePeriod(preset, customDate)

  return getCustomerBills()
    .filter((bill) => isWithinPurchasePeriod(bill.date, start, cutoff))
    .filter((bill) => customerFilter === "all" || bill.partyId === customerFilter)
    .map((bill) => {
      const detail = computeBillDetail(bill)
      return {
        billId: bill.id,
        date: bill.date,
        dueDate: detail.dueDate,
        customerName: bill.partyName,
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
