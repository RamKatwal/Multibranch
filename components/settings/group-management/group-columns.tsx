"use client"

import type { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import {
  MoreVerticalIcon,
  PencilIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { IconButton } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuDivider,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Group } from "@/types/group"

export const groupColumns: ColumnDef<Group>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Group Name" />
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("name")}</span>
    ),
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.getValue("description")}</span>
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex items-center justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <IconButton
              variant="ghost"
              color="neutral"
              size="32"
              aria-label={`Actions for ${row.original.name}`}
            >
              <MoreVerticalIcon />
            </IconButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <UsersIcon />
              View members
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href={`/configurations/users/group-management/${row.original.id}`}
              >
                <PencilIcon />
                Edit permissions & dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuDivider />
            <DropdownMenuItem variant="destructive">
              <Trash2Icon />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
]
