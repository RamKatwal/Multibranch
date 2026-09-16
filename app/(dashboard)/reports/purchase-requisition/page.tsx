import { Suspense } from "react"

import { PurchaseRequisitionReportPage } from "@/components/reports/purchase-requisition-report-page"

export default function PurchaseRequisitionRoute() {
  return (
    <Suspense fallback={null}>
      <PurchaseRequisitionReportPage />
    </Suspense>
  )
}
