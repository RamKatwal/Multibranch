import { Suspense } from "react"

import { CreateSalesQuotationPage } from "@/components/sales/quotation/create-sales-quotation-page"

export default function CreateSalesQuotationRoute() {
  return (
    <Suspense fallback={null}>
      <CreateSalesQuotationPage />
    </Suspense>
  )
}
