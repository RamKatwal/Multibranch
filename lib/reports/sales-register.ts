import { getSalesBookReport } from "@/lib/reports/sales-book"
import type { ReportAsOfPreset } from "@/types/report"

export type SalesRegisterRow = {
  id: string
  date: string
  buyerName: string
  buyerPan: string
  price: number
  tax: number
  totalSalesOrExports: number
  exportPrice: number
  countryOfExport: string
  exportDeclarationNo: string
}

type SalesRegisterOptions = {
  preset: ReportAsOfPreset
  customDate?: string
  customerFilter: string | "all"
}

/**
 * Sales Register (VAT purchase-book style register, IRD format): same
 * booked sales this codebase's Sales Book report already shows, projected
 * into the register's column set. No export sales are modeled, so the
 * export columns are always blank — matching a domestic-only tenant on the
 * live reference too.
 */
export function getSalesRegisterReport(
  options: SalesRegisterOptions
): SalesRegisterRow[] {
  return getSalesBookReport(options).map((row) => ({
    id: row.id,
    date: row.entryDate,
    buyerName: row.buyerName,
    buyerPan: row.buyerPan,
    price: row.totalSales,
    tax: row.vatAmount,
    totalSalesOrExports: row.totalSales,
    exportPrice: 0,
    countryOfExport: "-",
    exportDeclarationNo: "-",
  }))
}
