import { mockCustomers } from "@/lib/mock/customers"
import { mockSalesOrders } from "@/lib/mock/sales-orders"
import {
  isWithinPurchasePeriod,
  resolvePurchasePeriod,
} from "@/lib/reports/purchase-date-range"
import type { ReportAsOfPreset } from "@/types/report"

export type Annex5Row = {
  fiscalYear: string
  billNo: string
  customerName: string
  customerPan: string
  billDate: string
  amount: number
  discount: number
  taxableAmount: number
  taxAmount: number
  totalAmount: number
  syncWithIrd: boolean
  isBillPrinted: boolean
  isBillActive: boolean
  enteredBy: string
  isRealtime: boolean
}

type Annex5Options = {
  preset: ReportAsOfPreset
  customDate?: string
}

/**
 * Annex 5 "Materialized View" (IRD real-time billing sync audit trail):
 * every booked sales invoice with the sync/print/audit flags this codebase
 * has no real IRD integration for, so they're always false/not-printed —
 * an honest reflection of a prototype with no live tax-authority connection.
 */
export function getAnnex5Report({ preset, customDate }: Annex5Options): Annex5Row[] {
  const { start, cutoff } = resolvePurchasePeriod(preset, customDate)

  return mockSalesOrders
    .filter((order) => order.status === "approved")
    .filter((order) => isWithinPurchasePeriod(order.entryDate, start, cutoff))
    .map((order) => {
      const customer = mockCustomers.find((c) => c.id === order.customerId)

      return {
        fiscalYear: "2082/83",
        billNo: order.id,
        customerName: order.customer,
        customerPan: customer?.panNumber ?? "-",
        billDate: order.entryDate,
        amount: order.subTotal,
        discount: order.additionalDiscount,
        taxableAmount: order.taxableTotal,
        taxAmount: order.vatAmount,
        totalAmount: order.grandTotal,
        syncWithIrd: false,
        isBillPrinted: false,
        isBillActive: true,
        enteredBy: order.entryBy ?? "-",
        isRealtime: false,
      }
    })
}
