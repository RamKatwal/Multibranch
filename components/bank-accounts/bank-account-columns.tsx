"use client"

import type { ColumnDef } from "@tanstack/react-table"
import {
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
import { bankAccountTypeLabels, type BankAccount } from "@/types/bank-account"

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

function maskAccountNumber(value: string) {
  if (value.length <= 4) return value
  return `••••${value.slice(-4)}`
}

type BankAccountColumnActions = {
  onEdit: (account: BankAccount) => void
  onDeactivate: (account: BankAccount) => void
  onActivate: (account: BankAccount) => void
  onDelete: (account: BankAccount) => void
}

export function createBankAccountColumns({
  onEdit,
  onDeactivate,
  onActivate,
  onDelete,
}: BankAccountColumnActions): ColumnDef<BankAccount>[] {
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
      accessorKey: "bankName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Bank Name" />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.getValue("bankName")}
        </span>
      ),
    },
    {
      accessorKey: "accountName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Account Name" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.getValue("accountName")}
        </span>
      ),
    },
    {
      accessorKey: "accountNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Account Number" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-sm text-muted-foreground">
          {maskAccountNumber(row.getValue("accountNumber"))}
        </span>
      ),
    },
    {
      accessorKey: "branchName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Branch" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.getValue("branchName")}
        </span>
      ),
    },
    {
      accessorKey: "accountType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => (
        <Badge variant="outline">
          {bankAccountTypeLabels[row.getValue<BankAccount["accountType"]>("accountType")]}
        </Badge>
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
                    aria-label={`Actions for ${account.bankName}`}
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
