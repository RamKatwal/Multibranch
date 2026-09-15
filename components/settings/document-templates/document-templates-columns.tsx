"use client"

import type { ColumnDef } from "@tanstack/react-table"
import {
  MoreVerticalIcon,
  PencilIcon,
  PowerIcon,
  PowerOffIcon,
  StarIcon,
  Trash2Icon,
} from "lucide-react"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  documentTemplateStatusLabels,
  type DocumentTemplate,
} from "@/types/document-template"
import { documentTypeLabels } from "@/types/document-type"

type DocumentTemplateColumnActions = {
  onEdit: (template: DocumentTemplate) => void
  onSetDefault: (template: DocumentTemplate) => void
  onDeactivate: (template: DocumentTemplate) => void
  onActivate: (template: DocumentTemplate) => void
  onDelete: (template: DocumentTemplate) => void
}

export function createDocumentTemplateColumns({
  onEdit,
  onSetDefault,
  onDeactivate,
  onActivate,
  onDelete,
}: DocumentTemplateColumnActions): ColumnDef<DocumentTemplate>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Template Name" />
      ),
      cell: ({ row }) => {
        const template = row.original
        return (
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate font-medium">{template.name}</span>
            {template.isDefault ? (
              <Badge variant="secondary" className="shrink-0">
                Default
              </Badge>
            ) : null}
          </div>
        )
      },
    },
    {
      accessorKey: "documentType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Document Type" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {documentTypeLabels[row.original.documentType]}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <Badge variant={status === "active" ? "secondary" : "outline"}>
            {documentTemplateStatusLabels[status]}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const template = row.original
        const isActive = template.status === "active"

        return (
          <div className="flex items-center justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Actions for ${template.name}`}
                  />
                }
              >
                <MoreVerticalIcon />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(template)}>
                  <PencilIcon />
                  Edit
                </DropdownMenuItem>
                {template.isDefault ? null : (
                  <DropdownMenuItem onClick={() => onSetDefault(template)}>
                    <StarIcon />
                    Set as default
                  </DropdownMenuItem>
                )}
                {isActive ? (
                  <DropdownMenuItem onClick={() => onDeactivate(template)}>
                    <PowerOffIcon />
                    Deactivate
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => onActivate(template)}>
                    <PowerIcon />
                    Activate
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDelete(template)}
                  disabled={template.isDefault}
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
