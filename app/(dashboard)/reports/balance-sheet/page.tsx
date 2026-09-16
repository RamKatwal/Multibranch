import { Suspense } from "react"

import { BalanceSheetReportPage } from "@/components/reports/balance-sheet-report-page"

export default function BalanceSheetRoute() {
  return (
    <Suspense fallback={null}>
      <BalanceSheetReportPage />
    </Suspense>
  )
}
