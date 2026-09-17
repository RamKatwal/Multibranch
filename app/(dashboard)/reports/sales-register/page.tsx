import { Suspense } from "react"

import { SalesRegisterReportPage } from "@/components/reports/sales-register-report-page"

export default function SalesRegisterRoute() {
  return (
    <Suspense fallback={null}>
      <SalesRegisterReportPage />
    </Suspense>
  )
}
