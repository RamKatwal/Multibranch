import { Suspense } from "react"

import { SalesReturnReportPage } from "@/components/reports/sales-return-report-page"

export default function SalesReturnReportRoute() {
  return (
    <Suspense fallback={null}>
      <SalesReturnReportPage />
    </Suspense>
  )
}
