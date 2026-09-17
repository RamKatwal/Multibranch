import { Suspense } from "react"

import { VatSummaryReportPage } from "@/components/reports/vat-summary-report-page"

export default function VatSummaryRoute() {
  return (
    <Suspense fallback={null}>
      <VatSummaryReportPage />
    </Suspense>
  )
}
