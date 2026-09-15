import { Suspense } from "react"

import { ReorderInventoryReportPage } from "@/components/reports/reorder-inventory-report-page"

export default function ReorderInventoryRoute() {
  return (
    <Suspense fallback={null}>
      <ReorderInventoryReportPage />
    </Suspense>
  )
}
