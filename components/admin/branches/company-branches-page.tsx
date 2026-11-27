"use client"

import * as React from "react"
import Link from "next/link"
import { PlusIcon } from "lucide-react"
import { toast } from "sonner"

import { BranchDialog } from "@/components/admin/branches/branch-dialog"
import {
  type DataTableRowSize,
  DataTableCard,
  useDataTable,
  useDataTableFullscreen,
} from "@/components/data-table/data-table"
import { PageHeader } from "@/components/layout/page-header"
import { createBranchColumns } from "@/components/settings/branch-management/branch-columns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  getCompanyBranches,
  getCompanyById,
  useAllBranches,
  useBranchLimit,
  useCompanies,
} from "@/lib/branches/company-branches"
import { canDeactivateBranch } from "@/lib/branches/head-office"
import { saveAllBranches } from "@/lib/branches/storage"
import type { Branch } from "@/types/branch"

const noopSubscribe = () => () => {}

export function CompanyBranchesPage({ companyId }: { companyId: string }) {
  const company = getCompanyById(useCompanies(), companyId)
  const hydrated = React.useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  )
  const allBranches = useAllBranches()
  const branchLimit = useBranchLimit()
  const branches = React.useMemo(
    () => getCompanyBranches(allBranches, companyId),
    [allBranches, companyId]
  )
  const [rowSize, setRowSize] = React.useState<DataTableRowSize>("md")
  const { isFullscreen, toggleFullscreen } = useDataTableFullscreen()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingBranch, setEditingBranch] = React.useState<Branch | null>(null)

  const columns = React.useMemo(() => {
    function setStatus(branch: Branch, status: Branch["status"]) {
      if (status === "inactive" && !canDeactivateBranch(branch)) return
      saveAllBranches(
        allBranches.map((item) =>
          item.id === branch.id ? { ...item, status } : item
        )
      )
      toast.success(
        status === "active" ? "Branch activated" : "Branch deactivated"
      )
    }

    return createBranchColumns({
      showLocation: true,
      onEdit: (branch) => {
        setEditingBranch(branch)
        setDialogOpen(true)
      },
      onDeactivate: (branch) => setStatus(branch, "inactive"),
      onActivate: (branch) => setStatus(branch, "active"),
    })
  }, [allBranches])

  const table = useDataTable({
    data: branches,
    columns,
    pageSize: 10,
    globalFilterFn: (row, _columnId, filterValue) => {
      const query = String(filterValue).toLowerCase()
      const item = row.original
      return (
        item.name.toLowerCase().includes(query) ||
        item.code.toLowerCase().includes(query) ||
        item.address.toLowerCase().includes(query)
      )
    },
  })

  function openCreate() {
    setEditingBranch(null)
    setDialogOpen(true)
  }

  if (!company) {
    // Demo companies only exist on the client; don't flash "not found" during hydration.
    if (!hydrated) return null
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm font-medium text-fg">Company not found</p>
        <p className="text-sm text-fg-secondary">
          It may have been removed, or you don&apos;t have access to it.
        </p>
        <Button asChild size="32" variant="outline" color="neutral">
          <Link href="/admin/branches">Back to branches</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={company.name}
        count={branches.length}
        badge={
          <Badge
            variant="soft"
            color={allBranches.length >= branchLimit ? "warning" : "neutral"}
            size="20"
            className="tabular-nums"
          >
            {allBranches.length} of {branchLimit} branches used
          </Badge>
        }
        actions={
          <Button size="32" onClick={openCreate}>
            <PlusIcon />
            Add branch
          </Button>
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
        emptyMessage="No branches yet."
      />

      <BranchDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        branch={editingBranch}
        companyId={companyId}
      />
    </div>
  )
}
