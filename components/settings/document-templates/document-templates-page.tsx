"use client"

import * as React from "react"
import { PlusIcon } from "lucide-react"

import {
  type DataTableRowSize,
  DataTableCard,
  useDataTable,
  useDataTableFullscreen,
} from "@/components/data-table/data-table"
import { PageHeader } from "@/components/layout/page-header"
import { createDocumentTemplateColumns } from "@/components/settings/document-templates/document-templates-columns"
import {
  DocumentTemplateFormDialog,
  type DocumentTemplateFormValues,
} from "@/components/settings/document-templates/document-templates-form-dialog"
import { Button } from "@/components/ui/button"
import {
  createDocumentTemplateId,
  readDocumentTemplates,
  saveDocumentTemplates,
} from "@/lib/document-templates/storage"
import { mockDocumentTemplates } from "@/lib/mock/document-templates"
import type { DocumentTemplate } from "@/types/document-template"
import { documentTypeLabels } from "@/types/document-type"

export function DocumentTemplatesPage() {
  const [templates, setTemplates] =
    React.useState<DocumentTemplate[]>(mockDocumentTemplates)
  const [rowSize, setRowSize] = React.useState<DataTableRowSize>("md")
  const { isFullscreen, toggleFullscreen } = useDataTableFullscreen()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [dialogMode, setDialogMode] = React.useState<"create" | "edit">("create")
  const [editingTemplate, setEditingTemplate] =
    React.useState<DocumentTemplate | null>(null)

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTemplates(readDocumentTemplates())
  }, [])

  const persist = React.useCallback((next: DocumentTemplate[]) => {
    setTemplates(saveDocumentTemplates(next))
  }, [])

  function openCreate() {
    setDialogMode("create")
    setEditingTemplate(null)
    setDialogOpen(true)
  }

  function openEdit(template: DocumentTemplate) {
    setDialogMode("edit")
    setEditingTemplate(template)
    setDialogOpen(true)
  }

  function handleFormSubmit(values: DocumentTemplateFormValues) {
    if (dialogMode === "create") {
      const isFirstForType = !templates.some(
        (template) => template.documentType === values.documentType
      )

      const nextTemplate: DocumentTemplate = {
        id: createDocumentTemplateId(values.name),
        name: values.name.trim(),
        documentType: values.documentType,
        content: values.content.trim(),
        isDefault: isFirstForType,
        status: "active",
      }
      persist([nextTemplate, ...templates])
      return
    }

    if (!editingTemplate) return

    persist(
      templates.map((template) =>
        template.id === editingTemplate.id
          ? {
              ...template,
              name: values.name.trim(),
              documentType: values.documentType,
              content: values.content.trim(),
            }
          : template
      )
    )
  }

  function setStatus(template: DocumentTemplate, status: DocumentTemplate["status"]) {
    persist(
      templates.map((item) =>
        item.id === template.id ? { ...item, status } : item
      )
    )
  }

  function handleSetDefault(template: DocumentTemplate) {
    persist(
      templates.map((item) =>
        item.documentType === template.documentType
          ? { ...item, isDefault: item.id === template.id }
          : item
      )
    )
  }

  function handleDelete(template: DocumentTemplate) {
    persist(templates.filter((item) => item.id !== template.id))
  }

  const columns = React.useMemo(
    () =>
      createDocumentTemplateColumns({
        onEdit: openEdit,
        onSetDefault: handleSetDefault,
        onDeactivate: (template) => setStatus(template, "inactive"),
        onActivate: (template) => setStatus(template, "active"),
        onDelete: handleDelete,
      }),
    // Columns close over latest template handlers; refresh when data changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [templates]
  )

  const table = useDataTable({
    data: templates,
    columns,
    pageSize: 10,
    globalFilterFn: (row, _columnId, filterValue) => {
      const query = filterValue.toLowerCase()
      const item = row.original

      return (
        item.name.toLowerCase().includes(query) ||
        documentTypeLabels[item.documentType].toLowerCase().includes(query)
      )
    },
  })

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Document Template"
        count={`${templates.length} templates`}
        actions={
          <Button size="sm" onClick={openCreate}>
            <PlusIcon />
            Add Template
          </Button>
        }
      />

      <DataTableCard
        table={table}
        columnCount={columns.length}
        searchPlaceholder="Search templates..."
        rowSize={rowSize}
        onRowSizeChange={setRowSize}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        emptyMessage="No document templates found."
        onRowClick={openEdit}
      />

      <DocumentTemplateFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        template={editingTemplate}
        onSubmit={handleFormSubmit}
      />
    </div>
  )
}
