"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/page-header"
import { SalesPaymentForm } from "@/components/sales/payments/sales-payment-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  createSalesPaymentId,
  getSalesPaymentById,
  readSalesPayments,
  saveSalesPayments,
} from "@/lib/sales-payments/storage"
import type { SalesPayment } from "@/types/sales-payment"

export function CreateSalesPaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentId = searchParams.get("id")
  const [ready, setReady] = React.useState(false)
  const [payments, setPayments] = React.useState<SalesPayment[]>([])
  const [initialPayment, setInitialPayment] = React.useState<
    SalesPayment | undefined
  >()

  React.useEffect(() => {
    const all = readSalesPayments()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPayments(all)
    setInitialPayment(paymentId ? getSalesPaymentById(paymentId) : undefined)
    setReady(true)
  }, [paymentId])

  const isEdit = Boolean(paymentId)
  const backHref = "/sales/payments"

  const backButton = (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-2 h-7 w-fit px-2 text-muted-foreground"
      nativeButton={false}
      render={<Link href={backHref} />}
    >
      <ArrowLeftIcon />
      Back to payments
    </Button>
  )

  function handleSubmit(payment: SalesPayment) {
    const next =
      isEdit && payments.some((item) => item.id === payment.id)
        ? payments.map((item) => (item.id === payment.id ? payment : item))
        : [payment, ...payments]
    saveSalesPayments(next)
    toast.success(
      isEdit
        ? `Sales payment "${payment.id}" saved.`
        : `Sales payment "${payment.id}" recorded.`
    )
    router.push(backHref)
  }

  if (!ready) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader
          title={isEdit ? "Edit Sales Payment" : "Record Sales Payment"}
          breadcrumb={backButton}
        />
        <p className="py-12 text-center text-sm text-muted-foreground">
          Loading…
        </p>
      </div>
    )
  }

  if (isEdit && !initialPayment) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title="Edit Sales Payment" breadcrumb={backButton} />
        <Card size="sm" className="ring-foreground/10">
          <CardContent className="pt-(--card-spacing) text-sm text-muted-foreground">
            This sales payment could not be found.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={isEdit ? "Edit Sales Payment" : "Record Sales Payment"}
        breadcrumb={backButton}
      />

      <SalesPaymentForm
        initialPayment={initialPayment}
        nextId={createSalesPaymentId(payments)}
        submitLabel={isEdit ? "Save changes" : "Record Payment"}
        onSubmitPayment={handleSubmit}
        onCancel={() => router.push(backHref)}
      />
    </div>
  )
}
