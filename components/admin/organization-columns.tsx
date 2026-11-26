"use client"

import type { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

import {
  branchAvatarItems,
  StackedAvatars,
  userAvatarItems,
} from "@/components/admin/subscriptions/stacked-avatars"
import { CompanyAvatar } from "@/components/company-logo"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useOrganizationSetupProgress } from "@/hooks/use-organization-setup-progress"
import {
  organizationNeedsUpgrade,
  type HomeOrganization,
} from "@/lib/admin/home-organizations"
import { SETUP_STEP_COUNT } from "@/lib/admin/organization-setup"
import { cn } from "@/lib/utils"
import {
  subscriptionStatusLabels,
  type SubscriptionStatus,
} from "@/types/subscription"

export function organizationStatusBadgeClassName(status: SubscriptionStatus) {
  switch (status) {
    case "active":
      return "border-transparent bg-success/15 text-success"
    case "trialing":
      return "border-transparent bg-secondary text-secondary-foreground"
    case "past_due":
      return "border-transparent bg-destructive/10 text-error-text"
    case "pending":
      return "border-border text-fg"
    default:
      return "border-border text-fg-secondary"
  }
}

export function organizationPlanBadgeClassName(plan: string) {
  if (plan.toLowerCase().includes("enterprise")) {
    return "border-transparent bg-success/10 text-success"
  }
  if (
    plan.toLowerCase().includes("de-lite") ||
    plan.toLowerCase().includes("lite")
  ) {
    return "border-transparent bg-secondary text-secondary-foreground"
  }
  return "border-transparent bg-primary/10 text-primary"
}

type OrganizationColumnsOptions = {
  onContinueSetup: (companyId: string) => void
}

function OrganizationActionsCell({
  org,
  onContinueSetup,
}: {
  org: HomeOrganization
  onContinueSetup: (companyId: string) => void
}) {
  const showUpgrade = organizationNeedsUpgrade(org)
  const setup = useOrganizationSetupProgress(org)
  const setupIncomplete = setup.completedCount < SETUP_STEP_COUNT

  if (setupIncomplete && !showUpgrade) {
    return (
      <div className="flex items-center justify-end">
        <Button size="32" variant="outline" color="neutral"
          className="border-primary text-primary hover:bg-primary/10 hover:text-primary"
          onClick={() => onContinueSetup(org.companyId)}
        >
          Continue setup
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {showUpgrade ? (
        <Button size="32" variant="outline" color="neutral"
          className="border-primary text-primary hover:bg-primary/10 hover:text-primary" asChild
        ><Link href={`/admin/subscriptions/${org.id}`}>
          Upgrade
        </Link></Button>
      ) : (
        <Button size="32" variant="outline" color="neutral"
          className="border-primary text-primary hover:bg-primary/10 hover:text-primary" asChild
        ><Link href="/">
          Go to company
        </Link></Button>
      )}
    </div>
  )
}

export function getOrganizationColumns({
  onContinueSetup,
}: OrganizationColumnsOptions): ColumnDef<HomeOrganization>[] {
  return [
    {
      id: "company",
      accessorFn: (row) => row.companyName,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Company" />
      ),
      cell: ({ row }) => {
        const { companyName, companyDomain, companyLogoUrl, location } =
          row.original
        return (
          <div className="flex min-w-0 items-center gap-2.5">
            <CompanyAvatar
              name={companyName}
              domain={companyDomain}
              logoUrl={companyLogoUrl}
              showTooltip={false}
            />
            <div className="min-w-0">
              <p className="truncate font-medium">{companyName}</p>
              <p className="truncate text-xs text-fg-secondary">
                {location}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      id: "plan",
      accessorFn: (row) => row.planName,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Plan" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <Badge variant="strong" color="primary" size="20"
            className={cn(
              "",
              organizationPlanBadgeClassName(row.original.planName)
            )}
          >
            {row.original.planName}
          </Badge>
          {row.original.isTrial ? (
            <Badge variant="soft" size="20">Trial</Badge>
          ) : null}
        </div>
      ),
    },
    {
      accessorKey: "remainingDays",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Days remaining" />
      ),
      cell: ({ row }) => {
        const days = row.original.remainingDays
        return (
          <span
            className={
              days <= 7
                ? "font-medium tabular-nums text-error-text"
                : "tabular-nums text-fg-secondary"
            }
          >
            {days}
          </span>
        )
      },
    },
    {
      id: "users",
      accessorFn: (row) => row.usersUsed,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Users" />
      ),
      cell: ({ row }) => (
        <StackedAvatars
          items={userAvatarItems(row.original.members, row.original.usersUsed)}
          total={row.original.usersUsed}
        />
      ),
    },
    {
      id: "branches",
      accessorFn: (row) => row.branchesUsed,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Branches" />
      ),
      cell: ({ row }) => (
        <StackedAvatars
          items={branchAvatarItems(row.original.assignedBranches)}
          total={row.original.branchesUsed}
        />
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <Badge variant="outline" size="20"
          className={organizationStatusBadgeClassName(row.original.status)}
        >
          {subscriptionStatusLabels[row.original.status]}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => (
        <OrganizationActionsCell
          org={row.original}
          onContinueSetup={onContinueSetup}
        />
      ),
    },
  ]
}
