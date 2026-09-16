import { Suspense } from "react"

import { CreateDeliveryNoteReturnPage } from "@/components/sales/return-delivery-note/create-delivery-note-return-page"

export default function CreateDeliveryNoteReturnRoute() {
  return (
    <Suspense fallback={null}>
      <CreateDeliveryNoteReturnPage />
    </Suspense>
  )
}
