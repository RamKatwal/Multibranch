import { Suspense } from "react"

import { TrialBalanceReportPage } from "@/components/reports/trial-balance-report-page"

export default function TrialBalanceRoute() {
  return (
    <Suspense fallback={null}>
      <TrialBalanceReportPage />
    </Suspense>
  )
}
