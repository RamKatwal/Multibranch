"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/page-header"
import { PurchaseOrderForm } from "@/components/purchase/order/purchase-order-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  createPurchaseOrderId,
  getPurchaseOrderById,
  readPurchaseOrders,
  savePurchaseOrders,
} from "@/lib/purchase-orders/storage"
import type { PurchaseOrder } from "@/types/purchase-order"

export function CreatePurchaseOrderPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("id")
  const [ready, setReady] = React.useState(false)
  const [orders, setOrders] = React.useState<PurchaseOrder[]>([])
  const [initialOrder, setInitialOrder] = React.useState<PurchaseOrder | undefined>()

  React.useEffect(() => {
    const all = readPurchaseOrders()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrders(all)
    setInitialOrder(orderId ? getPurchaseOrderById(orderId) : undefined)
    setReady(true)
  }, [orderId])

  const isEdit = Boolean(orderId)
  const backHref = "/purchase/order"

  const backButton = (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-2 h-7 w-fit px-2 text-muted-foreground"
      nativeButton={false}
      render={<Link href={backHref} />}
    >
      <ArrowLeftIcon />
      Back to orders
    </Button>
  )

  function handleSubmit(order: PurchaseOrder) {
    const next =
      isEdit && orders.some((item) => item.id === order.id)
        ? orders.map((item) => (item.id === order.id ? order : item))
        : [order, ...orders]
    savePurchaseOrders(next)
    toast.success(
      isEdit
        ? `Purchase order "${order.id}" saved.`
        : `Purchase order "${order.id}" created.`
    )
    router.push(backHref)
  }

  if (!ready) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader
          title={isEdit ? "Edit Purchase Order" : "New Purchase Order"}
          breadcrumb={backButton}
        />
        <p className="py-12 text-center text-sm text-muted-foreground">
          Loading…
        </p>
      </div>
    )
  }

  if (isEdit && !initialOrder) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title="Edit Purchase Order" breadcrumb={backButton} />
        <Card size="sm" className="ring-foreground/10">
          <CardContent className="pt-(--card-spacing) text-sm text-muted-foreground">
            This purchase order could not be found.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={isEdit ? "Edit Purchase Order" : "New Purchase Order"}
        breadcrumb={backButton}
      />

      <PurchaseOrderForm
        initialOrder={initialOrder}
        nextId={createPurchaseOrderId(orders)}
        submitLabel={isEdit ? "Save changes" : "Create Purchase Order"}
        onSubmitOrder={handleSubmit}
        onCancel={() => router.push(backHref)}
      />
    </div>
  )
}
