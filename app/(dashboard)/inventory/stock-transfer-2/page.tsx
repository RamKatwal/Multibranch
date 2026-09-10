import { Suspense } from "react"

import { StockTransferPage } from "@/components/stock-transfer-2/stock-transfer-page"

export default function StockTransferRoute() {
  return (
    <Suspense fallback={null}>
      <StockTransferPage />
    </Suspense>
  )
}
