import { Suspense } from "react"

import { CustomerSummaryReportPage } from "@/components/reports/customer-summary-report-page"

export default function CustomerSummaryRoute() {
  return (
    <Suspense fallback={null}>
      <CustomerSummaryReportPage />
    </Suspense>
  )
}
