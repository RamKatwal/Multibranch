import { Suspense } from "react"

import { SalesBookReportPage } from "@/components/reports/sales-book-report-page"

export default function SalesBookRoute() {
  return (
    <Suspense fallback={null}>
      <SalesBookReportPage />
    </Suspense>
  )
}
