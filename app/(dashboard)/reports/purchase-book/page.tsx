import { Suspense } from "react"

import { PurchaseBookReportPage } from "@/components/reports/purchase-book-report-page"

export default function PurchaseBookRoute() {
  return (
    <Suspense fallback={null}>
      <PurchaseBookReportPage />
    </Suspense>
  )
}
