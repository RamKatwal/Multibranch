import { Suspense } from "react"

import { CreatePurchaseOrderPage } from "@/components/purchase/order/create-purchase-order-page"

export default function CreatePurchaseOrderRoute() {
  return (
    <Suspense fallback={null}>
      <CreatePurchaseOrderPage />
    </Suspense>
  )
}
