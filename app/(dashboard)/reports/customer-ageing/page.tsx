import { Suspense } from "react"

import { CustomerAgeingReportPage } from "@/components/reports/customer-ageing-report-page"

export default function CustomerAgeingRoute() {
  return (
    <Suspense fallback={null}>
      <CustomerAgeingReportPage />
    </Suspense>
  )
}
