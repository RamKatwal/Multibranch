"use client"

import type { ColumnDef } from "@tanstack/react-table"
import {
  LockIcon,
  MoreVerticalIcon,
  PencilIcon,
  PowerIcon,
  PowerOffIcon,
  Trash2Icon,
} from "lucide-react"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { ChartOfAccount } from "@/lib/mock/chart-of-accounts"

function formatEntryBy(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return "—"
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

type ChartOfAccountColumnActions = {
  onEdit: (account: ChartOfAccount) => void
  onDeactivate: (account: ChartOfAccount) => void
  onActivate: (account: ChartOfAccount) => void
  onDelete: (account: ChartOfAccount) => void
}

export function createChartOfAccountColumns({
  onEdit,
  onDeactivate,
  onActivate,
  onDelete,
}: ChartOfAccountColumnActions): ColumnDef<ChartOfAccount>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() ? true : false)
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Code" />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.getValue("code")}
        </span>
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Account Name" />
      ),
      cell: ({ row }) => {
        const account = row.original
        return (
          <span className="inline-flex items-center gap-1.5 font-medium">
            {account.name}
            {account.isSystemAccount ? (
              <LockIcon
                className="size-3 text-muted-foreground"
                aria-label="System-linked account"
              />
            ) : null}
          </span>
        )
      },
    },
    {
      accessorKey: "category",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Account Category" />
      ),
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("category")}</Badge>
      ),
    },
    {
      accessorKey: "openingBalance",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Opening Balance" />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums text-muted-foreground">
          {formatCurrency(row.getValue("openingBalance"))}
        </span>
      ),
    },
    {
      accessorKey: "entryBy",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Entry By" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatEntryBy(row.getValue("entryBy"))}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const account = row.original
        const isActive = account.status === "active"

        return (
          <div className="flex items-center justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Actions for ${account.name}`}
                  />
                }
              >
                <MoreVerticalIcon />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(account)}>
                  <PencilIcon />
                  Edit
                </DropdownMenuItem>
                {isActive ? (
                  <DropdownMenuItem onClick={() => onDeactivate(account)}>
                    <PowerOffIcon />
                    Deactivate
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => onActivate(account)}>
                    <PowerIcon />
                    Activate
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDelete(account)}
                >
                  <Trash2Icon />
                  Delete
                </DropdownMenuItem>
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
