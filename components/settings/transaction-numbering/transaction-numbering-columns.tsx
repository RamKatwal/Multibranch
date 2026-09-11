"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { PencilIcon } from "lucide-react"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Button } from "@/components/ui/button"
import { documentTypeLabels } from "@/types/document-type"
import {
  formatTransactionNumber,
  type TransactionNumberingRule,
} from "@/types/transaction-numbering"

type TransactionNumberingColumnActions = {
  onEdit: (rule: TransactionNumberingRule) => void
}

export function createTransactionNumberingColumns({
  onEdit,
}: TransactionNumberingColumnActions): ColumnDef<TransactionNumberingRule>[] {
  return [
    {
      accessorKey: "documentType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Document Type" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">
          {documentTypeLabels[row.original.documentType]}
        </span>
      ),
    },
    {
      accessorKey: "prefix",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Prefix" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-muted-foreground">
          {row.original.prefix || "—"}
        </span>
      ),
    },
    {
      accessorKey: "nextNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Next Number" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.nextNumber}</span>
      ),
    },
    {
      accessorKey: "padding",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Digits" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.padding}</span>
      ),
    },
    {
      id: "preview",
      header: () => <span>Preview</span>,
      cell: ({ row }) => (
        <span className="font-mono font-medium">
          {formatTransactionNumber(row.original)}
        </span>
      ),
      enableSorting: false,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex items-center justify-end">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit numbering for ${documentTypeLabels[row.original.documentType]}`}
            onClick={() => onEdit(row.original)}
          >
            <PencilIcon />
          </Button>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ]
}
