"use client"

import * as React from "react"
import { DownloadIcon, PlusIcon } from "lucide-react"
import { toast } from "sonner"

import { createBankAccountColumns } from "@/components/bank-accounts/bank-account-columns"
import {
  BankAccountFormDialog,
  type BankAccountFormValues,
} from "@/components/bank-accounts/bank-account-form-dialog"
import {
  type DataTableRowSize,
  DataTableCard,
  useDataTable,
  useDataTableFullscreen,
} from "@/components/data-table/data-table"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Tabs } from "@/components/ui/tabs"
import {
  createBankAccountId,
  readBankAccounts,
  saveBankAccounts,
} from "@/lib/bank-accounts/storage"
import { mockBankAccounts } from "@/lib/mock/bank-accounts"
import type { BankAccount, BankAccountStatus } from "@/types/bank-account"

export function BankAccountsPage() {
  const [accounts, setAccounts] =
    React.useState<BankAccount[]>(mockBankAccounts)
  const [statusTab, setStatusTab] =
    React.useState<BankAccountStatus>("active")
  const [rowSize, setRowSize] = React.useState<DataTableRowSize>("md")
  const { isFullscreen, toggleFullscreen } = useDataTableFullscreen()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [dialogMode, setDialogMode] = React.useState<"create" | "edit">(
    "create"
  )
  const [editingAccount, setEditingAccount] =
    React.useState<BankAccount | null>(null)

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAccounts(readBankAccounts())
  }, [])

  const persist = React.useCallback((next: BankAccount[]) => {
    setAccounts(saveBankAccounts(next))
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

  function openEdit(account: BankAccount) {
    setDialogMode("edit")
    setEditingAccount(account)
    setDialogOpen(true)
  }

  function handleFormSubmit(values: BankAccountFormValues) {
    if (dialogMode === "create") {
      const nextAccount: BankAccount = {
        id: createBankAccountId(accounts),
        bankName: values.bankName.trim(),
        accountName: values.accountName.trim(),
        accountNumber: values.accountNumber.trim(),
        branchName: values.branchName.trim(),
        accountType: values.accountType,
        glCode: values.glCode,
        openingBalance: values.openingBalance,
        entryBy: "admin",
        status: "active",
      }
      persist([nextAccount, ...accounts])
      toast.success(`Bank account "${nextAccount.bankName}" created.`)
      return
    }

    if (!editingAccount) return

    persist(
      accounts.map((item) =>
        item.id === editingAccount.id
          ? {
              ...item,
              bankName: values.bankName.trim(),
              accountName: values.accountName.trim(),
              accountNumber: values.accountNumber.trim(),
              branchName: values.branchName.trim(),
              accountType: values.accountType,
              glCode: values.glCode,
              openingBalance: values.openingBalance,
            }
          : item
      )
    )
    toast.success(`Bank account "${values.bankName.trim()}" updated.`)
  }

  function setStatus(account: BankAccount, status: BankAccountStatus) {
    persist(
      accounts.map((item) =>
        item.id === account.id ? { ...item, status } : item
      )
    )
  }

  function handleDelete(account: BankAccount) {
    persist(accounts.filter((item) => item.id !== account.id))
    toast.success(`Bank account "${account.bankName}" deleted.`)
  }

  const columns = React.useMemo(
    () =>
      createBankAccountColumns({
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
        item.bankName.toLowerCase().includes(query) ||
        item.accountName.toLowerCase().includes(query) ||
        item.accountNumber.toLowerCase().includes(query) ||
        item.branchName.toLowerCase().includes(query)
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
        title="Bank Accounts"
        count={`${accounts.length} bank accounts`}
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
              Create Bank Account
            </Button>
          </>
        }
      />

      <DataTableCard
        table={table}
        columnCount={columns.length}
        searchPlaceholder="Search by bank, account name, number..."
        rowSize={rowSize}
        onRowSizeChange={setRowSize}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        showFilter={false}
        emptyMessage={`No ${statusTab} bank accounts found.`}
        onRowClick={openEdit}
        leading={
          <Tabs
            items={statusTabItems}
            value={statusTab}
            onValueChange={(status) => {
              if (typeof status !== "string") return
              setStatusTab(status as BankAccountStatus)
              table.setPageIndex(0)
            }}
          />
        }
      />

      <BankAccountFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        account={editingAccount}
        onSubmit={handleFormSubmit}
      />
    </div>
  )
}
