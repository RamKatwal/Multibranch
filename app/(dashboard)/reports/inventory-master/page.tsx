import { Suspense } from "react"

import { InventoryMasterReportPage } from "@/components/reports/inventory-master-report-page"

export default function InventoryMasterRoute() {
  return (
    <Suspense fallback={null}>
      <InventoryMasterReportPage />
    </Suspense>
  )
}
