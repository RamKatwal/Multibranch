import { Suspense } from "react"

import { ExpiryInventoryReportPage } from "@/components/reports/expiry-inventory-report-page"

export default function ExpiryInventoryRoute() {
  return (
    <Suspense fallback={null}>
      <ExpiryInventoryReportPage />
    </Suspense>
  )
}
