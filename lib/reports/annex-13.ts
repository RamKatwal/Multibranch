import { mockCustomers } from "@/lib/mock/customers"
import { mockSalesOrders } from "@/lib/mock/sales-orders"
import { mockPurchaseOrders } from "@/lib/mock/purchase-orders"
import { mockSuppliers } from "@/lib/mock/suppliers"
import {
  isWithinPurchasePeriod,
  resolvePurchasePeriod,
} from "@/lib/reports/purchase-date-range"
import type { ReportAsOfPreset } from "@/types/report"

export type Annex13Row = {
  tradeName: string
  pan: string
  type: "Supplier" | "Customer"
  openingBalance: number
  servicePurchaseCapital: number
  servicePurchaseOthers: number
  goodsPurchaseCapital: number
  goodsPurchaseOthers: number
  serviceSales: number
  goodsSales: number
  closingBalance: number
}

type Annex13Options = {
  preset: ReportAsOfPreset
  customDate?: string
}

/**
 * Per-party (supplier + customer) goods/services purchase-sale summary. All
 * products in this codebase's catalog are "goods", so every amount lands in
 * the Goods columns — the Service/Capital columns always report zero since
 * nothing here distinguishes those categories.
 */
export function getAnnex13Report({
  preset,
  customDate,
}: Annex13Options): Annex13Row[] {
  const { start, cutoff } = resolvePurchasePeriod(preset, customDate)
  const rows: Annex13Row[] = []

  for (const supplier of mockSuppliers) {
    const goodsPurchaseOthers = mockPurchaseOrders
      .filter((order) => order.status === "approved")
      .filter((order) => order.supplierId === supplier.id)
      .filter((order) => isWithinPurchasePeriod(order.entryDate, start, cutoff))
      .reduce((sum, order) => sum + order.grandTotal, 0)

    if (goodsPurchaseOthers === 0) continue

    rows.push({
      tradeName: supplier.name,
      pan: supplier.panNumber ?? "-",
      type: "Supplier",
      openingBalance: 0,
      servicePurchaseCapital: 0,
      servicePurchaseOthers: 0,
      goodsPurchaseCapital: 0,
      goodsPurchaseOthers,
      serviceSales: 0,
      goodsSales: 0,
      closingBalance: goodsPurchaseOthers,
    })
  }

  for (const customer of mockCustomers) {
    const goodsSales = mockSalesOrders
      .filter((order) => order.status === "approved")
      .filter((order) => order.customerId === customer.id)
      .filter((order) => isWithinPurchasePeriod(order.entryDate, start, cutoff))
      .reduce((sum, order) => sum + order.grandTotal, 0)

    if (goodsSales === 0) continue

    rows.push({
      tradeName: customer.name,
      pan: customer.panNumber ?? "-",
      type: "Customer",
      openingBalance: 0,
      servicePurchaseCapital: 0,
      servicePurchaseOthers: 0,
      goodsPurchaseCapital: 0,
      goodsPurchaseOthers: 0,
      serviceSales: 0,
      goodsSales,
      closingBalance: goodsSales,
    })
  }

  return rows
}
