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
import { formatCurrency, formatDate } from "@/lib/format"
import {
  purchaseExpensePaymentStatusLabels,
  type PurchaseExpense,
} from "@/types/purchase-expense"

type PurchaseExpenseColumnActions = {
  onView: (expense: PurchaseExpense) => void
  onEdit: (expense: PurchaseExpense) => void
  onDuplicate: (expense: PurchaseExpense) => void
  onDelete: (expense: PurchaseExpense) => void
}

const paymentStatusBadgeClassName: Record<
  PurchaseExpense["paymentStatus"],
  string
> = {
  paid: "border-transparent bg-success/15 text-success",
  unpaid: "border-transparent bg-destructive/15 text-destructive",
  "partially-paid":
    "border-transparent bg-warning/15 text-warning-foreground dark:text-warning",
}

export function createPurchaseExpenseColumns({
  onView,
  onEdit,
  onDuplicate,
  onDelete,
}: PurchaseExpenseColumnActions): ColumnDef<PurchaseExpense>[] {
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
      accessorKey: "invoiceNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Invoice No" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {(row.getValue("invoiceNumber") as string) || "--"}
        </span>
      ),
    },
    {
      accessorKey: "supplier",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Supplier" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {(row.getValue("supplier") as string) || "--"}
        </span>
      ),
    },
    {
      accessorKey: "grandTotal",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Amount"
          className="justify-end"
        />
      ),
      cell: ({ row }) => (
        <div className="text-right font-medium tabular-nums">
          {formatCurrency(row.getValue("grandTotal"))}
        </div>
      ),
    },
    {
      accessorKey: "paymentStatus",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Payment Status" />
      ),
      cell: ({ row }) => {
        const paymentStatus = row.getValue(
          "paymentStatus"
        ) as PurchaseExpense["paymentStatus"]
        return (
          <Badge
            variant="outline"
            className={paymentStatusBadgeClassName[paymentStatus]}
          >
            {purchaseExpensePaymentStatusLabels[paymentStatus]}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const expense = row.original

        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="link"
              className="h-auto px-0"
              onClick={() => onView(expense)}
            >
              Preview
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Actions for ${expense.id}`}
                  />
                }
              >
                <MoreVerticalIcon />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(expense)}>
                  <EyeIcon />
                  View details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(expense)}>
                  <PencilIcon />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate(expense)}>
                  <CopyIcon />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDelete(expense)}
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
