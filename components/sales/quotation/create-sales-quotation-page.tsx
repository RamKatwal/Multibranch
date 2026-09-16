"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/page-header"
import { SalesQuotationForm } from "@/components/sales/quotation/sales-quotation-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  createSalesQuotationId,
  getSalesQuotationById,
  readSalesQuotations,
  saveSalesQuotations,
} from "@/lib/sales-quotations/storage"
import type { SalesQuotation } from "@/types/sales-quotation"

export function CreateSalesQuotationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const quotationId = searchParams.get("id")
  const [ready, setReady] = React.useState(false)
  const [quotations, setQuotations] = React.useState<SalesQuotation[]>([])
  const [initialQuotation, setInitialQuotation] = React.useState<
    SalesQuotation | undefined
  >()

  React.useEffect(() => {
    const all = readSalesQuotations()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuotations(all)
    setInitialQuotation(
      quotationId ? getSalesQuotationById(quotationId) : undefined
    )
    setReady(true)
  }, [quotationId])

  const isEdit = Boolean(quotationId)
  const backHref = "/sales/quotation"

  const backButton = (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-2 h-7 w-fit px-2 text-muted-foreground"
      nativeButton={false}
      render={<Link href={backHref} />}
    >
      <ArrowLeftIcon />
      Back to quotations
    </Button>
  )

  function handleSubmit(quotation: SalesQuotation) {
    const next =
      isEdit && quotations.some((item) => item.id === quotation.id)
        ? quotations.map((item) =>
            item.id === quotation.id ? quotation : item
          )
        : [quotation, ...quotations]
    saveSalesQuotations(next)
    toast.success(
      isEdit
        ? `Sales quotation "${quotation.id}" saved.`
        : `Sales quotation "${quotation.id}" created.`
    )
    router.push(backHref)
  }

  if (!ready) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader
          title={isEdit ? "Edit Sales Quotation" : "New Sales Quotation"}
          breadcrumb={backButton}
        />
        <p className="py-12 text-center text-sm text-muted-foreground">
          Loading…
        </p>
      </div>
    )
  }

  if (isEdit && !initialQuotation) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title="Edit Sales Quotation" breadcrumb={backButton} />
        <Card size="sm" className="ring-foreground/10">
          <CardContent className="pt-(--card-spacing) text-sm text-muted-foreground">
            This sales quotation could not be found.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={isEdit ? "Edit Sales Quotation" : "New Sales Quotation"}
        breadcrumb={backButton}
      />

      <SalesQuotationForm
        initialQuotation={initialQuotation}
        nextId={createSalesQuotationId(quotations)}
        submitLabel={isEdit ? "Save changes" : "Create Sales Quotation"}
        onSubmitQuotation={handleSubmit}
        onCancel={() => router.push(backHref)}
      />
    </div>
  )
}
