"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { XIcon } from "lucide-react"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  stockAdjustmentTypeLabels,
  type StockAdjustment,
} from "@/types/stock-adjustment"

function formatEntryBy(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return "—"
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

type StockAdjustmentColumnActions = {
  onCancel: (adjustment: StockAdjustment) => void
}

export function createStockAdjustmentColumns({
  onCancel,
}: StockAdjustmentColumnActions): ColumnDef<StockAdjustment>[] {
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
      accessorKey: "date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums text-muted-foreground">
          {row.getValue("date")}
        </span>
      ),
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Adjustment Type" />
      ),
      cell: ({ row }) => (
        <span className="capitalize text-muted-foreground">
          {stockAdjustmentTypeLabels[row.original.type]}
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
        const adjustment = row.original
        const canCancel = adjustment.status !== "cancelled"

        if (!canCancel) {
          return <span className="block text-right text-muted-foreground">—</span>
        }

        return (
          <div className="flex items-center justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={(event) => {
                event.stopPropagation()
                onCancel(adjustment)
              }}
            >
              <XIcon className="size-3.5" />
              Cancel
            </Button>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
  ]
}
