import { Suspense } from "react"

import { SupplierSummaryReportPage } from "@/components/reports/supplier-summary-report-page"

export default function SupplierSummaryRoute() {
  return (
    <Suspense fallback={null}>
      <SupplierSummaryReportPage />
    </Suspense>
  )
}
