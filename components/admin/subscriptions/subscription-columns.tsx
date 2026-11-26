"use client"

import type { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import {
  EyeIcon,
  MoreVerticalIcon,
  Settings2Icon,
} from "lucide-react"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { CompanyAvatar } from "@/components/company-logo"
import { Badge } from "@/components/ui/badge"
import { IconButton } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuDivider,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  branchAvatarItems,
  StackedAvatars,
  userAvatarItems,
} from "@/components/admin/subscriptions/stacked-avatars"
import { formatCurrency } from "@/lib/format"
import {
  billingIntervalLabels,
  formatPaymentMethodSummary,
  subscriptionStatusLabels,
  type Subscription,
  type SubscriptionStatus,
} from "@/types/subscription"

function statusBadgeClassName(status: SubscriptionStatus) {
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

export const subscriptionColumns: ColumnDef<Subscription>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => (
      <span className="text-fg-secondary">{row.getValue("id")}</span>
    ),
  },
  {
    accessorKey: "companyName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Company Name" />
    ),
    cell: ({ row }) => {
      const { companyName, companyDomain, companyLogoUrl, companyId } = row.original
      return (
        <Link
          href={`/admin/companies/${companyId}/configuration`}
          className="flex min-w-0 items-center gap-2 rounded-md hover:opacity-80"
        >
          <CompanyAvatar
            name={companyName}
            domain={companyDomain}
            logoUrl={companyLogoUrl}
            showTooltip={false}
          />
          <span className="min-w-0 truncate font-medium">{companyName}</span>
        </Link>
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
        <span className="font-medium">{row.original.planName}</span>
        {row.original.isTrial ? (
          <Badge variant="soft" size="20">Trial</Badge>
        ) : null}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => (
      <Badge variant="outline" size="20"
        className={statusBadgeClassName(row.original.status)}
      >
        {subscriptionStatusLabels[row.original.status]}
      </Badge>
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
    id: "paymentMethod",
    accessorFn: (row) => formatPaymentMethodSummary(row.paymentMethod),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Payment Method" />
    ),
    cell: ({ row }) => (
      <span className="text-fg-secondary">
        {formatPaymentMethodSummary(row.original.paymentMethod)}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created on" />
    ),
    cell: ({ row }) => (
      <span className="text-fg-secondary">{row.getValue("createdAt")}</span>
    ),
  },
  {
    accessorKey: "periodEnd",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Period End Date" />
    ),
    cell: ({ row }) => (
      <span className="text-fg-secondary">{row.getValue("periodEnd")}</span>
    ),
  },
  {
    accessorKey: "remainingDays",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Remaining Days" />
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
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amount" />
    ),
    cell: ({ row }) => (
      <span className="tabular-nums font-medium">
        {formatCurrency(row.original.amount, row.original.currency)}
      </span>
    ),
  },
  {
    accessorKey: "interval",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Interval" />
    ),
    cell: ({ row }) => (
      <span className="text-fg-secondary">
        {billingIntervalLabels[row.original.interval]}
      </span>
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    enableHiding: false,
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex items-center justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild
          ><IconButton size="32" variant="ghost" color="neutral"
                aria-label="Open subscription actions">
            <MoreVerticalIcon />
          </IconButton></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild
            ><Link href={`/admin/subscriptions/${row.original.id}`}>
              <EyeIcon />
              View
            </Link></DropdownMenuItem>
            <DropdownMenuDivider />
            <DropdownMenuItem asChild
            ><Link href={`/admin/subscriptions/${row.original.id}`}>
              <Settings2Icon />
              Manage
            </Link></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
]
