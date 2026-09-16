"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/page-header"
import { SalesReturnForm } from "@/components/sales/return/sales-return-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  createSalesReturnId,
  getSalesReturnById,
  readSalesReturns,
  saveSalesReturns,
} from "@/lib/sales-returns/storage"
import type { SalesReturn } from "@/types/sales-return"

export function CreateSalesReturnPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnId = searchParams.get("id")
  const [ready, setReady] = React.useState(false)
  const [returns, setReturns] = React.useState<SalesReturn[]>([])
  const [initialReturn, setInitialReturn] = React.useState<
    SalesReturn | undefined
  >()

  React.useEffect(() => {
    const all = readSalesReturns()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReturns(all)
    setInitialReturn(returnId ? getSalesReturnById(returnId) : undefined)
    setReady(true)
  }, [returnId])

  const isEdit = Boolean(returnId)
  const backHref = "/sales/return"

  const backButton = (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-2 h-7 w-fit px-2 text-muted-foreground"
      nativeButton={false}
      render={<Link href={backHref} />}
    >
      <ArrowLeftIcon />
      Back to returns
    </Button>
  )

  function handleSubmit(entry: SalesReturn) {
    const next =
      isEdit && returns.some((item) => item.id === entry.id)
        ? returns.map((item) => (item.id === entry.id ? entry : item))
        : [entry, ...returns]
    saveSalesReturns(next)
    toast.success(
      isEdit
        ? `Sales return "${entry.id}" saved.`
        : `Sales return "${entry.id}" created.`
    )
    router.push(backHref)
  }

  if (!ready) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader
          title={isEdit ? "Edit Sales Return" : "New Sales Return"}
          breadcrumb={backButton}
        />
        <p className="py-12 text-center text-sm text-muted-foreground">
          Loading…
        </p>
      </div>
    )
  }

  if (isEdit && !initialReturn) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title="Edit Sales Return" breadcrumb={backButton} />
        <Card size="sm" className="ring-foreground/10">
          <CardContent className="pt-(--card-spacing) text-sm text-muted-foreground">
            This sales return could not be found.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={isEdit ? "Edit Sales Return" : "New Sales Return"}
        breadcrumb={backButton}
      />

      <SalesReturnForm
        initialReturn={initialReturn}
        nextId={createSalesReturnId(returns)}
        submitLabel={isEdit ? "Save changes" : "Create Sales Return"}
        onSubmitReturn={handleSubmit}
        onCancel={() => router.push(backHref)}
      />
    </div>
  )
}
