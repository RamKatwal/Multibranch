"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { DownloadIcon, PlusIcon } from "lucide-react"
import { toast } from "sonner"

import {
  type DataTableRowSize,
  DataTableCard,
  useDataTable,
  useDataTableFullscreen,
} from "@/components/data-table/data-table"
import { PageHeader } from "@/components/layout/page-header"
import { createPurchaseExpenseColumns } from "@/components/purchase/expense/purchase-expense-columns"
import { Button } from "@/components/ui/button"
import { Tabs } from "@/components/ui/tabs"
import { mockPurchaseExpenses } from "@/lib/mock/purchase-expenses"
import {
  createPurchaseExpenseId,
  createPurchaseExpenseItemId,
  readPurchaseExpenses,
  savePurchaseExpenses,
} from "@/lib/purchase-expenses/storage"
import {
  PURCHASE_EXPENSE_STATUSES,
  purchaseExpenseStatusLabels,
  type PurchaseExpense,
  type PurchaseExpenseStatus,
} from "@/types/purchase-expense"

export function PurchaseExpensePage() {
  const router = useRouter()
  const [expenses, setExpenses] = React.useState<PurchaseExpense[]>(mockPurchaseExpenses)
  const [activeStatus, setActiveStatus] =
    React.useState<PurchaseExpenseStatus>("approved")
  const [rowSize, setRowSize] = React.useState<DataTableRowSize>("md")
  const { isFullscreen, toggleFullscreen } = useDataTableFullscreen()

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExpenses(readPurchaseExpenses())
  }, [])

  const persist = React.useCallback((next: PurchaseExpense[]) => {
    setExpenses(savePurchaseExpenses(next))
  }, [])

  const filteredData = React.useMemo(
    () => expenses.filter((item) => item.status === activeStatus),
    [expenses, activeStatus]
  )

  const statusTabItems = React.useMemo(
    () =>
      PURCHASE_EXPENSE_STATUSES.map((status) => ({
        value: status,
        label: purchaseExpenseStatusLabels[status],
        count: expenses.filter((item) => item.status === status).length,
      })),
    [expenses]
  )

  function openForm(expense?: PurchaseExpense) {
    if (expense) {
      router.push(
        `/purchase/expense/create?id=${encodeURIComponent(expense.id)}`
      )
      return
    }
    router.push("/purchase/expense/create")
  }

  function handleDuplicate(expense: PurchaseExpense) {
    const duplicate: PurchaseExpense = {
      ...expense,
      id: createPurchaseExpenseId(expenses),
      status: "draft",
      items: expense.items.map((item, index) => ({
        ...item,
        id: createPurchaseExpenseItemId(index),
      })),
    }
    persist([duplicate, ...expenses])
    toast.success(`Duplicated ${expense.id} as ${duplicate.id}.`)
  }

  function handleDelete(expense: PurchaseExpense) {
    persist(expenses.filter((item) => item.id !== expense.id))
    toast.success(`Deleted ${expense.id}.`)
  }

  const columns = React.useMemo(
    () =>
      createPurchaseExpenseColumns({
        onView: openForm,
        onEdit: openForm,
        onDuplicate: handleDuplicate,
        onDelete: handleDelete,
      }),
    // Columns close over latest expense handlers; refresh when data changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [expenses]
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
        item.supplier.toLowerCase().includes(query) ||
        item.invoiceNumber.toLowerCase().includes(query) ||
        item.entryDate.includes(query)
      )
    },
  })

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Expense"
        count={`${expenses.length} expenses`}
        actions={
          <>
            <Button variant="outline" size="sm">
              <DownloadIcon />
              Export
            </Button>
            <Button size="sm" onClick={() => openForm()}>
              <PlusIcon />
              Create Expense
            </Button>
          </>
        }
      />

      <DataTableCard
        table={table}
        columnCount={columns.length}
        searchPlaceholder="Search expenses..."
        rowSize={rowSize}
        onRowSizeChange={setRowSize}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        emptyMessage={`No ${purchaseExpenseStatusLabels[activeStatus].toLowerCase()} expenses found.`}
        leading={
          <Tabs
            items={statusTabItems}
            value={activeStatus}
            onValueChange={(status) => {
              if (typeof status !== "string") return
              setActiveStatus(status as PurchaseExpenseStatus)
              table.setPageIndex(0)
            }}
          />
        }
      />
    </div>
  )
}
