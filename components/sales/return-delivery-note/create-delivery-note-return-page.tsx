"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/page-header"
import { DeliveryNoteReturnForm } from "@/components/sales/return-delivery-note/delivery-note-return-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  createDeliveryNoteReturnId,
  getDeliveryNoteReturnById,
  readDeliveryNoteReturns,
  saveDeliveryNoteReturns,
} from "@/lib/delivery-note-returns/storage"
import type { DeliveryNoteReturn } from "@/types/delivery-note-return"

export function CreateDeliveryNoteReturnPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnId = searchParams.get("id")
  const [ready, setReady] = React.useState(false)
  const [returns, setReturns] = React.useState<DeliveryNoteReturn[]>([])
  const [initialReturn, setInitialReturn] = React.useState<
    DeliveryNoteReturn | undefined
  >()

  React.useEffect(() => {
    const all = readDeliveryNoteReturns()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReturns(all)
    setInitialReturn(returnId ? getDeliveryNoteReturnById(returnId) : undefined)
    setReady(true)
  }, [returnId])

  const isEdit = Boolean(returnId)
  const backHref = "/sales/return-delivery-note"

  const backButton = (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-2 h-7 w-fit px-2 text-muted-foreground"
      nativeButton={false}
      render={<Link href={backHref} />}
    >
      <ArrowLeftIcon />
      Back to return notes
    </Button>
  )

  function handleSubmit(entry: DeliveryNoteReturn) {
    const next =
      isEdit && returns.some((item) => item.id === entry.id)
        ? returns.map((item) => (item.id === entry.id ? entry : item))
        : [entry, ...returns]
    saveDeliveryNoteReturns(next)
    toast.success(
      isEdit
        ? `Return delivery note "${entry.id}" saved.`
        : `Return delivery note "${entry.id}" created.`
    )
    router.push(backHref)
  }

  if (!ready) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader
          title={
            isEdit ? "Edit Return Delivery Note" : "New Return Delivery Note"
          }
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
        <PageHeader
          title="Edit Return Delivery Note"
          breadcrumb={backButton}
        />
        <Card size="sm" className="ring-foreground/10">
          <CardContent className="pt-(--card-spacing) text-sm text-muted-foreground">
            This return delivery note could not be found.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={
          isEdit ? "Edit Return Delivery Note" : "New Return Delivery Note"
        }
        breadcrumb={backButton}
      />

      <DeliveryNoteReturnForm
        initialReturn={initialReturn}
        nextId={createDeliveryNoteReturnId(returns)}
        submitLabel={isEdit ? "Save changes" : "Create Return Delivery Note"}
        onSubmitReturn={handleSubmit}
        onCancel={() => router.push(backHref)}
      />
    </div>
  )
}
