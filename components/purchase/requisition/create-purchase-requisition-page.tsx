"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/page-header"
import { PurchaseRequisitionForm } from "@/components/purchase/requisition/purchase-requisition-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  createPurchaseRequisitionId,
  getPurchaseRequisitionById,
  readPurchaseRequisitions,
  savePurchaseRequisitions,
} from "@/lib/purchase-requisitions/storage"
import type { PurchaseRequisition } from "@/types/purchase-requisition"

export function CreatePurchaseRequisitionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const requisitionId = searchParams.get("id")
  const [ready, setReady] = React.useState(false)
  const [requisitions, setRequisitions] = React.useState<PurchaseRequisition[]>(
    []
  )
  const [initialRequisition, setInitialRequisition] = React.useState<
    PurchaseRequisition | undefined
  >()

  React.useEffect(() => {
    const all = readPurchaseRequisitions()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRequisitions(all)
    setInitialRequisition(
      requisitionId ? getPurchaseRequisitionById(requisitionId) : undefined
    )
    setReady(true)
  }, [requisitionId])

  const isEdit = Boolean(requisitionId)
  const backHref = "/purchase/requisition"

  const backButton = (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-2 h-7 w-fit px-2 text-muted-foreground"
      nativeButton={false}
      render={<Link href={backHref} />}
    >
      <ArrowLeftIcon />
      Back to requisitions
    </Button>
  )

  function handleSubmit(requisition: PurchaseRequisition) {
    const next =
      isEdit && requisitions.some((item) => item.id === requisition.id)
        ? requisitions.map((item) =>
            item.id === requisition.id ? requisition : item
          )
        : [requisition, ...requisitions]
    savePurchaseRequisitions(next)
    toast.success(
      isEdit
        ? `Purchase requisition "${requisition.id}" saved.`
        : `Purchase requisition "${requisition.id}" created.`
    )
    router.push(backHref)
  }

  if (!ready) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader
          title={isEdit ? "Edit Purchase Requisition" : "New Purchase Requisition"}
          breadcrumb={backButton}
        />
        <p className="py-12 text-center text-sm text-muted-foreground">
          Loading…
        </p>
      </div>
    )
  }

  if (isEdit && !initialRequisition) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title="Edit Purchase Requisition" breadcrumb={backButton} />
        <Card size="sm" className="ring-foreground/10">
          <CardContent className="pt-(--card-spacing) text-sm text-muted-foreground">
            This purchase requisition could not be found.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={isEdit ? "Edit Purchase Requisition" : "New Purchase Requisition"}
        breadcrumb={backButton}
      />

      <PurchaseRequisitionForm
        initialRequisition={initialRequisition}
        nextId={createPurchaseRequisitionId(requisitions)}
        submitLabel={isEdit ? "Save changes" : "Create Purchase Requisition"}
        onSubmitRequisition={handleSubmit}
        onCancel={() => router.push(backHref)}
      />
    </div>
  )
}
