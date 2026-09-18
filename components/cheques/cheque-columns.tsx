"use client"

import type { ColumnDef } from "@tanstack/react-table"
import {
  BanIcon,
  CheckIcon,
  MoreVerticalIcon,
  PencilIcon,
  Trash2Icon,
  UndoIcon,
  XIcon,
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
import { cn } from "@/lib/utils"
import {
  chequeDirectionLabels,
  chequeStatusLabels,
  type Cheque,
  type ChequeStatus,
} from "@/types/cheque"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const statusBadgeClass: Record<ChequeStatus, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400",
  cleared: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400",
  bounced: "border-destructive/20 bg-destructive/10 text-destructive",
  cancelled: "border-border bg-muted text-muted-foreground",
}

type ChequeColumnActions = {
  onEdit: (cheque: Cheque) => void
  onMarkStatus: (cheque: Cheque, status: ChequeStatus) => void
  onDelete: (cheque: Cheque) => void
  bankAccountName: (bankAccountId: string) => string
}

export function createChequeColumns({
  onEdit,
  onMarkStatus,
  onDelete,
  bankAccountName,
}: ChequeColumnActions): ColumnDef<Cheque>[] {
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
      accessorKey: "chequeNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Cheque No." />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-sm font-medium text-foreground">
          {row.getValue("chequeNumber")}
        </span>
      ),
    },
    {
      accessorKey: "direction",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Direction" />
      ),
      cell: ({ row }) => (
        <Badge variant="outline">
          {chequeDirectionLabels[row.getValue<Cheque["direction"]>("direction")]}
        </Badge>
      ),
    },
    {
      accessorKey: "partyName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Party" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("partyName")}</span>
      ),
    },
    {
      id: "bankAccountId",
      accessorFn: (row) => bankAccountName(row.bankAccountId),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Bank Account" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {bankAccountName(row.original.bankAccountId)}
        </span>
      ),
    },
    {
      accessorKey: "chequeDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatDate(row.getValue("chequeDate"))}
        </span>
      ),
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums font-medium">
          {formatCurrency(row.getValue("amount"))}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue<ChequeStatus>("status")
        return (
          <Badge variant="outline" className={cn(statusBadgeClass[status])}>
            {chequeStatusLabels[status]}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const cheque = row.original
        const isPending = cheque.status === "pending"

        return (
          <div className="flex items-center justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Actions for cheque ${cheque.chequeNumber}`}
                  />
                }
              >
                <MoreVerticalIcon />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(cheque)}>
                  <PencilIcon />
                  Edit
                </DropdownMenuItem>
                {isPending ? (
                  <>
                    <DropdownMenuItem
                      onClick={() => onMarkStatus(cheque, "cleared")}
                    >
                      <CheckIcon />
                      Mark Cleared
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onMarkStatus(cheque, "bounced")}
                    >
                      <BanIcon />
                      Mark Bounced
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onMarkStatus(cheque, "cancelled")}
                    >
                      <XIcon />
                      Cancel
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem
                    onClick={() => onMarkStatus(cheque, "pending")}
                  >
                    <UndoIcon />
                    Reopen as Pending
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDelete(cheque)}
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
