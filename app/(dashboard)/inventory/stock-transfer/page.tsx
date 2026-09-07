import { Suspense } from "react"

import { StockTransferPage } from "@/components/stock-transfer/stock-transfer-page"

export default function StockTransferRoute() {
  return (
    <Suspense fallback={null}>
      <StockTransferPage />
    </Suspense>
  )
}
