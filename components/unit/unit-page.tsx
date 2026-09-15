"use client"

import * as React from "react"
import { DownloadIcon, PlusIcon } from "lucide-react"
import { toast } from "sonner"

import {
  type DataTableRowSize,
  DataTableCard,
  useDataTable,
  useDataTableFullscreen,
} from "@/components/data-table/data-table"
import { PageHeader } from "@/components/layout/page-header"
import { createUnitColumns } from "@/components/unit/unit-columns"
import {
  UnitFormDialog,
  type UnitFormValues,
} from "@/components/unit/unit-form-dialog"
import { Button } from "@/components/ui/button"
import { Tabs } from "@/components/ui/tabs"
import { mockUnits } from "@/lib/mock/units"
import { createUnitId, readUnits, saveUnits } from "@/lib/units/storage"
import type { UnitOfMeasure, UnitStatus } from "@/types/unit"

export function UnitPage() {
  const [units, setUnits] = React.useState<UnitOfMeasure[]>(mockUnits)
  const [statusTab, setStatusTab] = React.useState<UnitStatus>("active")
  const [rowSize, setRowSize] = React.useState<DataTableRowSize>("md")
  const { isFullscreen, toggleFullscreen } = useDataTableFullscreen()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [dialogMode, setDialogMode] = React.useState<"create" | "edit">(
    "create"
  )
  const [editingUnit, setEditingUnit] = React.useState<UnitOfMeasure | null>(
    null
  )

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUnits(readUnits())
  }, [])

  const persist = React.useCallback((next: UnitOfMeasure[]) => {
    setUnits(saveUnits(next))
  }, [])

  const activeCount = units.filter((item) => item.status === "active").length
  const inactiveCount = units.filter((item) => item.status === "inactive")
    .length

  const filteredData = React.useMemo(
    () => units.filter((item) => item.status === statusTab),
    [units, statusTab]
  )

  function openCreate() {
    setDialogMode("create")
    setEditingUnit(null)
    setDialogOpen(true)
  }

  function openEdit(unit: UnitOfMeasure) {
    setDialogMode("edit")
    setEditingUnit(unit)
    setDialogOpen(true)
  }

  function handleFormSubmit(values: UnitFormValues) {
    if (dialogMode === "create") {
      const nextUnit: UnitOfMeasure = {
        id: createUnitId(units),
        shortName: values.shortName.trim(),
        name: values.name.trim(),
        entryBy: "ram",
        status: "active",
      }
      persist([nextUnit, ...units])
      toast.success(`Unit "${nextUnit.name}" created.`)
      return
    }

    if (!editingUnit) return

    persist(
      units.map((item) =>
        item.id === editingUnit.id
          ? {
              ...item,
              shortName: values.shortName.trim(),
              name: values.name.trim(),
            }
          : item
      )
    )
    toast.success(`Unit "${values.name.trim()}" updated.`)
  }

  function setStatus(unit: UnitOfMeasure, status: UnitStatus) {
    persist(
      units.map((item) => (item.id === unit.id ? { ...item, status } : item))
    )
  }

  function handleDelete(unit: UnitOfMeasure) {
    persist(units.filter((item) => item.id !== unit.id))
    toast.success(`Unit "${unit.name}" deleted.`)
  }

  const columns = React.useMemo(
    () =>
      createUnitColumns({
        onEdit: openEdit,
        onDeactivate: (unit) => setStatus(unit, "inactive"),
        onActivate: (unit) => setStatus(unit, "active"),
        onDelete: handleDelete,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [units]
  )

  const table = useDataTable({
    data: filteredData,
    columns,
    pageSize: 10,
    globalFilterFn: (row, _columnId, filterValue) => {
      const query = filterValue.toLowerCase()
      const item = row.original

      return (
        item.id.toLowerCase().includes(query) ||
        item.shortName.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query) ||
        item.entryBy.toLowerCase().includes(query)
      )
    },
  })

  const statusTabItems = [
    { value: "active", label: "Active", count: activeCount },
    { value: "inactive", label: "Inactive", count: inactiveCount },
  ]

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Unit of Measurement"
        count={`${units.length} units`}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info("Export is coming soon.")}
            >
              <DownloadIcon />
              Export
            </Button>
            <Button size="sm" onClick={openCreate}>
              <PlusIcon />
              Create Unit
            </Button>
          </>
        }
      />

      <DataTableCard
        table={table}
        columnCount={columns.length}
        searchPlaceholder="Search units..."
        rowSize={rowSize}
        onRowSizeChange={setRowSize}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        showFilter={false}
        emptyMessage={`No ${statusTab} units found.`}
        onRowClick={openEdit}
        leading={
          <Tabs
            items={statusTabItems}
            value={statusTab}
            onValueChange={(status) => {
              if (typeof status !== "string") return
              setStatusTab(status as UnitStatus)
              table.setPageIndex(0)
            }}
          />
        }
      />

      <UnitFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        unit={editingUnit}
        onSubmit={handleFormSubmit}
      />
    </div>
  )
}
