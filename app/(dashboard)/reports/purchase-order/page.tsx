import { Suspense } from "react"

import { PurchaseOrderReportPage } from "@/components/reports/purchase-order-report-page"

export default function PurchaseOrderReportRoute() {
  return (
    <Suspense fallback={null}>
      <PurchaseOrderReportPage />
    </Suspense>
  )
}
