import { Suspense } from "react"

import { CreatePurchaseRequisitionPage } from "@/components/purchase/requisition/create-purchase-requisition-page"

export default function CreatePurchaseRequisitionRoute() {
  return (
    <Suspense fallback={null}>
      <CreatePurchaseRequisitionPage />
    </Suspense>
  )
}
