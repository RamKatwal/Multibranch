"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/page-header"
import { StockTransferForm } from "@/components/stock-transfer/stock-transfer-form"
import { Button } from "@/components/ui/button"
import { upsertStockTransfer } from "@/lib/stock-transfer/storage"
import type { StockTransfer } from "@/types/stock-transfer"

export function CreateStockTransferPage() {
  const router = useRouter()

  function handleCreate(transfer: StockTransfer) {
    upsertStockTransfer(transfer)
    toast.success(`Stock transfer "${transfer.id}" created successfully!`)
    router.push(`/inventory/stock-transfer/${encodeURIComponent(transfer.id)}`)
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Create Stock Transfer"
        breadcrumb={
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 h-7 w-fit px-2 text-muted-foreground"
            nativeButton={false}
            render={<Link href="/inventory/stock-transfer" />}
          >
            <ArrowLeftIcon />
            Back to transfers
          </Button>
        }
      />

      <StockTransferForm
        onSubmitTransfer={handleCreate}
        onCancel={() => router.push("/inventory/stock-transfer")}
      />
    </div>
  )
}
