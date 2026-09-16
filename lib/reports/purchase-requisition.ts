import { mockPurchaseRequisitions } from "@/lib/mock/purchase-requisitions"
import {
  isWithinPurchasePeriod,
  resolvePurchasePeriod,
} from "@/lib/reports/purchase-date-range"
import {
  purchaseRequisitionStatusBadgeClassName,
  purchaseRequisitionStatusLabels,
  type PurchaseRequisitionStatus,
} from "@/types/purchase-requisition"
import type { ReportAsOfPreset } from "@/types/report"

export type PurchaseRequisitionReportRow = {
  id: string
  entryDate: string
  dueDate: string
  status: PurchaseRequisitionStatus
  statusLabel: string
  statusBadgeClassName: string
  entryBy: string
}

type PurchaseRequisitionReportOptions = {
  preset: ReportAsOfPreset
  customDate?: string
  statusFilter: PurchaseRequisitionStatus | "all"
}

export function getPurchaseRequisitionReport({
  preset,
  customDate,
  statusFilter,
}: PurchaseRequisitionReportOptions): PurchaseRequisitionReportRow[] {
  const { start, cutoff } = resolvePurchasePeriod(preset, customDate)

  return mockPurchaseRequisitions
    .filter((requisition) =>
      isWithinPurchasePeriod(requisition.entryDate, start, cutoff)
    )
    .filter(
      (requisition) =>
        statusFilter === "all" || requisition.status === statusFilter
    )
    .map((requisition) => ({
      id: requisition.id,
      entryDate: requisition.entryDate,
      dueDate: requisition.dueDate,
      status: requisition.status,
      statusLabel: purchaseRequisitionStatusLabels[requisition.status],
      statusBadgeClassName:
        purchaseRequisitionStatusBadgeClassName[requisition.status],
      entryBy: requisition.entryBy ?? "-",
    }))
}
