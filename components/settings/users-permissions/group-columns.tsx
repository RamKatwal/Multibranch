"use client"

import type { ColumnDef } from "@tanstack/react-table"
import {
  MoreVerticalIcon,
  PencilIcon,
  PowerIcon,
  PowerOffIcon,
} from "lucide-react"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import {
  BranchAccessChips,
  CompanyAccessChips,
  groupedBranchAccessSearchText,
} from "@/components/settings/users-permissions/grouped-branch-chips"
import { IconButton } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuDivider,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  getGroupStatus,
  isProtectedRole,
  type Group,
} from "@/types/group"

type GroupColumnHandlers = {
  onEdit: (group: Group) => void
  onDeactivate: (group: Group) => void
  onActivate: (group: Group) => void
}

export function createPermissionGroupColumns({
  onEdit,
  onDeactivate,
  onActivate,
}: GroupColumnHandlers): ColumnDef<Group>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Role Name" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("name")}</span>
      ),
    },
    {
      id: "companies",
      accessorFn: (row) => groupedBranchAccessSearchText(row.branchIds ?? []),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Company" />
      ),
      cell: ({ row }) => (
        <CompanyAccessChips branchIds={row.original.branchIds ?? []} />
      ),
      meta: { wrapCell: true },
    },
    {
      id: "branches",
      accessorFn: (row) => groupedBranchAccessSearchText(row.branchIds ?? []),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Branches" />
      ),
      cell: ({ row }) => (
        <BranchAccessChips branchIds={row.original.branchIds ?? []} />
      ),
      meta: { wrapCell: true },
    },
    {
      accessorKey: "entryBy",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Entry by" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {(row.getValue("entryBy") as string) || "—"}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const group = row.original
        const protectedRole = isProtectedRole(group)
        const isActive = getGroupStatus(group) === "active"

        return (
          <div className="flex items-center justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <IconButton
                  variant="ghost"
                  color="neutral"
                  size="32"
                  aria-label={`Actions for ${group.name}`}
                >
                  <MoreVerticalIcon />
                </IconButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  disabled={protectedRole}
                  onClick={() => onEdit(group)}
                >
                  <PencilIcon />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuDivider />
                {isActive ? (
                  <DropdownMenuItem
                    variant="destructive"
                    disabled={protectedRole}
                    onClick={() => onDeactivate(group)}
                  >
                    <PowerOffIcon />
                    Deactivate
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => onActivate(group)}>
                    <PowerIcon />
                    Activate
                  </DropdownMenuItem>
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
