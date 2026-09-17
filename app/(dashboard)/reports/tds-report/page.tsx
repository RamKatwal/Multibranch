import { Suspense } from "react"

import { TdsReportPage } from "@/components/reports/tds-report-page"

export default function TdsReportRoute() {
  return (
    <Suspense fallback={null}>
      <TdsReportPage />
    </Suspense>
  )
}
