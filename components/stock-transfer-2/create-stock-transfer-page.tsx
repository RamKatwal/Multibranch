"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/page-header"
import { StockTransferForm } from "@/components/stock-transfer-2/stock-transfer-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  getActiveBranchContext,
  getHeadOfficeBranch,
} from "@/lib/inventory/branch-stock"
import { upsertStockTransfer } from "@/lib/stock-transfer-2/storage"
import type { Branch } from "@/types/branch"
import type { StockTransfer } from "@/types/stock-transfer"

export function CreateStockTransferPage() {
  const router = useRouter()
  const [context, setContext] = React.useState<{
    activeBranch: Branch | null
    headOffice: Branch | null
    isHeadOffice: boolean
    ready: boolean
  }>({ activeBranch: null, headOffice: null, isHeadOffice: false, ready: false })

  React.useEffect(() => {
    const { branch, isHeadOffice } = getActiveBranchContext()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setContext({
      activeBranch: branch,
      headOffice: getHeadOfficeBranch(),
      isHeadOffice,
      ready: true,
    })
  }, [])

  function handleCreate(transfer: StockTransfer) {
    upsertStockTransfer(transfer)
    toast.success(`Stock request "${transfer.id}" submitted.`)
    router.push(`/inventory/stock-transfer-2/${encodeURIComponent(transfer.id)}`)
  }

  const backButton = (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-2 h-7 w-fit px-2 text-muted-foreground"
      nativeButton={false}
      render={<Link href="/inventory/stock-transfer-2" />}
    >
      <ArrowLeftIcon />
      Back to transfers
    </Button>
  )

  if (!context.ready) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title="New Stock Request" breadcrumb={backButton} />
        <p className="py-12 text-center text-sm text-muted-foreground">Loading…</p>
      </div>
    )
  }

  if (context.isHeadOffice || !context.activeBranch || !context.headOffice) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title="New Stock Request" breadcrumb={backButton} />
        <Card size="sm" className="ring-foreground/10">
          <CardContent className="pt-(--card-spacing) text-sm text-muted-foreground">
            Head Office cannot request stock from itself. Switch to a branch from
            the branch selector to raise a stock request.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="New Stock Request" breadcrumb={backButton} />

      <StockTransferForm
        fromBranch={context.headOffice.name}
        fromBranchId={context.headOffice.id}
        toBranch={context.activeBranch.name}
        toBranchId={context.activeBranch.id}
        onSubmitTransfer={handleCreate}
        onCancel={() => router.push("/inventory/stock-transfer-2")}
      />
    </div>
  )
}
