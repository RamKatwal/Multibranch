"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/page-header"
import { StockAdjustmentForm } from "@/components/stock-adjustment/stock-adjustment-form"
import { Button } from "@/components/ui/button"
import { upsertStockAdjustment } from "@/lib/stock-adjustment/storage"
import type { StockAdjustment } from "@/types/stock-adjustment"

export function CreateStockAdjustmentPage() {
  const router = useRouter()

  function handleCreate(adjustment: StockAdjustment) {
    upsertStockAdjustment(adjustment)
    toast.success(`Adjustment "${adjustment.id}" saved.`)
    router.push("/inventory/stock-adjustment")
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Create Adjustment"
        breadcrumb={
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 h-7 w-fit px-2 text-muted-foreground"
            nativeButton={false}
            render={<Link href="/inventory/stock-adjustment" />}
          >
            <ArrowLeftIcon />
            Back to adjustments
          </Button>
        }
      />

      <StockAdjustmentForm
        onSubmitAdjustment={handleCreate}
        onCancel={() => router.push("/inventory/stock-adjustment")}
      />
    </div>
  )
}
