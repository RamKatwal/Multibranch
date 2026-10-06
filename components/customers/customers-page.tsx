"use client"

import * as React from "react"
import { DownloadIcon, PlusIcon, UploadIcon } from "lucide-react"

import {
  type DataTableRowSize,
  DataTableCard,
  useDataTable,
  useDataTableFullscreen,
} from "@/components/data-table/data-table"
import { PageHeader } from "@/components/layout/page-header"
import { groupedBranchAccessSearchText } from "@/components/settings/users-permissions/grouped-branch-chips"
import { createCustomerColumns } from "@/components/customers/customer-columns"
import { Button } from "@/components/ui/button"
import { Tabs } from "@/components/ui/tabs"
import { customerCategories, mockCustomers } from "@/lib/mock/customers"
import type { Customer, CustomerStatus } from "@/types/customer"

export function CustomersPage() {
  const [customers, setCustomers] = React.useState<Customer[]>(mockCustomers)
  const [statusTab, setStatusTab] = React.useState<CustomerStatus>("active")
  const [categoryFilter, setCategoryFilter] = React.useState("All")
  const [rowSize, setRowSize] = React.useState<DataTableRowSize>("md")
  const { isFullscreen, toggleFullscreen } = useDataTableFullscreen()

  const activeCount = customers.filter((item) => item.status === "active").length
  const inactiveCount = customers.filter(
    (item) => item.status === "inactive"
  ).length

  const filteredData = React.useMemo(
    () =>
      customers.filter((item) => {
        if (item.status !== statusTab) return false
        if (categoryFilter === "All") return true
        return item.category === categoryFilter
      }),
    [customers, statusTab, categoryFilter]
  )

  function setStatus(customer: Customer, status: CustomerStatus) {
    setCustomers((current) =>
      current.map((item) =>
        item.id === customer.id ? { ...item, status } : item
      )
    )
  }

  const columns = React.useMemo(
    () =>
      createCustomerColumns({
        onEdit: () => {},
        onDeactivate: (customer) => setStatus(customer, "inactive"),
        onActivate: (customer) => setStatus(customer, "active"),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [customers]
  )

  const categoryFilterOptions = React.useMemo(
    () =>
      customerCategories.map((category) => ({
        value: category,
        label: category === "All" ? "Category: All" : category,
        count:
          category === "All"
            ? customers.filter((item) => item.status === statusTab).length
            : customers.filter(
                (item) =>
                  item.status === statusTab && item.category === category
              ).length,
      })),
    [customers, statusTab]
  )

  const table = useDataTable({
    data: filteredData,
    columns,
    pageSize: 10,
    globalFilterFn: (row, _columnId, filterValue) => {
      const query = filterValue.toLowerCase()
      const item = row.original
      const branchText = groupedBranchAccessSearchText(
        [item.createdBranchId, ...(item.addedBranchIds ?? [])].filter(
          Boolean
        ) as string[]
      )

      return (
        item.id.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query) ||
        item.address.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        item.contact.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.entryBy.toLowerCase().includes(query) ||
        branchText.toLowerCase().includes(query)
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
        title="Customers"
        count={`${customers.length} customers`}
        actions={
          <>
            <Button variant="outline" color="neutral" size="32">
              <DownloadIcon />
              Export
            </Button>
            <Button variant="outline" color="neutral" size="32">
              <UploadIcon />
              Import
            </Button>
            <Button size="32">
              <PlusIcon />
              Create Customer
            </Button>
          </>
        }
      />

      <DataTableCard
        table={table}
        columnCount={columns.length}
        searchPlaceholder="Search customers..."
        rowSize={rowSize}
        onRowSizeChange={setRowSize}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        emptyMessage={`No ${statusTab} customers found.`}
        leading={
          <Tabs
            items={statusTabItems}
            value={statusTab}
            onValueChange={(status) => {
              if (typeof status !== "string") return
              setStatusTab(status as CustomerStatus)
              table.setPageIndex(0)
            }}
          />
        }
        filters={{
          value: categoryFilter,
          options: categoryFilterOptions,
          onValueChange: (value) => {
            setCategoryFilter(value)
            table.setPageIndex(0)
          },
        }}
      />
    </div>
  )
}
