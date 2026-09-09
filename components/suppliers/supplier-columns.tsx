"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { EyeIcon, EyeOffIcon, PencilIcon } from "lucide-react"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import {
  BranchAccessChips,
  groupedBranchAccessSearchText,
} from "@/components/settings/users-permissions/grouped-branch-chips"
import {
  StackedAvatars,
  branchAvatarItemsFromIds,
} from "@/components/shared/stacked-avatars"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  supplierTypeLabels,
  type Supplier,
} from "@/types/supplier"

type SupplierColumnActions = {
  onEdit: (supplier: Supplier) => void
  onDeactivate: (supplier: Supplier) => void
  onActivate: (supplier: Supplier) => void
}

function displayValue(value: string) {
  return value.trim() ? value : "—"
}

function formatEntryBy(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return "—"
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

export function createSupplierColumns({
  onEdit,
  onDeactivate,
  onActivate,
}: SupplierColumnActions): ColumnDef<Supplier>[] {
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
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.getValue("id")}</span>
      ),
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {supplierTypeLabels[row.original.type]}
        </span>
      ),
    },
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
      accessorKey: "address",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Address" />
      ),
      cell: ({ row }) => displayValue(row.getValue("address")),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => (
        <span className="max-w-[160px] truncate text-muted-foreground">
          {displayValue(row.getValue("email"))}
        </span>
      ),
    },
    {
      accessorKey: "contact",
      header: () => <span>Contact</span>,
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {displayValue(row.getValue("contact"))}
        </span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "category",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
    },
    {
      id: "createdOn",
      accessorFn: (row) =>
        row.createdBranchId
          ? groupedBranchAccessSearchText([row.createdBranchId])
          : "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created on" />
      ),
      cell: ({ row }) => (
        <BranchAccessChips
          branchIds={
            row.original.createdBranchId ? [row.original.createdBranchId] : []
          }
          emptyLabel="—"
        />
      ),
      meta: { wrapCell: true },
    },
    {
      id: "addedOn",
      accessorFn: (row) => row.addedBranchIds?.length ?? 0,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Added on" />
      ),
      cell: ({ row }) => {
        const branchIds = row.original.addedBranchIds ?? []
        return (
          <StackedAvatars
            items={branchAvatarItemsFromIds(branchIds)}
            total={branchIds.length}
          />
        )
      },
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
        const supplier = row.original
        const isActive = supplier.status === "active"

        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs font-normal text-muted-foreground hover:text-foreground"
              onClick={() => onEdit(supplier)}
            >
              <PencilIcon className="size-3.5" />
              Edit
            </Button>
            {isActive ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs font-normal text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                onClick={() => onDeactivate(supplier)}
              >
                <EyeOffIcon className="size-3.5" />
                Deactivate
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs font-normal text-muted-foreground hover:bg-success/10 hover:text-success"
                onClick={() => onActivate(supplier)}
              >
                <EyeIcon className="size-3.5" />
                Activate
              </Button>
            )}
          </div>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
  ]
}
