import { Suspense } from "react"

import { PurchaseRegisterReportPage } from "@/components/reports/purchase-register-report-page"

export default function PurchaseRegisterRoute() {
  return (
    <Suspense fallback={null}>
      <PurchaseRegisterReportPage />
    </Suspense>
  )
}
