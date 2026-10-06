"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { CompanyAvatar } from "@/components/company-logo"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Button } from "@/components/ui/button"
import type { UserBranchAccess } from "@/lib/demo/user-branches"

function formatLastLoggedIn(value: string | null) {
  if (!value) return "Never"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Never"
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

type BranchAccessColumnsOptions = {
  onAccessPortal: (row: UserBranchAccess) => void
}

export function getBranchAccessColumns({
  onAccessPortal,
}: BranchAccessColumnsOptions): ColumnDef<UserBranchAccess>[] {
  return [
    {
      accessorKey: "companyName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Company" />
      ),
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex min-w-0 items-center gap-3">
            <CompanyAvatar
              name={item.companyName}
              domain={item.companyDomain}
              logoUrl={item.companyLogoUrl}
              size="default"
              showTooltip={false}
              className="size-8 rounded-md"
            />
            <div className="min-w-0">
              <p className="truncate font-medium">{item.companyName}</p>
              {item.companyDomain ? (
                <p className="truncate text-xs text-muted-foreground">
                  {item.companyDomain}
                </p>
              ) : null}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "branchName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Branch" />
      ),
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="min-w-0">
            <p className="truncate font-medium">{item.branchName}</p>
            <p className="truncate text-xs text-muted-foreground">
              {item.branchCode}
            </p>
          </div>
        )
      },
    },
    {
      accessorKey: "role",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Role" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.role}</span>
      ),
    },
    {
      accessorKey: "lastLoggedIn",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Last logged in" />
      ),
      cell: ({ row }) => (
        <span className="text-sm tabular-nums text-muted-foreground">
          {formatLastLoggedIn(row.original.lastLoggedIn)}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Action</span>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center justify-end">
          <Button
            size="32"
            variant="outline"
            color="neutral"
            className="border-primary text-primary hover:bg-primary/10 hover:text-primary"
            onClick={() => onAccessPortal(row.original)}
          >
            Access portal
          </Button>
        </div>
      ),
    },
  ]
}

export { formatLastLoggedIn }
