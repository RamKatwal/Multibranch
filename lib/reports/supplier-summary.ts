import { mockPurchaseOrders } from "@/lib/mock/purchase-orders"
import { mockSuppliers } from "@/lib/mock/suppliers"
import {
  formatPartyBalance,
  buildPartyLedgerEntries,
  type PartyBill,
} from "@/lib/reports/party-bill-ledger"
import {
  isWithinPurchasePeriod,
  resolvePurchasePeriod,
} from "@/lib/reports/purchase-date-range"
import type { ReportAsOfPreset } from "@/types/report"

export function getSupplierBills(): PartyBill[] {
  return mockPurchaseOrders
    .filter((order) => order.status === "approved")
    .map((order) => ({
      id: order.id,
      partyId: order.supplierId,
      partyName: order.supplier,
      date: order.entryDate,
      amount: order.grandTotal,
    }))
}

export type SupplierSummaryRow = {
  supplierId: string
  supplierName: string
  openingBalance: number
  debit: number
  credit: number
  closingBalance: number
  closingSuffix: "Dr" | "Cr"
}

export type SupplierOption = { id: string; name: string }

export function getSupplierOptions(): SupplierOption[] {
  return mockSuppliers
    .filter((supplier) => supplier.status === "active")
    .map((supplier) => ({ id: supplier.id, name: supplier.name }))
}

type SupplierSummaryOptions = {
  preset: ReportAsOfPreset
  customDate?: string
  supplierFilter: string | "all"
}

export function getSupplierSummaryReport({
  preset,
  customDate,
  supplierFilter,
}: SupplierSummaryOptions): SupplierSummaryRow[] {
  const { start, cutoff } = resolvePurchasePeriod(preset, customDate)
  const bills = getSupplierBills().filter(
    (bill) => supplierFilter === "all" || bill.partyId === supplierFilter
  )
  const entries = buildPartyLedgerEntries(
    bills,
    "Purchase Bill",
    "Payment",
    "credit"
  ).filter((entry) => isWithinPurchasePeriod(entry.date, start, cutoff))

  const rows = new Map<string, SupplierSummaryRow>()

  for (const entry of entries) {
    const existing = rows.get(entry.partyId)
    if (existing) {
      existing.debit += entry.debit
      existing.credit += entry.credit
    } else {
      rows.set(entry.partyId, {
        supplierId: entry.partyId,
        supplierName: entry.partyName,
        openingBalance: 0,
        debit: entry.debit,
        credit: entry.credit,
        closingBalance: 0,
        closingSuffix: "Dr",
      })
    }
  }

  for (const row of rows.values()) {
    const { amount, suffix } = formatPartyBalance(row.debit - row.credit)
    row.closingBalance = amount
    row.closingSuffix = suffix
  }

  return Array.from(rows.values())
}
