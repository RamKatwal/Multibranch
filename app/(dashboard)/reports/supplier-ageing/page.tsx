import { Suspense } from "react"

import { SupplierAgeingReportPage } from "@/components/reports/supplier-ageing-report-page"

export default function SupplierAgeingRoute() {
  return (
    <Suspense fallback={null}>
      <SupplierAgeingReportPage />
    </Suspense>
  )
}
