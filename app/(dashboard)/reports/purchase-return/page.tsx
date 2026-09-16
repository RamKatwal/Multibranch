import { Suspense } from "react"

import { PurchaseReturnReportPage } from "@/components/reports/purchase-return-report-page"

export default function PurchaseReturnReportRoute() {
  return (
    <Suspense fallback={null}>
      <PurchaseReturnReportPage />
    </Suspense>
  )
}
