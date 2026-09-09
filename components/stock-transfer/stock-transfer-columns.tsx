"use client"

import type { ColumnDef } from "@tanstack/react-table"
import {
  ArrowRightIcon,
  CheckIcon,
  PencilIcon,
  TruckIcon,
  Undo2Icon,
} from "lucide-react"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { formatCurrency, formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import {
  stockTransferStatusBadgeClassName,
  stockTransferStatusLabels,
  type StockTransfer,
} from "@/types/stock-transfer"

export type StockTransferRole = "head-office" | "branch"

type StockTransferColumnActions = {
  role: StockTransferRole
  onEdit: (transfer: StockTransfer) => void
  onDispatch: (transfer: StockTransfer) => void
  onReceive: (transfer: StockTransfer) => void
  onReturn: (transfer: StockTransfer) => void
}

function displayValue(value: string) {
  return value.trim() ? value : "—"
}

function formatEntryBy(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return "—"
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

export function createStockTransferColumns({
  role,
  onEdit,
  onDispatch,
  onReceive,
  onReturn,
}: StockTransferColumnActions): ColumnDef<StockTransfer>[] {
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
      cell: ({ row }) => formatDate(row.getValue("date")),
    },
    {
      id: "route",
      accessorFn: (row) => `${row.fromBranch} ${row.toBranch}`,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="From → To" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="font-medium">{row.original.fromBranch}</span>
          <ArrowRightIcon className="size-3.5 text-muted-foreground" />
          <span className="font-medium">{row.original.toBranch}</span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={cn(stockTransferStatusBadgeClassName[row.original.status])}
        >
          {stockTransferStatusLabels[row.original.status]}
        </Badge>
      ),
    },
    {
      id: "itemCount",
      accessorFn: (row) => row.items.length,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Items" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground tabular-nums">
          {row.original.items.length}
        </span>
      ),
    },
    {
      accessorKey: "totalQuantity",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Qty" />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums">{row.getValue("totalQuantity")}</span>
      ),
    },
    {
      accessorKey: "totalAmount",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Total Price"
          className="justify-end"
        />
      ),
      cell: ({ row }) => (
        <div className="text-right font-medium tabular-nums">
          {formatCurrency(row.getValue("totalAmount"))}
        </div>
      ),
    },
    {
      accessorKey: "remarks",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Remarks" />
      ),
      cell: ({ row }) => (
        <span className="block max-w-[200px] truncate text-muted-foreground">
          {displayValue(row.getValue("remarks"))}
        </span>
      ),
      enableSorting: false,
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
        const transfer = row.original
        const status = transfer.status

        return (
          <div className="flex items-center justify-end gap-1">
            {role === "head-office" && status === "approved" ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs font-normal text-muted-foreground hover:bg-info/10 hover:text-info"
                onClick={() => onDispatch(transfer)}
              >
                <TruckIcon className="size-3.5" />
                Dispatch
              </Button>
            ) : null}

            {role === "branch" && status === "requested" ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs font-normal text-muted-foreground hover:text-foreground"
                onClick={() => onEdit(transfer)}
              >
                <PencilIcon className="size-3.5" />
                Edit
              </Button>
            ) : null}

            {role === "branch" && status === "in-transit" ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs font-normal text-muted-foreground hover:bg-success/10 hover:text-success"
                onClick={() => onReceive(transfer)}
              >
                <CheckIcon className="size-3.5" />
                Confirm receipt
              </Button>
            ) : null}

            {role === "branch" && status === "completed" ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs font-normal text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                onClick={() => onReturn(transfer)}
              >
                <Undo2Icon className="size-3.5" />
                Return
              </Button>
            ) : null}
          </div>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
  ]
}
