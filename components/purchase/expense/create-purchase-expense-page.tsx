"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/page-header"
import { PurchaseExpenseForm } from "@/components/purchase/expense/purchase-expense-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  createPurchaseExpenseId,
  getPurchaseExpenseById,
  readPurchaseExpenses,
  savePurchaseExpenses,
} from "@/lib/purchase-expenses/storage"
import type { PurchaseExpense } from "@/types/purchase-expense"

export function CreatePurchaseExpensePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const expenseId = searchParams.get("id")
  const [ready, setReady] = React.useState(false)
  const [expenses, setExpenses] = React.useState<PurchaseExpense[]>([])
  const [initialExpense, setInitialExpense] = React.useState<
    PurchaseExpense | undefined
  >()

  React.useEffect(() => {
    const all = readPurchaseExpenses()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExpenses(all)
    setInitialExpense(expenseId ? getPurchaseExpenseById(expenseId) : undefined)
    setReady(true)
  }, [expenseId])

  const isEdit = Boolean(expenseId)
  const backHref = "/purchase/expense"

  const backButton = (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-2 h-7 w-fit px-2 text-muted-foreground"
      nativeButton={false}
      render={<Link href={backHref} />}
    >
      <ArrowLeftIcon />
      Back to expenses
    </Button>
  )

  function handleSubmit(expense: PurchaseExpense) {
    const next =
      isEdit && expenses.some((item) => item.id === expense.id)
        ? expenses.map((item) => (item.id === expense.id ? expense : item))
        : [expense, ...expenses]
    savePurchaseExpenses(next)
    toast.success(
      isEdit
        ? `Expense "${expense.id}" saved.`
        : `Expense "${expense.id}" created.`
    )
    router.push(backHref)
  }

  if (!ready) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader
          title={isEdit ? "Edit Expense" : "New Expense"}
          breadcrumb={backButton}
        />
        <p className="py-12 text-center text-sm text-muted-foreground">
          Loading…
        </p>
      </div>
    )
  }

  if (isEdit && !initialExpense) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title="Edit Expense" breadcrumb={backButton} />
        <Card size="sm" className="ring-foreground/10">
          <CardContent className="pt-(--card-spacing) text-sm text-muted-foreground">
            This expense could not be found.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={isEdit ? "Edit Expense" : "New Expense"}
        breadcrumb={backButton}
      />

      <PurchaseExpenseForm
        initialExpense={initialExpense}
        nextId={createPurchaseExpenseId(expenses)}
        submitLabel={isEdit ? "Save changes" : "Create Expense"}
        onSubmitExpense={handleSubmit}
        onCancel={() => router.push(backHref)}
      />
    </div>
  )
}
