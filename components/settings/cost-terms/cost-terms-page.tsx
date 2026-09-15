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
import { createCostTermColumns } from "@/components/settings/cost-terms/cost-terms-columns"
import {
  CostTermFormDialog,
  type CostTermFormValues,
} from "@/components/settings/cost-terms/cost-terms-form-dialog"
import { Button } from "@/components/ui/button"
import {
  createCostTermId,
  readCostTerms,
  saveCostTerms,
} from "@/lib/cost-terms/storage"
import { mockCostTerms } from "@/lib/mock/cost-terms"
import type { CostTerm } from "@/types/cost-term"

export function CostTermsPage() {
  const [terms, setTerms] = React.useState<CostTerm[]>(mockCostTerms)
  const [rowSize, setRowSize] = React.useState<DataTableRowSize>("md")
  const { isFullscreen, toggleFullscreen } = useDataTableFullscreen()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [dialogMode, setDialogMode] = React.useState<"create" | "edit">("create")
  const [editingTerm, setEditingTerm] = React.useState<CostTerm | null>(null)

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTerms(readCostTerms())
  }, [])

  const persist = React.useCallback((next: CostTerm[]) => {
    setTerms(saveCostTerms(next))
  }, [])

  function openCreate() {
    setDialogMode("create")
    setEditingTerm(null)
    setDialogOpen(true)
  }

  function openEdit(term: CostTerm) {
    setDialogMode("edit")
    setEditingTerm(term)
    setDialogOpen(true)
  }

  function handleFormSubmit(values: CostTermFormValues) {
    if (dialogMode === "create") {
      const nextTerm: CostTerm = {
        id: createCostTermId(values.name),
        name: values.name.trim(),
        description: values.description.trim(),
        status: "active",
      }
      persist([nextTerm, ...terms])
      return
    }

    if (!editingTerm) return

    persist(
      terms.map((term) =>
        term.id === editingTerm.id
          ? {
              ...term,
              name: values.name.trim(),
              description: values.description.trim(),
            }
          : term
      )
    )
  }

  function setStatus(term: CostTerm, status: CostTerm["status"]) {
    persist(
      terms.map((item) => (item.id === term.id ? { ...item, status } : item))
    )
  }

  function handleDelete(term: CostTerm) {
    persist(terms.filter((item) => item.id !== term.id))
  }

  const columns = React.useMemo(
    () =>
      createCostTermColumns({
        onEdit: openEdit,
        onDeactivate: (term) => setStatus(term, "inactive"),
        onActivate: (term) => setStatus(term, "active"),
        onDelete: handleDelete,
      }),
    // Columns close over latest term handlers; refresh when data changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [terms]
  )

  const table = useDataTable({
    data: terms,
    columns,
    pageSize: 10,
    globalFilterFn: (row, _columnId, filterValue) => {
      const query = filterValue.toLowerCase()
      const item = row.original

      return (
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      )
    },
  })

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Cost Terms"
        count={`${terms.length} terms`}
        actions={
          <Button size="sm" onClick={openCreate}>
            <PlusIcon />
            Add Cost Term
          </Button>
        }
      />

      <DataTableCard
        table={table}
        columnCount={columns.length}
        searchPlaceholder="Search cost terms..."
        rowSize={rowSize}
        onRowSizeChange={setRowSize}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        emptyMessage="No cost terms found."
        onRowClick={openEdit}
      />

      <CostTermFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        term={editingTerm}
        onSubmit={handleFormSubmit}
      />
    </div>
  )
}
