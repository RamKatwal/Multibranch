import { Suspense } from "react"

import { CreateSalesOrderPage } from "@/components/sales/order/create-sales-order-page"

export default function CreateSalesOrderRoute() {
  return (
    <Suspense fallback={null}>
      <CreateSalesOrderPage />
    </Suspense>
  )
}
