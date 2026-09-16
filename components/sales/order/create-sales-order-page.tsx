"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/page-header"
import { SalesOrderForm } from "@/components/sales/order/sales-order-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  createSalesOrderId,
  getSalesOrderById,
  readSalesOrders,
  saveSalesOrders,
} from "@/lib/sales-orders/storage"
import type { SalesOrder } from "@/types/sales-order"

export function CreateSalesOrderPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("id")
  const [ready, setReady] = React.useState(false)
  const [orders, setOrders] = React.useState<SalesOrder[]>([])
  const [initialOrder, setInitialOrder] = React.useState<SalesOrder | undefined>()

  React.useEffect(() => {
    const all = readSalesOrders()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrders(all)
    setInitialOrder(orderId ? getSalesOrderById(orderId) : undefined)
    setReady(true)
  }, [orderId])

  const isEdit = Boolean(orderId)
  const backHref = "/sales/order"

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

  function handleSubmit(order: SalesOrder) {
    const next =
      isEdit && orders.some((item) => item.id === order.id)
        ? orders.map((item) => (item.id === order.id ? order : item))
        : [order, ...orders]
    saveSalesOrders(next)
    toast.success(
      isEdit
        ? `Sales order "${order.id}" saved.`
        : `Sales order "${order.id}" created.`
    )
    router.push(backHref)
  }

  if (!ready) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader
          title={isEdit ? "Edit Sales Order" : "New Sales Order"}
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
        <PageHeader title="Edit Sales Order" breadcrumb={backButton} />
        <Card size="sm" className="ring-foreground/10">
          <CardContent className="pt-(--card-spacing) text-sm text-muted-foreground">
            This sales order could not be found.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={isEdit ? "Edit Sales Order" : "New Sales Order"}
        breadcrumb={backButton}
      />

      <SalesOrderForm
        initialOrder={initialOrder}
        nextId={createSalesOrderId(orders)}
        submitLabel={isEdit ? "Save changes" : "Create Sales Order"}
        onSubmitOrder={handleSubmit}
        onCancel={() => router.push(backHref)}
      />
    </div>
  )
}
