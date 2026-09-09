"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/page-header"
import { StockTransferForm } from "@/components/stock-transfer/stock-transfer-form"
import { Button } from "@/components/ui/button"
import {
  getStockTransferById,
  upsertStockTransfer,
} from "@/lib/stock-transfer/storage"
import type { StockTransfer } from "@/types/stock-transfer"

export function EditStockTransferPage({ transferId }: { transferId: string }) {
  const router = useRouter()
  const [transfer, setTransfer] = React.useState<StockTransfer | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const decoded = decodeURIComponent(transferId)
    const found = getStockTransferById(decoded)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTransfer(found ?? null)
    setIsLoading(false)
  }, [transferId])

  function handleSave(next: StockTransfer) {
    upsertStockTransfer(next)
    toast.success(`Stock request "${next.id}" updated.`)
    router.push(`/inventory/stock-transfer/${encodeURIComponent(next.id)}`)
  }

  if (isLoading) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        Loading transfer…
      </div>
    )
  }

  if (!transfer) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <h1 className="text-xl font-semibold">Transfer not found</h1>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/inventory/stock-transfer" />}
        >
          Back to transfers
        </Button>
      </div>
    )
  }

  if (transfer.status !== "requested") {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <h1 className="text-xl font-semibold">
          Only pending requests can be edited
        </h1>
        <p className="text-sm text-muted-foreground">
          This request is already {transfer.status.replace("-", " ")}.
        </p>
        <Button
          variant="outline"
          nativeButton={false}
          render={
            <Link
              href={`/inventory/stock-transfer/${encodeURIComponent(transfer.id)}`}
            />
          }
        >
          View transfer
        </Button>
      </div>
    )
  }

  const detailHref = `/inventory/stock-transfer/${encodeURIComponent(transfer.id)}`

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={`Edit ${transfer.id}`}
        breadcrumb={
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 h-7 w-fit px-2 text-muted-foreground"
            nativeButton={false}
            render={<Link href={detailHref} />}
          >
            <ArrowLeftIcon />
            Back to detail
          </Button>
        }
      />

      <StockTransferForm
        fromBranch={transfer.fromBranch}
        fromBranchId={transfer.fromBranchId}
        toBranch={transfer.toBranch}
        toBranchId={transfer.toBranchId}
        initialTransfer={transfer}
        submitLabel="Save changes"
        onSubmitTransfer={handleSave}
        onCancel={() => router.push(detailHref)}
      />
    </div>
  )
}
