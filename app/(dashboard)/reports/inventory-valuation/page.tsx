import { Suspense } from "react"

import { InventoryValuationReportPage } from "@/components/reports/inventory-valuation-report-page"

export default function InventoryValuationRoute() {
  return (
    <Suspense fallback={null}>
      <InventoryValuationReportPage />
    </Suspense>
  )
}
