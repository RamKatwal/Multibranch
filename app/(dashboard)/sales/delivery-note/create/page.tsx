import { Suspense } from "react"

import { CreateDeliveryNotePage } from "@/components/sales/delivery-note/create-delivery-note-page"

export default function CreateDeliveryNoteRoute() {
  return (
    <Suspense fallback={null}>
      <CreateDeliveryNotePage />
    </Suspense>
  )
}
