import { mockSalesQuotations } from "@/lib/mock/sales-quotations"
import {
  isWithinPurchasePeriod,
  resolvePurchasePeriod,
} from "@/lib/reports/purchase-date-range"
import {
  salesQuotationStatusBadgeClassName,
  salesQuotationStatusLabels,
  type SalesQuotationStatus,
} from "@/types/sales-quotation"
import type { ReportAsOfPreset } from "@/types/report"

export type SalesQuotationReportRow = {
  id: string
  entryDate: string
  customer: string
  dueDate: string
  totalAmount: number
  status: SalesQuotationStatus
  statusLabel: string
  statusBadgeClassName: string
  entryBy: string
}

type SalesQuotationReportOptions = {
  preset: ReportAsOfPreset
  customDate?: string
  statusFilter: SalesQuotationStatus | "all"
}

export function getSalesQuotationReport({
  preset,
  customDate,
  statusFilter,
}: SalesQuotationReportOptions): SalesQuotationReportRow[] {
  const { start, cutoff } = resolvePurchasePeriod(preset, customDate)

  return mockSalesQuotations
    .filter((quotation) =>
      isWithinPurchasePeriod(quotation.entryDate, start, cutoff)
    )
    .filter(
      (quotation) => statusFilter === "all" || quotation.status === statusFilter
    )
    .map((quotation) => ({
      id: quotation.id,
      entryDate: quotation.entryDate,
      customer: quotation.customer,
      dueDate: quotation.dueDate,
      totalAmount: quotation.totalAmount,
      status: quotation.status,
      statusLabel: salesQuotationStatusLabels[quotation.status],
      statusBadgeClassName: salesQuotationStatusBadgeClassName[quotation.status],
      entryBy: quotation.entryBy ?? "-",
    }))
}
