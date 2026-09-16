import { Suspense } from "react"

import { PurchaseByItemMonthlyReportPage } from "@/components/reports/purchase-by-item-monthly-report-page"

export default function PurchaseByItemMonthlyRoute() {
  return (
    <Suspense fallback={null}>
      <PurchaseByItemMonthlyReportPage />
    </Suspense>
  )
}
