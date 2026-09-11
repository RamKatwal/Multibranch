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
import { cn } from "@/lib/utils"
import {
  purchaseOrderStatusBadgeClassName,
  purchaseOrderStatusLabels,
  type PurchaseOrder,
} from "@/types/purchase-order"

type PurchaseOrderColumnActions = {
  onView: (order: PurchaseOrder) => void
  onEdit: (order: PurchaseOrder) => void
  onDuplicate: (order: PurchaseOrder) => void
  onDelete: (order: PurchaseOrder) => void
}

export function createPurchaseOrderColumns({
  onView,
  onEdit,
  onDuplicate,
  onDelete,
}: PurchaseOrderColumnActions): ColumnDef<PurchaseOrder>[] {
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
        <DataTableColumnHeader column={column} title="Order No." />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.getValue("id")}</span>
      ),
    },
    {
      accessorKey: "supplier",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Supplier" />
      ),
    },
    {
      accessorKey: "orderDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Order Date" />
      ),
      cell: ({ row }) => formatDate(row.getValue("orderDate")),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={cn(purchaseOrderStatusBadgeClassName[row.original.status])}
        >
          {purchaseOrderStatusLabels[row.original.status]}
        </Badge>
      ),
    },
    {
      accessorKey: "totalAmount",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Total Amount"
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
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const order = row.original

        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="link"
              className="h-auto px-0"
              onClick={() => onView(order)}
            >
              Preview
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Actions for ${order.id}`}
                  />
                }
              >
                <MoreVerticalIcon />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(order)}>
                  <EyeIcon />
                  View details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(order)}>
                  <PencilIcon />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate(order)}>
                  <CopyIcon />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDelete(order)}
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
