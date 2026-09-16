import { Suspense } from "react"

import { DeliveryNoteReportPage } from "@/components/reports/delivery-note-report-page"

export default function DeliveryNoteRoute() {
  return (
    <Suspense fallback={null}>
      <DeliveryNoteReportPage />
    </Suspense>
  )
}
