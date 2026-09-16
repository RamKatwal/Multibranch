import { mockPurchaseOrders } from "@/lib/mock/purchase-orders"
import { mockSalesOrders } from "@/lib/mock/sales-orders"
import {
  ACCOUNTS_PAYABLE,
  ACCOUNTS_RECEIVABLE,
  mockChartOfAccounts,
  PURCHASES_COGS,
  SALES_REVENUE,
  type ChartOfAccount,
} from "@/lib/mock/chart-of-accounts"

export { mockChartOfAccounts }

export type GeneralLedgerEntry = {
  glCode: string
  glName: string
  description: string
  reference: string
  transactionType: string
  date: string
  debit: number
  credit: number
  entryBy: string
}

/**
 * Two-line journal entry per booked sales/purchase order — the only
 * transactions this codebase's mock data can derive a GL trail from.
 * Receivable/payable movements mirror lib/reports/party-bill-ledger.ts so
 * the two systems agree on the same underlying balances.
 */
export function getGeneralLedgerEntries(): GeneralLedgerEntry[] {
  const entries: GeneralLedgerEntry[] = []

  for (const order of mockSalesOrders) {
    if (order.status !== "approved") continue

    entries.push(
      {
        glCode: ACCOUNTS_RECEIVABLE,
        glName: "Accounts Receivable",
        description: `Sales invoice — ${order.customer}`,
        reference: order.id,
        transactionType: "Sales Invoice",
        date: order.entryDate,
        debit: order.grandTotal,
        credit: 0,
        entryBy: order.entryBy ?? "-",
      },
      {
        glCode: SALES_REVENUE,
        glName: "Sales Revenue",
        description: `Sales invoice — ${order.customer}`,
        reference: order.id,
        transactionType: "Sales Invoice",
        date: order.entryDate,
        debit: 0,
        credit: order.grandTotal,
        entryBy: order.entryBy ?? "-",
      }
    )
  }

  for (const order of mockPurchaseOrders) {
    if (order.status !== "approved") continue

    entries.push(
      {
        glCode: PURCHASES_COGS,
        glName: "Purchases / COGS",
        description: `Purchase bill — ${order.supplier}`,
        reference: order.id,
        transactionType: "Purchase Bill",
        date: order.entryDate,
        debit: order.grandTotal,
        credit: 0,
        entryBy: order.entryBy ?? "-",
      },
      {
        glCode: ACCOUNTS_PAYABLE,
        glName: "Accounts Payable",
        description: `Purchase bill — ${order.supplier}`,
        reference: order.id,
        transactionType: "Purchase Bill",
        date: order.entryDate,
        debit: 0,
        credit: order.grandTotal,
        entryBy: order.entryBy ?? "-",
      }
    )
  }

  return entries.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
}

export function getAccountBalance(glCode: string, asOfDate: string) {
  const entries = getGeneralLedgerEntries().filter(
    (entry) => entry.glCode === glCode && entry.date <= asOfDate
  )
  return entries.reduce((sum, entry) => sum + entry.debit - entry.credit, 0)
}

export function getAccountByCode(code: string): ChartOfAccount | undefined {
  return mockChartOfAccounts.find((account) => account.code === code)
}
