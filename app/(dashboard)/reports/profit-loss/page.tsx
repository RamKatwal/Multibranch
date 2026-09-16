import { Suspense } from "react"

import { ProfitLossReportPage } from "@/components/reports/profit-loss-report-page"

export default function ProfitLossRoute() {
  return (
    <Suspense fallback={null}>
      <ProfitLossReportPage />
    </Suspense>
  )
}
