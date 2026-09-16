import { mockPurchaseOrders } from "@/lib/mock/purchase-orders"
import { mockPurchaseReturns } from "@/lib/mock/purchase-returns"
import { mockSalesOrders } from "@/lib/mock/sales-orders"
import { mockSalesReturns } from "@/lib/mock/sales-returns"
import {
  isWithinPurchasePeriod,
  resolvePurchasePeriod,
} from "@/lib/reports/purchase-date-range"
import type { ReportAsOfPreset } from "@/types/report"

export type TransactionDaybookRow = {
  id: string
  date: string
  transactionType: string
  details: string
  totalAmount: number
  preparedBy: string
  approvedBy: string
  description: string
}

type TransactionDaybookOptions = {
  preset: ReportAsOfPreset
  customDate?: string
}

/** A unified, chronological feed of every booked document this codebase models. */
export function getTransactionDaybookReport({
  preset,
  customDate,
}: TransactionDaybookOptions): TransactionDaybookRow[] {
  const { start, cutoff } = resolvePurchasePeriod(preset, customDate)
  const rows: TransactionDaybookRow[] = []

  for (const order of mockSalesOrders) {
    if (order.status !== "approved") continue
    rows.push({
      id: order.id,
      date: order.entryDate,
      transactionType: "Sales Invoice",
      details: order.customer,
      totalAmount: order.grandTotal,
      preparedBy: order.entryBy ?? "-",
      approvedBy: order.entryBy ?? "-",
      description: order.remarks || "-",
    })
  }

  for (const order of mockPurchaseOrders) {
    if (order.status !== "approved") continue
    rows.push({
      id: order.id,
      date: order.entryDate,
      transactionType: "Purchase Bill",
      details: order.supplier,
      totalAmount: order.grandTotal,
      preparedBy: order.entryBy ?? "-",
      approvedBy: order.entryBy ?? "-",
      description: order.remarks || "-",
    })
  }

  for (const entry of mockSalesReturns) {
    if (entry.status !== "approved") continue
    rows.push({
      id: entry.id,
      date: entry.entryDate,
      transactionType: "Sales Return",
      details: entry.customer,
      totalAmount: entry.totalAmount,
      preparedBy: entry.entryBy ?? "-",
      approvedBy: entry.entryBy ?? "-",
      description: `Ref. ${entry.refInvoice}`,
    })
  }

  for (const entry of mockPurchaseReturns) {
    if (entry.status !== "approved") continue
    rows.push({
      id: entry.id,
      date: entry.entryDate,
      transactionType: "Purchase Return",
      details: entry.supplier,
      totalAmount: entry.totalAmount,
      preparedBy: entry.entryBy ?? "-",
      approvedBy: entry.entryBy ?? "-",
      description: `Ref. ${entry.refInvoice}`,
    })
  }

  return rows
    .filter((row) => isWithinPurchasePeriod(row.date, start, cutoff))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
}
