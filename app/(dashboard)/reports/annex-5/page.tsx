import { Suspense } from "react"

import { Annex5ReportPage } from "@/components/reports/annex-5-report-page"

export default function Annex5Route() {
  return (
    <Suspense fallback={null}>
      <Annex5ReportPage />
    </Suspense>
  )
}
