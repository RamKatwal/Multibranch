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
import { createTdsTypeColumns } from "@/components/settings/tds-types/tds-types-columns"
import {
  TdsTypeFormDialog,
  type TdsTypeFormValues,
} from "@/components/settings/tds-types/tds-types-form-dialog"
import { Button } from "@/components/ui/button"
import {
  createTdsTypeId,
  readTdsTypes,
  saveTdsTypes,
} from "@/lib/tds-types/storage"
import { mockTdsTypes } from "@/lib/mock/tds-types"
import type { TdsType } from "@/types/tds-type"

export function TdsTypesPage() {
  const [types, setTypes] = React.useState<TdsType[]>(mockTdsTypes)
  const [rowSize, setRowSize] = React.useState<DataTableRowSize>("md")
  const { isFullscreen, toggleFullscreen } = useDataTableFullscreen()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [dialogMode, setDialogMode] = React.useState<"create" | "edit">("create")
  const [editingType, setEditingType] = React.useState<TdsType | null>(null)

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTypes(readTdsTypes())
  }, [])

  const persist = React.useCallback((next: TdsType[]) => {
    setTypes(saveTdsTypes(next))
  }, [])

  function openCreate() {
    setDialogMode("create")
    setEditingType(null)
    setDialogOpen(true)
  }

  function openEdit(type: TdsType) {
    setDialogMode("edit")
    setEditingType(type)
    setDialogOpen(true)
  }

  function handleFormSubmit(values: TdsTypeFormValues) {
    if (dialogMode === "create") {
      const nextType: TdsType = {
        id: createTdsTypeId(values.name),
        name: values.name.trim(),
        rate: values.rate,
        status: "active",
      }
      persist([nextType, ...types])
      return
    }

    if (!editingType) return

    persist(
      types.map((type) =>
        type.id === editingType.id
          ? { ...type, name: values.name.trim(), rate: values.rate }
          : type
      )
    )
  }

  function setStatus(type: TdsType, status: TdsType["status"]) {
    persist(
      types.map((item) => (item.id === type.id ? { ...item, status } : item))
    )
  }

  function handleDelete(type: TdsType) {
    persist(types.filter((item) => item.id !== type.id))
  }

  const columns = React.useMemo(
    () =>
      createTdsTypeColumns({
        onEdit: openEdit,
        onDeactivate: (type) => setStatus(type, "inactive"),
        onActivate: (type) => setStatus(type, "active"),
        onDelete: handleDelete,
      }),
    // Columns close over latest type handlers; refresh when data changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [types]
  )

  const table = useDataTable({
    data: types,
    columns,
    pageSize: 10,
    globalFilterFn: (row, _columnId, filterValue) => {
      const query = filterValue.toLowerCase()
      return row.original.name.toLowerCase().includes(query)
    },
  })

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="TDS Type"
        count={`${types.length} types`}
        actions={
          <Button size="sm" onClick={openCreate}>
            <PlusIcon />
            Add TDS Type
          </Button>
        }
      />

      <DataTableCard
        table={table}
        columnCount={columns.length}
        searchPlaceholder="Search TDS types..."
        rowSize={rowSize}
        onRowSizeChange={setRowSize}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        emptyMessage="No TDS types found."
        onRowClick={openEdit}
      />

      <TdsTypeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        type={editingType}
        onSubmit={handleFormSubmit}
      />
    </div>
  )
}
