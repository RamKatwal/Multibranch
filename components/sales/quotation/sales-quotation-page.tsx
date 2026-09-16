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
import { createSalesQuotationColumns } from "@/components/sales/quotation/sales-quotation-columns"
import { Button } from "@/components/ui/button"
import { Tabs } from "@/components/ui/tabs"
import { mockSalesQuotations } from "@/lib/mock/sales-quotations"
import {
  createSalesQuotationId,
  createSalesQuotationItemId,
  readSalesQuotations,
  saveSalesQuotations,
} from "@/lib/sales-quotations/storage"
import {
  SALES_QUOTATION_STATUSES,
  salesQuotationStatusLabels,
  type SalesQuotation,
  type SalesQuotationStatus,
} from "@/types/sales-quotation"

export function SalesQuotationPage() {
  const router = useRouter()
  const [quotations, setQuotations] =
    React.useState<SalesQuotation[]>(mockSalesQuotations)
  const [activeStatus, setActiveStatus] =
    React.useState<SalesQuotationStatus>("approved")
  const [rowSize, setRowSize] = React.useState<DataTableRowSize>("md")
  const { isFullscreen, toggleFullscreen } = useDataTableFullscreen()

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuotations(readSalesQuotations())
  }, [])

  const persist = React.useCallback((next: SalesQuotation[]) => {
    setQuotations(saveSalesQuotations(next))
  }, [])

  const filteredData = React.useMemo(
    () => quotations.filter((item) => item.status === activeStatus),
    [quotations, activeStatus]
  )

  const statusTabItems = React.useMemo(
    () =>
      SALES_QUOTATION_STATUSES.map((status) => ({
        value: status,
        label: salesQuotationStatusLabels[status],
        count: quotations.filter((item) => item.status === status).length,
      })),
    [quotations]
  )

  function openForm(quotation?: SalesQuotation) {
    if (quotation) {
      router.push(
        `/sales/quotation/create?id=${encodeURIComponent(quotation.id)}`
      )
      return
    }
    router.push("/sales/quotation/create")
  }

  function handleDuplicate(quotation: SalesQuotation) {
    const duplicate: SalesQuotation = {
      ...quotation,
      id: createSalesQuotationId(quotations),
      status: "draft",
      items: quotation.items.map((item, index) => ({
        ...item,
        id: createSalesQuotationItemId(index),
      })),
    }
    persist([duplicate, ...quotations])
    toast.success(`Duplicated ${quotation.id} as ${duplicate.id}.`)
  }

  function handleDelete(quotation: SalesQuotation) {
    persist(quotations.filter((item) => item.id !== quotation.id))
    toast.success(`Deleted ${quotation.id}.`)
  }

  const columns = React.useMemo(
    () =>
      createSalesQuotationColumns({
        onView: openForm,
        onEdit: openForm,
        onDuplicate: handleDuplicate,
        onDelete: handleDelete,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [quotations]
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
        item.customer.toLowerCase().includes(query) ||
        item.entryDate.includes(query) ||
        item.dueDate.includes(query) ||
        item.remarks.toLowerCase().includes(query)
      )
    },
  })

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Sales Quotation"
        count={`${quotations.length} quotations`}
        actions={
          <>
            <Button variant="outline" size="sm">
              <DownloadIcon />
              Export
            </Button>
            <Button size="sm" onClick={() => openForm()}>
              <PlusIcon />
              Create Sales Quotation
            </Button>
          </>
        }
      />

      <DataTableCard
        table={table}
        columnCount={columns.length}
        searchPlaceholder="Search quotations..."
        rowSize={rowSize}
        onRowSizeChange={setRowSize}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        emptyMessage={`No ${salesQuotationStatusLabels[activeStatus].toLowerCase()} quotations found.`}
        leading={
          <Tabs
            items={statusTabItems}
            value={activeStatus}
            onValueChange={(status) => {
              if (typeof status !== "string") return
              setActiveStatus(status as SalesQuotationStatus)
              table.setPageIndex(0)
            }}
          />
        }
      />
    </div>
  )
}
