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
import { createBranchColumns } from "@/components/settings/branch-management/branch-columns"
import {
  BranchFormDialog,
  type BranchFormValues,
} from "@/components/settings/branch-management/branch-form-dialog"
import { QuickBranchSetupDialog } from "@/components/settings/branch-management/quick-branch-setup-dialog"
import { Button } from "@/components/ui/button"
import { canDeactivateBranch } from "@/lib/branches/head-office"
import {
  createBranchId,
  readBranches,
  saveBranches,
  todayIsoDate,
} from "@/lib/branches/storage"
import {
  DEFAULT_BRANCH_LIMIT,
  getBranchLimit,
  isBranchLimitReached,
} from "@/lib/branches/subscription"
import { mockBranches } from "@/lib/mock/branches"
import type { Branch } from "@/types/branch"

export function BranchManagementPage() {
  const [branches, setBranches] = React.useState<Branch[]>(mockBranches)
  const [branchLimit, setBranchLimit] = React.useState(DEFAULT_BRANCH_LIMIT)
  const [rowSize, setRowSize] = React.useState<DataTableRowSize>("md")
  const { isFullscreen, toggleFullscreen } = useDataTableFullscreen()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [dialogMode, setDialogMode] = React.useState<"create" | "edit">("create")
  const [editingBranch, setEditingBranch] = React.useState<Branch | null>(null)
  const [quickSetupOpen, setQuickSetupOpen] = React.useState(false)

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBranches(readBranches())
    setBranchLimit(getBranchLimit())
  }, [])

  const limitReached = isBranchLimitReached(branches.length)

  const persist = React.useCallback((next: Branch[]) => {
    setBranches(saveBranches(next))
  }, [])

  function openCreate() {
    if (limitReached) return
    setDialogMode("create")
    setEditingBranch(null)
    setDialogOpen(true)
  }

  function openEdit(branch: Branch) {
    setDialogMode("edit")
    setEditingBranch(branch)
    setDialogOpen(true)
  }

  function handleFormSubmit(values: BranchFormValues) {
    if (dialogMode === "create") {
      if (isBranchLimitReached(branches.length)) return

      const nextBranch: Branch = {
        id: createBranchId(values.code),
        name: values.name.trim(),
        code: values.code.trim().toUpperCase(),
        address: values.address.trim(),
        contactNumber: values.contactNumber.trim(),
        contactEmail: values.contactEmail.trim(),
        status: "active",
        createdAt: todayIsoDate(),
      }
      persist([nextBranch, ...branches])
      return
    }

    if (!editingBranch) return

    persist(
      branches.map((branch) =>
        branch.id === editingBranch.id
          ? {
              ...branch,
              name: values.name.trim(),
              address: values.address.trim(),
              contactNumber: values.contactNumber.trim(),
              contactEmail: values.contactEmail.trim(),
            }
          : branch
      )
    )
  }

  function handleQuickSetupSave(created: Branch[]) {
    if (created.length === 0) return
    const remaining = Math.max(0, branchLimit - branches.length)
    if (remaining === 0) return
    persist([...branches, ...created.slice(0, remaining)])
  }

  function setStatus(branch: Branch, status: Branch["status"]) {
    if (status === "inactive" && !canDeactivateBranch(branch)) return

    persist(
      branches.map((item) =>
        item.id === branch.id ? { ...item, status } : item
      )
    )
  }

  const columns = React.useMemo(
    () =>
      createBranchColumns({
        onEdit: openEdit,
        onDeactivate: (branch) => setStatus(branch, "inactive"),
        onActivate: (branch) => setStatus(branch, "active"),
      }),
    // Columns close over latest branch handlers; refresh when data changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [branches]
  )

  const table = useDataTable({
    data: branches,
    columns,
    pageSize: 10,
    globalFilterFn: (row, _columnId, filterValue) => {
      const query = filterValue.toLowerCase()
      const item = row.original

      return (
        item.name.toLowerCase().includes(query) ||
        item.code.toLowerCase().includes(query) ||
        item.address.toLowerCase().includes(query) ||
        item.contactEmail.toLowerCase().includes(query) ||
        item.contactNumber.toLowerCase().includes(query)
      )
    },
  })

  const existingCodes = branches.map((branch) => branch.code)

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Branch Management"
        count={`${branches.length} / ${branchLimit}`}
        actions={
          <div className="flex items-center gap-2">
            {limitReached ? (
              <span className="text-xs text-muted-foreground">
                Branch limit reached
              </span>
            ) : null}
            <Button
              size="32"
              variant="outline"
              color="neutral"
              onClick={() => setQuickSetupOpen(true)}
            >
              Quick branch setup
            </Button>
            <Button size="32" disabled={limitReached} onClick={openCreate}>
              <PlusIcon />
              Add Branch
            </Button>
          </div>
        }
      />

      <DataTableCard
        table={table}
        columnCount={columns.length}
        searchPlaceholder="Search branches..."
        rowSize={rowSize}
        onRowSizeChange={setRowSize}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        emptyMessage="No branches found."
        onRowClick={openEdit}
      />

      <BranchFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        branch={editingBranch}
        existingCodes={existingCodes}
        onSubmit={handleFormSubmit}
      />

      <QuickBranchSetupDialog
        open={quickSetupOpen}
        onOpenChange={setQuickSetupOpen}
        existingBranches={branches}
        branchLimit={branchLimit}
        onSave={handleQuickSetupSave}
      />
    </div>
  )
}
