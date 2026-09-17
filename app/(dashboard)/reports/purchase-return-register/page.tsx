import { Suspense } from "react"

import { PurchaseReturnRegisterReportPage } from "@/components/reports/purchase-return-register-report-page"

export default function PurchaseReturnRegisterRoute() {
  return (
    <Suspense fallback={null}>
      <PurchaseReturnRegisterReportPage />
    </Suspense>
  )
}
