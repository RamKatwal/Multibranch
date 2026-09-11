"use client"

import * as React from "react"

import {
  type DataTableRowSize,
  DataTableCard,
  useDataTable,
  useDataTableFullscreen,
} from "@/components/data-table/data-table"
import { PageHeader } from "@/components/layout/page-header"
import { createTransactionNumberingColumns } from "@/components/settings/transaction-numbering/transaction-numbering-columns"
import {
  TransactionNumberingFormDialog,
  type TransactionNumberingFormValues,
} from "@/components/settings/transaction-numbering/transaction-numbering-form-dialog"
import { mockTransactionNumbering } from "@/lib/mock/transaction-numbering"
import {
  readTransactionNumbering,
  saveTransactionNumbering,
} from "@/lib/transaction-numbering/storage"
import { documentTypeLabels } from "@/types/document-type"
import type { TransactionNumberingRule } from "@/types/transaction-numbering"

export function TransactionNumberingPage() {
  const [rules, setRules] = React.useState<TransactionNumberingRule[]>(
    mockTransactionNumbering
  )
  const [rowSize, setRowSize] = React.useState<DataTableRowSize>("md")
  const { isFullscreen, toggleFullscreen } = useDataTableFullscreen()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingRule, setEditingRule] =
    React.useState<TransactionNumberingRule | null>(null)

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRules(readTransactionNumbering())
  }, [])

  const persist = React.useCallback((next: TransactionNumberingRule[]) => {
    setRules(saveTransactionNumbering(next))
  }, [])

  function openEdit(rule: TransactionNumberingRule) {
    setEditingRule(rule)
    setDialogOpen(true)
  }

  function handleFormSubmit(values: TransactionNumberingFormValues) {
    if (!editingRule) return

    persist(
      rules.map((rule) =>
        rule.documentType === editingRule.documentType
          ? { ...rule, ...values }
          : rule
      )
    )
  }

  const columns = React.useMemo(
    () => createTransactionNumberingColumns({ onEdit: openEdit }),
    []
  )

  const table = useDataTable({
    data: rules,
    columns,
    pageSize: 10,
    globalFilterFn: (row, _columnId, filterValue) => {
      const query = filterValue.toLowerCase()
      return documentTypeLabels[row.original.documentType]
        .toLowerCase()
        .includes(query)
    },
  })

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Transaction Numbering"
        count={`${rules.length} document types`}
      />

      <DataTableCard
        table={table}
        columnCount={columns.length}
        searchPlaceholder="Search document types..."
        rowSize={rowSize}
        onRowSizeChange={setRowSize}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        emptyMessage="No document types found."
        onRowClick={openEdit}
      />

      <TransactionNumberingFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        rule={editingRule}
        onSubmit={handleFormSubmit}
      />
    </div>
  )
}
