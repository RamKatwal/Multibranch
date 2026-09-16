import { Suspense } from "react"

import { SupplierBillAgeingReportPage } from "@/components/reports/supplier-bill-ageing-report-page"

export default function SupplierBillAgeingRoute() {
  return (
    <Suspense fallback={null}>
      <SupplierBillAgeingReportPage />
    </Suspense>
  )
}
