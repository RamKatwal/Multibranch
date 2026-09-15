import { Suspense } from "react"

import { CreatePurchaseExpensePage } from "@/components/purchase/expense/create-purchase-expense-page"

export default function CreatePurchaseExpenseRoute() {
  return (
    <Suspense fallback={null}>
      <CreatePurchaseExpensePage />
    </Suspense>
  )
}
