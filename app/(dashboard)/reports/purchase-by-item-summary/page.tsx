import { Suspense } from "react"

import { PurchaseByItemSummaryReportPage } from "@/components/reports/purchase-by-item-summary-report-page"

export default function PurchaseByItemSummaryRoute() {
  return (
    <Suspense fallback={null}>
      <PurchaseByItemSummaryReportPage />
    </Suspense>
  )
}
