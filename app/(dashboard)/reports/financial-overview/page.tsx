import { Suspense } from "react"

import { FinancialOverviewReportPage } from "@/components/reports/financial-overview-report-page"

export default function FinancialOverviewRoute() {
  return (
    <Suspense fallback={null}>
      <FinancialOverviewReportPage />
    </Suspense>
  )
}
