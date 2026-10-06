"use client"

import type { ColumnDef } from "@tanstack/react-table"
import {
  MoreVerticalIcon,
  PencilIcon,
  PowerIcon,
  PowerOffIcon,
} from "lucide-react"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { IconButton } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuDivider,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { canDeactivateBranch, isHeadOfficeBranch } from "@/lib/branches/head-office"
import { formatDate } from "@/lib/format"
import {
  branchStatusLabels,
  type Branch,
} from "@/types/branch"

type BranchColumnActions = {
  onEdit: (branch: Branch) => void
  onDeactivate: (branch: Branch) => void
  onActivate: (branch: Branch) => void
}

export function createBranchColumns({
  onEdit,
  onDeactivate,
  onActivate,
}: BranchColumnActions): ColumnDef<Branch>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Branch Name" />
      ),
      cell: ({ row }) => {
        const branch = row.original
        return (
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate font-medium">{branch.name}</span>
            {isHeadOfficeBranch(branch) ? (
              <Badge variant="secondary" className="shrink-0">
                Head Office
              </Badge>
            ) : null}
          </div>
        )
      },
    },
    {
      accessorKey: "code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Branch Code" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-muted-foreground">
          {row.getValue("code")}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <Badge variant={status === "active" ? "secondary" : "outline"}>
            {branchStatusLabels[status]}
          </Badge>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created Date" />
      ),
      cell: ({ row }) => formatDate(row.getValue("createdAt")),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const branch = row.original
        const isActive = branch.status === "active"
        const isHeadOffice = isHeadOfficeBranch(branch)
        const showDeactivate = isActive && canDeactivateBranch(branch)

        return (
          <div className="flex items-center justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <IconButton
                  variant="ghost"
                  color="neutral"
                  size="32"
                  aria-label={`Actions for ${branch.name}`}
                >
                  <MoreVerticalIcon />
                </IconButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(branch)}>
                  <PencilIcon />
                  Edit branch
                </DropdownMenuItem>
                {isHeadOffice ? null : (
                  <>
                    <DropdownMenuDivider />
                    {showDeactivate ? (
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => onDeactivate(branch)}
                      >
                        <PowerOffIcon />
                        Deactivate
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => onActivate(branch)}>
                        <PowerIcon />
                        Activate
                      </DropdownMenuItem>
                    )}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
  ]
}
