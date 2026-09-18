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
import { createChartOfAccountColumns } from "@/components/chart-of-accounts/chart-of-accounts-columns"
import {
  ChartOfAccountFormDialog,
  type ChartOfAccountFormValues,
} from "@/components/chart-of-accounts/chart-of-accounts-form-dialog"
import { Button } from "@/components/ui/button"
import { Tabs } from "@/components/ui/tabs"
import {
  createAccountCode,
  readChartOfAccounts,
  saveChartOfAccounts,
} from "@/lib/chart-of-accounts/storage"
import type {
  AccountStatus,
  ChartOfAccount,
} from "@/lib/mock/chart-of-accounts"
import { mockChartOfAccounts } from "@/lib/mock/chart-of-accounts"

export function ChartOfAccountsPage() {
  const [accounts, setAccounts] =
    React.useState<ChartOfAccount[]>(mockChartOfAccounts)
  const [statusTab, setStatusTab] = React.useState<AccountStatus>("active")
  const [rowSize, setRowSize] = React.useState<DataTableRowSize>("md")
  const { isFullscreen, toggleFullscreen } = useDataTableFullscreen()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [dialogMode, setDialogMode] = React.useState<"create" | "edit">(
    "create"
  )
  const [editingAccount, setEditingAccount] =
    React.useState<ChartOfAccount | null>(null)

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAccounts(readChartOfAccounts())
  }, [])

  const persist = React.useCallback((next: ChartOfAccount[]) => {
    setAccounts(saveChartOfAccounts(next))
  }, [])

  const activeCount = accounts.filter((item) => item.status === "active")
    .length
  const inactiveCount = accounts.filter((item) => item.status === "inactive")
    .length

  const filteredData = React.useMemo(
    () => accounts.filter((item) => item.status === statusTab),
    [accounts, statusTab]
  )

  function openCreate() {
    setDialogMode("create")
    setEditingAccount(null)
    setDialogOpen(true)
  }

  function openEdit(account: ChartOfAccount) {
    setDialogMode("edit")
    setEditingAccount(account)
    setDialogOpen(true)
  }

  function handleFormSubmit(values: ChartOfAccountFormValues) {
    if (dialogMode === "create") {
      const nextAccount: ChartOfAccount = {
        code: createAccountCode(accounts),
        name: values.name.trim(),
        category: values.category,
        openingBalance: values.openingBalance,
        entryBy: "admin",
        status: "active",
      }
      persist([nextAccount, ...accounts])
      toast.success(`Account "${nextAccount.name}" created.`)
      return
    }

    if (!editingAccount) return

    persist(
      accounts.map((item) =>
        item.code === editingAccount.code
          ? {
              ...item,
              name: values.name.trim(),
              category: values.category,
              openingBalance: values.openingBalance,
            }
          : item
      )
    )
    toast.success(`Account "${values.name.trim()}" updated.`)
  }

  function setStatus(account: ChartOfAccount, status: AccountStatus) {
    persist(
      accounts.map((item) =>
        item.code === account.code ? { ...item, status } : item
      )
    )
  }

  function handleDelete(account: ChartOfAccount) {
    if (account.isSystemAccount) {
      toast.error(
        `"${account.name}" is linked to financial reports and can't be deleted.`
      )
      return
    }
    persist(accounts.filter((item) => item.code !== account.code))
    toast.success(`Account "${account.name}" deleted.`)
  }

  const columns = React.useMemo(
    () =>
      createChartOfAccountColumns({
        onEdit: openEdit,
        onDeactivate: (account) => setStatus(account, "inactive"),
        onActivate: (account) => setStatus(account, "active"),
        onDelete: handleDelete,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accounts]
  )

  const table = useDataTable({
    data: filteredData,
    columns,
    pageSize: 10,
    globalFilterFn: (row, _columnId, filterValue) => {
      const query = filterValue.toLowerCase()
      const item = row.original

      return (
        item.code.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
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
        title="Chart of Accounts"
        count={`${accounts.length} accounts`}
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
              Create Account
            </Button>
          </>
        }
      />

      <DataTableCard
        table={table}
        columnCount={columns.length}
        searchPlaceholder="Search accounts by code, name, category..."
        rowSize={rowSize}
        onRowSizeChange={setRowSize}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        showFilter={false}
        emptyMessage={`No ${statusTab} accounts found.`}
        onRowClick={openEdit}
        leading={
          <Tabs
            items={statusTabItems}
            value={statusTab}
            onValueChange={(status) => {
              if (typeof status !== "string") return
              setStatusTab(status as AccountStatus)
              table.setPageIndex(0)
            }}
          />
        }
      />

      <ChartOfAccountFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        account={editingAccount}
        onSubmit={handleFormSubmit}
      />
    </div>
  )
}
