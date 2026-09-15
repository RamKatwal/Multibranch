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
import { createPaymentTermColumns } from "@/components/settings/payment-terms/payment-terms-columns"
import {
  PaymentTermFormDialog,
  type PaymentTermFormValues,
} from "@/components/settings/payment-terms/payment-terms-form-dialog"
import { Button } from "@/components/ui/button"
import {
  createPaymentTermId,
  readPaymentTerms,
  savePaymentTerms,
} from "@/lib/payment-terms/storage"
import { mockPaymentTerms } from "@/lib/mock/payment-terms"
import type { PaymentTerm } from "@/types/payment-term"

export function PaymentTermsPage() {
  const [terms, setTerms] = React.useState<PaymentTerm[]>(mockPaymentTerms)
  const [rowSize, setRowSize] = React.useState<DataTableRowSize>("md")
  const { isFullscreen, toggleFullscreen } = useDataTableFullscreen()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [dialogMode, setDialogMode] = React.useState<"create" | "edit">("create")
  const [editingTerm, setEditingTerm] = React.useState<PaymentTerm | null>(null)

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTerms(readPaymentTerms())
  }, [])

  const persist = React.useCallback((next: PaymentTerm[]) => {
    setTerms(savePaymentTerms(next))
  }, [])

  function openCreate() {
    setDialogMode("create")
    setEditingTerm(null)
    setDialogOpen(true)
  }

  function openEdit(term: PaymentTerm) {
    setDialogMode("edit")
    setEditingTerm(term)
    setDialogOpen(true)
  }

  function handleFormSubmit(values: PaymentTermFormValues) {
    if (dialogMode === "create") {
      const nextTerm: PaymentTerm = {
        id: createPaymentTermId(values.name),
        name: values.name.trim(),
        days: values.days,
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
              days: values.days,
              description: values.description.trim(),
            }
          : term
      )
    )
  }

  function setStatus(term: PaymentTerm, status: PaymentTerm["status"]) {
    persist(
      terms.map((item) => (item.id === term.id ? { ...item, status } : item))
    )
  }

  function handleDelete(term: PaymentTerm) {
    persist(terms.filter((item) => item.id !== term.id))
  }

  const columns = React.useMemo(
    () =>
      createPaymentTermColumns({
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
        title="Payment Terms"
        count={`${terms.length} terms`}
        actions={
          <Button size="sm" onClick={openCreate}>
            <PlusIcon />
            Add Payment Term
          </Button>
        }
      />

      <DataTableCard
        table={table}
        columnCount={columns.length}
        searchPlaceholder="Search payment terms..."
        rowSize={rowSize}
        onRowSizeChange={setRowSize}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        emptyMessage="No payment terms found."
        onRowClick={openEdit}
      />

      <PaymentTermFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        term={editingTerm}
        onSubmit={handleFormSubmit}
      />
    </div>
  )
}
