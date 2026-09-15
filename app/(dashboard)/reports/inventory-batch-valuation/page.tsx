import { Suspense } from "react"

import { InventoryBatchValuationReportPage } from "@/components/reports/inventory-batch-valuation-report-page"

export default function InventoryBatchValuationRoute() {
  return (
    <Suspense fallback={null}>
      <InventoryBatchValuationReportPage />
    </Suspense>
  )
}
