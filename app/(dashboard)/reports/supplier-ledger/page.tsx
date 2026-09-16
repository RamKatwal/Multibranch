import { Suspense } from "react"

import { SupplierLedgerReportPage } from "@/components/reports/supplier-ledger-report-page"

export default function SupplierLedgerRoute() {
  return (
    <Suspense fallback={null}>
      <SupplierLedgerReportPage />
    </Suspense>
  )
}
