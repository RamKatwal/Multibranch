import { Suspense } from "react"

import { CustomerBillAgeingReportPage } from "@/components/reports/customer-bill-ageing-report-page"

export default function CustomerBillAgeingRoute() {
  return (
    <Suspense fallback={null}>
      <CustomerBillAgeingReportPage />
    </Suspense>
  )
}
