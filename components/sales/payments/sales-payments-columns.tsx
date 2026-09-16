"use client"

import type { ColumnDef } from "@tanstack/react-table"
import {
  CopyIcon,
  EyeIcon,
  MoreVerticalIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatCurrency, formatDate } from "@/lib/format"
import {
  salesPaymentModeLabels,
  type SalesPayment,
} from "@/types/sales-payment"

type SalesPaymentColumnActions = {
  onView: (payment: SalesPayment) => void
  onEdit: (payment: SalesPayment) => void
  onDuplicate: (payment: SalesPayment) => void
  onDelete: (payment: SalesPayment) => void
}

export function createSalesPaymentColumns({
  onView,
  onEdit,
  onDuplicate,
  onDelete,
}: SalesPaymentColumnActions): ColumnDef<SalesPayment>[] {
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
      accessorKey: "entryDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Entry Date" />
      ),
      cell: ({ row }) => formatDate(row.getValue("entryDate")),
    },
    {
      accessorKey: "customer",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Customer" />
      ),
    },
    {
      accessorKey: "refInvoice",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Ref. Invoice" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {(row.getValue("refInvoice") as string) || "—"}
        </span>
      ),
    },
    {
      accessorKey: "mode",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Mode" />
      ),
      cell: ({ row }) => salesPaymentModeLabels[row.original.mode],
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Amount"
          className="justify-end"
        />
      ),
      cell: ({ row }) => (
        <div className="text-right font-medium tabular-nums">
          {formatCurrency(row.getValue("amount"))}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const payment = row.original

        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="link"
              className="h-auto px-0"
              onClick={() => onView(payment)}
            >
              Preview
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Actions for ${payment.id}`}
                  />
                }
              >
                <MoreVerticalIcon />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(payment)}>
                  <EyeIcon />
                  View details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(payment)}>
                  <PencilIcon />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate(payment)}>
                  <CopyIcon />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDelete(payment)}
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
