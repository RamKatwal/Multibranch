"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import {
  BranchAccessChips,
  groupedBranchAccessSearchText,
} from "@/components/settings/users-permissions/grouped-branch-chips"
import {
  StackedAvatars,
  branchAvatarItemsFromIds,
} from "@/components/shared/stacked-avatars"
import { Checkbox } from "@/components/ui/checkbox"
import type { Product } from "@/types/product"

function formatEntryBy(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return "—"
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

export function createProductColumns(): ColumnDef<Product>[] {
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
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("name")}</span>
      ),
    },
    {
      accessorKey: "totalQuantity",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total Quantity" />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums text-muted-foreground">
          {row.getValue("totalQuantity")}
        </span>
      ),
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
  ]
}
