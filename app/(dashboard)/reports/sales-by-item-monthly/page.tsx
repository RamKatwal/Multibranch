import { Suspense } from "react"

import { SalesByItemMonthlyReportPage } from "@/components/reports/sales-by-item-monthly-report-page"

export default function SalesByItemMonthlyRoute() {
  return (
    <Suspense fallback={null}>
      <SalesByItemMonthlyReportPage />
    </Suspense>
  )
}
