import { Suspense } from "react"

import { DeliveryNoteReturnReportPage } from "@/components/reports/delivery-note-return-report-page"

export default function DeliveryNoteReturnRoute() {
  return (
    <Suspense fallback={null}>
      <DeliveryNoteReturnReportPage />
    </Suspense>
  )
}
