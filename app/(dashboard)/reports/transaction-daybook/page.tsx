import { Suspense } from "react"

import { TransactionDaybookReportPage } from "@/components/reports/transaction-daybook-report-page"

export default function TransactionDaybookRoute() {
  return (
    <Suspense fallback={null}>
      <TransactionDaybookReportPage />
    </Suspense>
  )
}
