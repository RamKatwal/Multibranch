import { mockPurchaseOrders } from "@/lib/mock/purchase-orders"
import { mockSuppliers } from "@/lib/mock/suppliers"
import { mockTdsTypes } from "@/lib/mock/tds-types"
import { TDS_PAYABLE } from "@/lib/mock/chart-of-accounts"
import {
  isWithinPurchasePeriod,
  resolvePurchasePeriod,
} from "@/lib/reports/purchase-date-range"
import type { ReportAsOfPreset } from "@/types/report"

export type TdsReportRow = {
  partyName: string
  panNumber: string
  date: string
  transactionType: string
  reference: string
  tdsAmount: number
  tdsType: string
  tdsAccount: string
}

export type TdsAccountOption = { id: string; name: string }

export function getTdsAccountOptions(): TdsAccountOption[] {
  return [{ id: TDS_PAYABLE, name: "TDS Payable" }]
}

const activeTdsTypes = mockTdsTypes.filter((type) => type.status === "active")

/**
 * TDS is withheld on every fourth approved purchase bill, cycling through
 * the active TDS types — this codebase has no dedicated "services subject to
 * TDS" flag on purchase orders, so this is a deterministic stand-in rather
 * than a real tax-category classification.
 */
export function getTdsReport(preset: ReportAsOfPreset, customDate?: string): TdsReportRow[] {
  const { start, cutoff } = resolvePurchasePeriod(preset, customDate)

  const rows: TdsReportRow[] = []
  let index = 0

  for (const order of mockPurchaseOrders) {
    if (order.status !== "approved") continue
    if (!isWithinPurchasePeriod(order.entryDate, start, cutoff)) continue
    if (index % 4 !== 0) {
      index += 1
      continue
    }

    const tdsType = activeTdsTypes[index % activeTdsTypes.length]
    const supplier = mockSuppliers.find((s) => s.id === order.supplierId)

    rows.push({
      partyName: order.supplier,
      panNumber: supplier?.panNumber ?? "-",
      date: order.entryDate,
      transactionType: "Purchase Bill",
      reference: order.id,
      tdsAmount: Math.round((order.grandTotal * tdsType.rate) / 100),
      tdsType: tdsType.name,
      tdsAccount: "TDS Payable",
    })

    index += 1
  }

  return rows
}
