"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { PlusIcon } from "lucide-react"

import {
  AddSubscriptionDialog,
  type AddSubscriptionFormValues,
} from "@/components/admin/subscriptions/add-subscription-dialog"
import { resolvePlanId } from "@/components/admin/subscriptions/billing-utils"
import { subscriptionColumns } from "@/components/admin/subscriptions/subscription-columns"
import {
  type DataTableRowSize,
  DataTableCard,
  useDataTable,
  useDataTableFullscreen,
} from "@/components/data-table/data-table"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { mockSubscriptions } from "@/lib/mock/subscriptions"
import {
  formatPaymentMethodSummary,
  subscriptionStatusLabels,
  type Subscription,
  type SubscriptionStatus,
} from "@/types/subscription"
import { getPlan } from "@/lib/onboarding/plans"

type StatusFilter = "all" | SubscriptionStatus

const statusFilterTabs: StatusFilter[] = [
  "all",
  "active",
  "trialing",
  "pending",
  "past_due",
  "canceled",
]

const statusFilterLabels: Record<StatusFilter, string> = {
  all: "All",
  ...subscriptionStatusLabels,
}

export function SubscriptionsPage() {
  const router = useRouter()
  const [subscriptions, setSubscriptions] =
    React.useState<Subscription[]>(mockSubscriptions)
  const [activeStatus, setActiveStatus] = React.useState<StatusFilter>("all")
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [rowSize, setRowSize] = React.useState<DataTableRowSize>("md")
  const { isFullscreen, toggleFullscreen } = useDataTableFullscreen()

  const filteredData = React.useMemo(
    () =>
      activeStatus === "all"
        ? subscriptions
        : subscriptions.filter((item) => item.status === activeStatus),
    [activeStatus, subscriptions]
  )

  const statusFilterOptions = React.useMemo(
    () =>
      statusFilterTabs.map((status) => ({
        value: status,
        label: statusFilterLabels[status],
        count:
          status === "all"
            ? subscriptions.length
            : subscriptions.filter((item) => item.status === status).length,
      })),
    [subscriptions]
  )

  const table = useDataTable({
    data: filteredData,
    columns: subscriptionColumns,
    pageSize: 10,
    globalFilterFn: (row, _columnId, filterValue) => {
      const query = String(filterValue).toLowerCase()
      const item = row.original

      return (
        item.id.toLowerCase().includes(query) ||
        item.companyName.toLowerCase().includes(query) ||
        item.planName.toLowerCase().includes(query) ||
        (item.paymentMethod?.provider ?? "").toLowerCase().includes(query) ||
        formatPaymentMethodSummary(item.paymentMethod).toLowerCase().includes(query)
      )
    },
  })

  function handleAddSubscription(values: AddSubscriptionFormValues) {
    const plan = getPlan(resolvePlanId(values.planId))
    const planName = plan.name

    const next: Subscription = {
      id: `SUB-${Math.floor(10000 + Math.random() * 90000)}`,
      companyId: `comp_${Date.now()}`,
      companyName: values.companyName,
      companyDomain: null,
      planId: values.planId,
      planName,
      planTier: planName,
      planDescription: "Newly provisioned subscription (mock)",
      isTrial: false,
      status: "pending",
      branchesUsed: 0,
      branchesLimit: values.planId === "plan_ent_01" ? 15 : 5,
      usersUsed: 0,
      usersLimit: values.planId === "plan_ent_01" ? 50 : 20,
      amount: values.planId === "plan_ent_01" ? 1200 : values.planId === "plan_del_01" ? 99 : 199,
      currency: "NPR",
      interval: values.interval,
      createdAt: new Date().toISOString().slice(0, 10),
      periodEnd: new Date().toISOString().slice(0, 10),
      nextBillingDate: new Date().toISOString().slice(0, 10),
      remainingDays: 30,
      autoRenew: true,
      paymentMethod: null,
      features: ["Multi-Branch Management", "Email Support"],
      members: [],
      assignedBranches: [],
      invoices: [],
    }

    setSubscriptions((current) => [next, ...current])
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Subscriptions"
        count={`${subscriptions.length} subscriptions`}
        actions={
          <Button size="32" onClick={() => setDialogOpen(true)}>
            <PlusIcon />
            Add / Upgrade Subscription
          </Button>
        }
      />

      <DataTableCard
        table={table}
        columnCount={subscriptionColumns.length}
        searchPlaceholder="Search subscriptions..."
        rowSize={rowSize}
        onRowSizeChange={setRowSize}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        emptyMessage={
          activeStatus === "all"
            ? "No subscriptions found."
            : `No ${statusFilterLabels[activeStatus].toLowerCase()} subscriptions found.`
        }
        onRowClick={(subscription) =>
          router.push(`/admin/subscriptions/${subscription.id}`)
        }
        filters={{
          value: activeStatus,
          options: statusFilterOptions,
          onValueChange: (status) => {
            setActiveStatus(status as StatusFilter)
            table.setPageIndex(0)
          },
        }}
      />

      <AddSubscriptionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleAddSubscription}
      />
    </div>
  )
}
