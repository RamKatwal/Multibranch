import { Suspense } from "react"

import { SupplierTransactionReportPage } from "@/components/reports/supplier-transaction-report-page"

export default function SupplierTransactionRoute() {
  return (
    <Suspense fallback={null}>
      <SupplierTransactionReportPage />
    </Suspense>
  )
}
