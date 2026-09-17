import { Suspense } from "react"

import { SalesReturnRegisterReportPage } from "@/components/reports/sales-return-register-report-page"

export default function SalesReturnRegisterRoute() {
  return (
    <Suspense fallback={null}>
      <SalesReturnRegisterReportPage />
    </Suspense>
  )
}
