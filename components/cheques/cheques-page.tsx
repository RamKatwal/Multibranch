"use client"

import * as React from "react"
import { PlusIcon } from "lucide-react"
import { toast } from "sonner"

import { createChequeColumns } from "@/components/cheques/cheque-columns"
import {
  ChequeFormDialog,
  type ChequeFormValues,
} from "@/components/cheques/cheque-form-dialog"
import {
  type DataTableRowSize,
  DataTableCard,
  useDataTable,
  useDataTableFullscreen,
} from "@/components/data-table/data-table"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Tabs } from "@/components/ui/tabs"
import { readBankAccounts } from "@/lib/bank-accounts/storage"
import { createChequeId, readCheques, saveCheques } from "@/lib/cheques/storage"
import { mockBankAccounts } from "@/lib/mock/bank-accounts"
import { mockCheques } from "@/lib/mock/cheques"
import type { BankAccount } from "@/types/bank-account"
import {
  CHEQUE_STATUSES,
  chequeStatusLabels,
  type Cheque,
  type ChequeStatus,
} from "@/types/cheque"

export function ChequesPage() {
  const [cheques, setCheques] = React.useState<Cheque[]>(mockCheques)
  const [bankAccounts, setBankAccounts] =
    React.useState<BankAccount[]>(mockBankAccounts)
  const [statusTab, setStatusTab] = React.useState<ChequeStatus>("pending")
  const [rowSize, setRowSize] = React.useState<DataTableRowSize>("md")
  const { isFullscreen, toggleFullscreen } = useDataTableFullscreen()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [dialogMode, setDialogMode] = React.useState<"create" | "edit">(
    "create"
  )
  const [editingCheque, setEditingCheque] = React.useState<Cheque | null>(
    null
  )

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCheques(readCheques())
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBankAccounts(readBankAccounts())
  }, [])

  const persist = React.useCallback((next: Cheque[]) => {
    setCheques(saveCheques(next))
  }, [])

  const bankAccountName = React.useCallback(
    (bankAccountId: string) => {
      const account = bankAccounts.find((item) => item.id === bankAccountId)
      return account
        ? `${account.bankName} — ${account.accountNumber.slice(-4)}`
        : "—"
    },
    [bankAccounts]
  )

  const filteredData = React.useMemo(
    () => cheques.filter((item) => item.status === statusTab),
    [cheques, statusTab]
  )

  function openCreate() {
    setDialogMode("create")
    setEditingCheque(null)
    setDialogOpen(true)
  }

  function openEdit(cheque: Cheque) {
    setDialogMode("edit")
    setEditingCheque(cheque)
    setDialogOpen(true)
  }

  function handleFormSubmit(values: ChequeFormValues) {
    if (dialogMode === "create") {
      const nextCheque: Cheque = {
        id: createChequeId(cheques),
        chequeNumber: values.chequeNumber.trim(),
        direction: values.direction,
        bankAccountId: values.bankAccountId,
        partyName: values.partyName.trim(),
        amount: values.amount,
        chequeDate: values.chequeDate,
        remarks: values.remarks.trim() || undefined,
        entryBy: "admin",
        status: "pending",
      }
      persist([nextCheque, ...cheques])
      toast.success(`Cheque #${nextCheque.chequeNumber} recorded.`)
      return
    }

    if (!editingCheque) return

    persist(
      cheques.map((item) =>
        item.id === editingCheque.id
          ? {
              ...item,
              chequeNumber: values.chequeNumber.trim(),
              direction: values.direction,
              bankAccountId: values.bankAccountId,
              partyName: values.partyName.trim(),
              amount: values.amount,
              chequeDate: values.chequeDate,
              remarks: values.remarks.trim() || undefined,
            }
          : item
      )
    )
    toast.success(`Cheque #${values.chequeNumber.trim()} updated.`)
  }

  function markStatus(cheque: Cheque, status: ChequeStatus) {
    persist(
      cheques.map((item) =>
        item.id === cheque.id ? { ...item, status } : item
      )
    )
    toast.success(
      `Cheque #${cheque.chequeNumber} marked ${chequeStatusLabels[status].toLowerCase()}.`
    )
  }

  function handleDelete(cheque: Cheque) {
    persist(cheques.filter((item) => item.id !== cheque.id))
    toast.success(`Cheque #${cheque.chequeNumber} deleted.`)
  }

  const columns = React.useMemo(
    () =>
      createChequeColumns({
        onEdit: openEdit,
        onMarkStatus: markStatus,
        onDelete: handleDelete,
        bankAccountName,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cheques, bankAccountName]
  )

  const table = useDataTable({
    data: filteredData,
    columns,
    pageSize: 10,
    globalFilterFn: (row, _columnId, filterValue) => {
      const query = filterValue.toLowerCase()
      const item = row.original

      return (
        item.chequeNumber.toLowerCase().includes(query) ||
        item.partyName.toLowerCase().includes(query) ||
        bankAccountName(item.bankAccountId).toLowerCase().includes(query)
      )
    },
  })

  const statusTabItems = CHEQUE_STATUSES.map((status) => ({
    value: status,
    label: chequeStatusLabels[status],
    count: cheques.filter((item) => item.status === status).length,
  }))

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Cheques"
        count={`${cheques.length} cheques`}
        actions={
          <Button size="sm" onClick={openCreate}>
            <PlusIcon />
            Record Cheque
          </Button>
        }
      />

      <DataTableCard
        table={table}
        columnCount={columns.length}
        searchPlaceholder="Search by cheque number, party, bank..."
        rowSize={rowSize}
        onRowSizeChange={setRowSize}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        showFilter={false}
        emptyMessage={`No ${chequeStatusLabels[statusTab].toLowerCase()} cheques found.`}
        onRowClick={openEdit}
        leading={
          <Tabs
            items={statusTabItems}
            value={statusTab}
            onValueChange={(status) => {
              if (typeof status !== "string") return
              setStatusTab(status as ChequeStatus)
              table.setPageIndex(0)
            }}
          />
        }
      />

      <ChequeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        cheque={editingCheque}
        bankAccounts={bankAccounts}
        onSubmit={handleFormSubmit}
      />
    </div>
  )
}
