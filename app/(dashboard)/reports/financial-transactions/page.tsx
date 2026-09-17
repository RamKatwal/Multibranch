import { Suspense } from "react"

import { FinancialTransactionsReportPage } from "@/components/reports/financial-transactions-report-page"

export default function FinancialTransactionsRoute() {
  return (
    <Suspense fallback={null}>
      <FinancialTransactionsReportPage />
    </Suspense>
  )
}
