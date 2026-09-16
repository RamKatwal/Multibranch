import { Suspense } from "react"

import { SalesOrderReportPage } from "@/components/reports/sales-order-report-page"

export default function SalesOrderReportRoute() {
  return (
    <Suspense fallback={null}>
      <SalesOrderReportPage />
    </Suspense>
  )
}
