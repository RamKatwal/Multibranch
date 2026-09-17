import { Suspense } from "react"

import { Annex13ReportPage } from "@/components/reports/annex-13-report-page"

export default function Annex13Route() {
  return (
    <Suspense fallback={null}>
      <Annex13ReportPage />
    </Suspense>
  )
}
