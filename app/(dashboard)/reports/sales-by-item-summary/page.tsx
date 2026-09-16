import { Suspense } from "react"

import { SalesByItemSummaryReportPage } from "@/components/reports/sales-by-item-summary-report-page"

export default function SalesByItemSummaryRoute() {
  return (
    <Suspense fallback={null}>
      <SalesByItemSummaryReportPage />
    </Suspense>
  )
}
