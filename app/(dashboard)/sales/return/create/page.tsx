import { Suspense } from "react"

import { CreateSalesReturnPage } from "@/components/sales/return/create-sales-return-page"

export default function CreateSalesReturnRoute() {
  return (
    <Suspense fallback={null}>
      <CreateSalesReturnPage />
    </Suspense>
  )
}
