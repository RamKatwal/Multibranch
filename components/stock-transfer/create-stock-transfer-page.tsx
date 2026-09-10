"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/page-header"
import { StockTransferForm } from "@/components/stock-transfer/stock-transfer-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  getActiveBranchContext,
  getHeadOfficeBranch,
} from "@/lib/inventory/branch-stock"
import { getStockTransferCounterparts } from "@/lib/mock/stock-transfers"
import { upsertStockTransfer } from "@/lib/stock-transfer/storage"
import type { Branch } from "@/types/branch"
import {
  parseStockTransferDirection,
  type StockTransfer,
} from "@/types/stock-transfer"

export function CreateStockTransferPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [context, setContext] = React.useState<{
    activeBranch: Branch | null
    headOffice: Branch | null
    isHeadOffice: boolean
    counterparts: { id: string; name: string }[]
    ready: boolean
  }>({
    activeBranch: null,
    headOffice: null,
    isHeadOffice: false,
    counterparts: [],
    ready: false,
  })
  const [counterpartId, setCounterpartId] = React.useState("")

  const direction = parseStockTransferDirection(searchParams.get("direction"))

  React.useEffect(() => {
    const { branch, isHeadOffice } = getActiveBranchContext()
    const counterparts = branch
      ? getStockTransferCounterparts(branch.id, isHeadOffice)
      : []
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setContext({
      activeBranch: branch,
      headOffice: getHeadOfficeBranch(),
      isHeadOffice,
      counterparts,
      ready: true,
    })
    setCounterpartId((current) =>
      current && counterparts.some((item) => item.id === current)
        ? current
        : (counterparts[0]?.id ?? "")
    )
  }, [])

  function handleCreate(transfer: StockTransfer) {
    upsertStockTransfer(transfer)
    toast.success(`Stock In "${transfer.id}" submitted.`)
    router.push(`/inventory/stock-transfer/${encodeURIComponent(transfer.id)}`)
  }

  const backHref = `/inventory/stock-transfer?direction=${direction === "out" ? "out" : "in"}`

  const backButton = (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-2 h-7 w-fit px-2 text-muted-foreground"
      nativeButton={false}
      render={<Link href={backHref} />}
    >
      <ArrowLeftIcon />
      Back to transfers
    </Button>
  )

  if (!context.ready) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title="New Stock In" breadcrumb={backButton} />
        <p className="py-12 text-center text-sm text-muted-foreground">
          Loading…
        </p>
      </div>
    )
  }

  if (direction === "out") {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title="New Stock Out" breadcrumb={backButton} />
        <Card size="sm" className="ring-foreground/10">
          <CardContent className="pt-(--card-spacing) text-sm text-muted-foreground">
            Stock Out is raised by the other location asking for your stock. Use
            Stock In to request stock into this location.
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!context.activeBranch || !context.headOffice) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title="New Stock In" breadcrumb={backButton} />
        <Card size="sm" className="ring-foreground/10">
          <CardContent className="pt-(--card-spacing) text-sm text-muted-foreground">
            Select a branch to create a stock request.
          </CardContent>
        </Card>
      </div>
    )
  }

  const counterpart =
    context.counterparts.find((item) => item.id === counterpartId) ??
    context.counterparts[0]

  if (!counterpart) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title="New Stock In" breadcrumb={backButton} />
        <Card size="sm" className="ring-foreground/10">
          <CardContent className="pt-(--card-spacing) text-sm text-muted-foreground">
            No source branch is available. Add another active branch to request
            stock from.
          </CardContent>
        </Card>
      </div>
    )
  }

  const current = {
    id: context.activeBranch.id,
    name: context.activeBranch.name,
  }
  const from = counterpart
  const to = current
  const showSourceSelect = context.isHeadOffice && context.counterparts.length >= 1

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="New Stock In" breadcrumb={backButton} />

      <StockTransferForm
        fromBranch={from.name}
        fromBranchId={from.id}
        toBranch={to.name}
        toBranchId={to.id}
        counterpartSelect={
          showSourceSelect
            ? {
                label: "From",
                options: context.counterparts,
                value: counterpart.id,
                onChange: (branch) => setCounterpartId(branch.id),
              }
            : undefined
        }
        requestedByBranchId={current.id}
        entryByName={current.name}
        onSubmitTransfer={handleCreate}
        onCancel={() => router.push(backHref)}
      />
    </div>
  )
}
