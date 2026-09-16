import { Suspense } from "react"

import { GeneralLedgerReportPage } from "@/components/reports/general-ledger-report-page"

export default function GeneralLedgerRoute() {
  return (
    <Suspense fallback={null}>
      <GeneralLedgerReportPage />
    </Suspense>
  )
}
