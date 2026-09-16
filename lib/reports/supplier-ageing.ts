import { getSupplierBills } from "@/lib/reports/supplier-summary"
import {
  ageingBucket,
  computeBillDetail,
  overdueDaysAsOf,
  PARTY_LEDGER_DATASET_TODAY,
} from "@/lib/reports/party-bill-ledger"

export type SupplierAgeingRow = {
  supplierId: string
  supplierName: string
  current: number
  bucket0to4: number
  bucket5to9: number
  bucket10plus: number
  totalDue: number
}

export function getSupplierAgeingReport(): SupplierAgeingRow[] {
  const rows = new Map<string, SupplierAgeingRow>()

  for (const bill of getSupplierBills()) {
    const detail = computeBillDetail(bill)
    if (detail.remainingBalance <= 0) continue

    const overdueDays = overdueDaysAsOf(detail.dueDate, PARTY_LEDGER_DATASET_TODAY)
    const bucket = ageingBucket(overdueDays)

    let row = rows.get(bill.partyId)
    if (!row) {
      row = {
        supplierId: bill.partyId,
        supplierName: bill.partyName,
        current: 0,
        bucket0to4: 0,
        bucket5to9: 0,
        bucket10plus: 0,
        totalDue: 0,
      }
      rows.set(bill.partyId, row)
    }

    if (bucket === "current") row.current += detail.remainingBalance
    else if (bucket === "0-4") row.bucket0to4 += detail.remainingBalance
    else if (bucket === "5-9") row.bucket5to9 += detail.remainingBalance
    else row.bucket10plus += detail.remainingBalance

    row.totalDue += detail.remainingBalance
  }

  return Array.from(rows.values())
}
