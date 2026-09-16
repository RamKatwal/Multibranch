import { mockCustomers } from "@/lib/mock/customers"
import { mockSalesOrders } from "@/lib/mock/sales-orders"
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

export function getCustomerBills(): PartyBill[] {
  return mockSalesOrders
    .filter((order) => order.status === "approved")
    .map((order) => ({
      id: order.id,
      partyId: order.customerId,
      partyName: order.customer,
      date: order.entryDate,
      amount: order.grandTotal,
    }))
}

export type CustomerSummaryRow = {
  customerId: string
  customerName: string
  openingBalance: number
  debit: number
  credit: number
  closingBalance: number
  closingSuffix: "Dr" | "Cr"
}

export type CustomerOption = { id: string; name: string }

export function getCustomerOptions(): CustomerOption[] {
  return mockCustomers
    .filter((customer) => customer.status === "active")
    .map((customer) => ({ id: customer.id, name: customer.name }))
}

type CustomerSummaryOptions = {
  preset: ReportAsOfPreset
  customDate?: string
  customerFilter: string | "all"
}

export function getCustomerSummaryReport({
  preset,
  customDate,
  customerFilter,
}: CustomerSummaryOptions): CustomerSummaryRow[] {
  const { start, cutoff } = resolvePurchasePeriod(preset, customDate)
  const bills = getCustomerBills().filter(
    (bill) => customerFilter === "all" || bill.partyId === customerFilter
  )
  const entries = buildPartyLedgerEntries(
    bills,
    "Sales Invoice",
    "Payment Received",
    "debit"
  ).filter((entry) => isWithinPurchasePeriod(entry.date, start, cutoff))

  const rows = new Map<string, CustomerSummaryRow>()

  for (const entry of entries) {
    const existing = rows.get(entry.partyId)
    if (existing) {
      existing.debit += entry.debit
      existing.credit += entry.credit
    } else {
      rows.set(entry.partyId, {
        customerId: entry.partyId,
        customerName: entry.partyName,
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
