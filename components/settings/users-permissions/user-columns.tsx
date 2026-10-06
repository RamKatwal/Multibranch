"use client"

import type { ColumnDef } from "@tanstack/react-table"
import {
  EyeIcon,
  MailIcon,
  MoreVerticalIcon,
  PencilIcon,
  UserRoundCheckIcon,
  UserRoundXIcon,
} from "lucide-react"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import {
  CompanyAccessChips,
  UserAccessGroups,
  groupedBranchAccessSearchText,
  userAccessSearchText,
} from "@/components/settings/users-permissions/grouped-branch-chips"
import { IconButton } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Group } from "@/types/group"
import type { AppUser } from "@/types/user"

type UserColumnHandlers = {
  groups: Group[]
  onView: (user: AppUser) => void
  onEdit: (user: AppUser) => void
  onActivate: (user: AppUser) => void
  onDeactivate: (user: AppUser) => void
  onResendEmail: (user: AppUser) => void
}

export function getUserAccessLabel(user: AppUser, roles: Group[] = []) {
  if (user.assignments.length === 0) return "No access"
  return userAccessSearchText(user.assignments, roles)
}

export function createUserColumns({
  groups,
  onView,
  onEdit,
  onActivate,
  onDeactivate,
  onResendEmail,
}: UserColumnHandlers): ColumnDef<AppUser>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("name")}</span>
      ),
    },
    {
      accessorKey: "username",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Username" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {(row.getValue("username") as string) || "—"}
        </span>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.getValue("email")}</span>
      ),
    },
    {
      id: "companies",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Company" />
      ),
      accessorFn: (row) =>
        groupedBranchAccessSearchText(
          row.assignments.map((assignment) => assignment.branchId)
        ),
      cell: ({ row }) => (
        <CompanyAccessChips
          branchIds={row.original.assignments.map(
            (assignment) => assignment.branchId
          )}
          emptyLabel="No access"
        />
      ),
      meta: { wrapCell: true },
    },
    {
      id: "branches",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Branches" />
      ),
      accessorFn: (row) => userAccessSearchText(row.assignments, groups),
      cell: ({ row }) => (
        <UserAccessGroups
          assignments={row.original.assignments}
          roles={groups}
          emptyLabel="No access"
        />
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
        const user = row.original
        return (
          <div className="flex items-center justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <IconButton
                    variant="ghost"
                    color="neutral"
                    size="32"
                    aria-label={`Actions for ${user.name}`}
                  />
                }
              >
                <MoreVerticalIcon />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(user)}>
                  <EyeIcon />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(user)}>
                  <PencilIcon />
                  Edit user
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onResendEmail(user)}>
                  <MailIcon />
                  Resend Email
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {user.status === "active" ? (
                  <DropdownMenuItem onClick={() => onDeactivate(user)}>
                    <UserRoundXIcon />
                    Deactivate
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => onActivate(user)}>
                    <UserRoundCheckIcon />
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
