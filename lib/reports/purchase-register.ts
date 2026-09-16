import { getPurchaseBookReport } from "@/lib/reports/purchase-book"
import type { ReportAsOfPreset } from "@/types/report"

export type PurchaseRegisterRow = {
  id: string
  date: string
  supplierName: string
  supplierPan: string
  price: number
  tax: number
  totalPurchaseOrImports: number
  importPrice: number
  countryOfOrigin: string
  importDeclarationNo: string
}

type PurchaseRegisterOptions = {
  preset: ReportAsOfPreset
  customDate?: string
  supplierFilter: string | "all"
}

/**
 * Purchase Register (VAT purchase-book style register, IRD format): same
 * booked purchases this codebase's Purchase Book report already shows,
 * projected into the register's column set. No import purchases are
 * modeled, so the import columns are always blank.
 */
export function getPurchaseRegisterReport(
  options: PurchaseRegisterOptions
): PurchaseRegisterRow[] {
  return getPurchaseBookReport(options).map((row) => ({
    id: row.id,
    date: row.entryDate,
    supplierName: row.supplierName,
    supplierPan: row.supplierPan,
    price: row.totalAmount,
    tax: row.vatAmount,
    totalPurchaseOrImports: row.totalAmount,
    importPrice: 0,
    countryOfOrigin: "-",
    importDeclarationNo: "-",
  }))
}
