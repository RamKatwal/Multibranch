import { Suspense } from "react"

import { CreateSalesPaymentPage } from "@/components/sales/payments/create-sales-payment-page"

export default function CreateSalesPaymentRoute() {
  return (
    <Suspense fallback={null}>
      <CreateSalesPaymentPage />
    </Suspense>
  )
}
