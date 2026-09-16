import { Suspense } from "react"

import { CustomerTransactionReportPage } from "@/components/reports/customer-transaction-report-page"

export default function CustomerTransactionRoute() {
  return (
    <Suspense fallback={null}>
      <CustomerTransactionReportPage />
    </Suspense>
  )
}
