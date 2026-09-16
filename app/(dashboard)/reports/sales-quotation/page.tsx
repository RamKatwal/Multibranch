import { Suspense } from "react"

import { SalesQuotationReportPage } from "@/components/reports/sales-quotation-report-page"

export default function SalesQuotationRoute() {
  return (
    <Suspense fallback={null}>
      <SalesQuotationReportPage />
    </Suspense>
  )
}
