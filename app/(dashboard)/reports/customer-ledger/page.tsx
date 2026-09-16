import { Suspense } from "react"

import { CustomerLedgerReportPage } from "@/components/reports/customer-ledger-report-page"

export default function CustomerLedgerRoute() {
  return (
    <Suspense fallback={null}>
      <CustomerLedgerReportPage />
    </Suspense>
  )
}
