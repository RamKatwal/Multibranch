import { Suspense } from "react"

import { CreateStockTransferPage } from "@/components/stock-transfer/create-stock-transfer-page"

export default function CreateStockTransferRoute() {
  return (
    <Suspense fallback={null}>
      <CreateStockTransferPage />
    </Suspense>
  )
}
