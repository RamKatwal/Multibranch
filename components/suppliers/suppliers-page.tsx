"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Building2Icon,
  CheckIcon,
  ChevronDownIcon,
  DownloadIcon,
  FilterIcon,
  GitBranchIcon,
  PlusIcon,
  SearchIcon,
  UploadIcon,
  UserIcon,
  XIcon,
} from "lucide-react"

import {
  type DataTableRowSize,
  DataTableCard,
  useDataTable,
  useDataTableFullscreen,
} from "@/components/data-table/data-table"
import { PageHeader } from "@/components/layout/page-header"
import { groupedBranchAccessSearchText } from "@/components/settings/users-permissions/grouped-branch-chips"
import { CreateSupplierDialog } from "@/components/suppliers/create-supplier-dialog"
import { SearchAddSupplierDialog } from "@/components/suppliers/search-add-supplier-dialog"
import { createSupplierColumns } from "@/components/suppliers/supplier-columns"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs } from "@/components/ui/tabs"
import { useIsMac } from "@/hooks/use-is-mac"
import { readActiveBranchId } from "@/lib/branches/storage"
import { getBranchesByIds } from "@/lib/companies/options"
import { mockSuppliers, supplierCategories } from "@/lib/mock/suppliers"
import { cn } from "@/lib/utils"
import type { Supplier, SupplierStatus } from "@/types/supplier"

const CREATE_QUERY = "create"

function displayShortcut(shortcut: string, isMac: boolean) {
  if (!isMac) return shortcut
  return shortcut.replace(/^Alt\+/i, "⌥")
}

export function SuppliersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isMac = useIsMac()
  const [suppliers, setSuppliers] = React.useState<Supplier[]>(mockSuppliers)
  const [statusTab, setStatusTab] = React.useState<SupplierStatus>("active")
  const [branchFilter, setBranchFilter] = React.useState("all")
  const [typeFilter, setTypeFilter] = React.useState("all")
  const [categoryFilter, setCategoryFilter] = React.useState("All")
  const [rowSize, setRowSize] = React.useState<DataTableRowSize>("md")
  const [currentBranchId, setCurrentBranchId] = React.useState<string>("br_ht_01")
  const [searchAddDialogOpen, setSearchAddDialogOpen] = React.useState(false)
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const { isFullscreen, toggleFullscreen } = useDataTableFullscreen()

  React.useEffect(() => {
    const stored = readActiveBranchId()
    if (stored) {
      setCurrentBranchId(stored)
    }
  }, [])

  React.useEffect(() => {
    if (searchParams.get(CREATE_QUERY) !== "1") return

    setCreateDialogOpen(true)
    const params = new URLSearchParams(searchParams.toString())
    params.delete(CREATE_QUERY)
    const next = params.toString()
    router.replace(next ? `/purchase/suppliers?${next}` : "/purchase/suppliers")
  }, [router, searchParams])

  const activeCount = suppliers.filter((item) => item.status === "active").length
  const inactiveCount = suppliers.filter(
    (item) => item.status === "inactive"
  ).length

  // Available unique branches for the branch multi-filter
  const availableBranches = React.useMemo(() => {
    const branchSet = new Set(
      suppliers.map((s) => s.createdBranchId).filter(Boolean) as string[]
    )
    return getBranchesByIds(Array.from(branchSet))
  }, [suppliers])

  // Multi-filtered data: status + branch + type + category
  const filteredData = React.useMemo(
    () =>
      suppliers.filter((item) => {
        if (item.status !== statusTab) return false
        if (branchFilter !== "all" && item.createdBranchId !== branchFilter)
          return false
        if (typeFilter !== "all" && item.type !== typeFilter) return false
        if (categoryFilter !== "All" && item.category !== categoryFilter)
          return false
        return true
      }),
    [suppliers, statusTab, branchFilter, typeFilter, categoryFilter]
  )

  const isAnyFilterActive =
    branchFilter !== "all" || typeFilter !== "all" || categoryFilter !== "All"

  function handleResetFilters() {
    setBranchFilter("all")
    setTypeFilter("all")
    setCategoryFilter("All")
    table.setPageIndex(0)
  }

  function setStatus(supplier: Supplier, status: SupplierStatus) {
    setSuppliers((current) =>
      current.map((item) =>
        item.id === supplier.id ? { ...item, status } : item
      )
    )
  }

  function handleAddSupplierToBranch(supplierId: string, branchId: string) {
    setSuppliers((current) =>
      current.map((s) => {
        if (s.id === supplierId) {
          const existing = s.addedBranchIds ?? []
          if (!existing.includes(branchId)) {
            return {
              ...s,
              addedBranchIds: [...existing, branchId],
            }
          }
        }
        return s
      })
    )
  }

  function handleCreateSupplier(newSupplier: Supplier) {
    setSuppliers((current) => [newSupplier, ...current])
  }

  const columns = React.useMemo(
    () =>
      createSupplierColumns({
        onEdit: () => {},
        onDeactivate: (supplier) => setStatus(supplier, "inactive"),
        onActivate: (supplier) => setStatus(supplier, "active"),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [suppliers]
  )

  const table = useDataTable({
    data: filteredData,
    columns,
    pageSize: 10,
    globalFilterFn: (row, _columnId, filterValue) => {
      const query = filterValue.toLowerCase()
      const item = row.original
      const pan = (item.panNumber ?? "").toLowerCase()
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
        pan.includes(query) ||
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
        title="Suppliers"
        count={`${suppliers.length} suppliers`}
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

            {/* Create Supplier Dropdown Options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="32" className="gap-1.5">
                  <PlusIcon className="size-4" />
                  Create Supplier
                  <ChevronDownIcon className="size-3.5 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 p-1">
                <DropdownMenuItem
                  onClick={() => setCreateDialogOpen(true)}
                  className="cursor-pointer gap-2 py-1.5 text-xs font-medium"
                >
                  <PlusIcon className="size-4 text-primary" />
                  <span className="flex-1">Add New</span>
                  <kbd className="pointer-events-none rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
                    {displayShortcut("Alt+V", isMac)}
                  </kbd>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setSearchAddDialogOpen(true)}
                  className="cursor-pointer gap-2 py-1.5 text-xs font-medium"
                >
                  <SearchIcon className="size-4 text-muted-foreground" />
                  <span>Search and Add</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />

      <DataTableCard
        table={table}
        columnCount={columns.length}
        searchPlaceholder="Search suppliers by name, PAN, address..."
        rowSize={rowSize}
        onRowSizeChange={setRowSize}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        showFilter={false}
        emptyMessage={`No ${statusTab} suppliers found.`}
        leading={
          <div className="flex flex-wrap items-center gap-2">
            <Tabs
              items={statusTabItems}
              value={statusTab}
              onValueChange={(status) => {
                if (typeof status !== "string") return
                setStatusTab(status as SupplierStatus)
                table.setPageIndex(0)
              }}
            />

            <div className="hidden h-4 w-px bg-border sm:block" />

            {/* Multi-Filter: Branch */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  color="neutral"
                  size="32"
                  className={cn(
                    "h-8 gap-1.5 text-xs font-normal",
                    branchFilter !== "all" &&
                      "border-primary bg-primary/5 font-medium text-primary"
                  )}
                >
                  <GitBranchIcon className="size-3.5" />
                  <span className="max-w-[120px] truncate">
                    {branchFilter === "all"
                      ? "Branch: All"
                      : availableBranches.find((b) => b.id === branchFilter)
                          ?.name ?? "Branch"}
                  </span>
                  <ChevronDownIcon className="size-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="thin-scrollbar max-h-60 min-w-48 overflow-y-auto"
              >
                <DropdownMenuItem
                  onClick={() => {
                    setBranchFilter("all")
                    table.setPageIndex(0)
                  }}
                  className="cursor-pointer text-xs"
                >
                  <span>All Branches</span>
                  {branchFilter === "all" ? (
                    <CheckIcon className="ml-auto size-4 text-primary" />
                  ) : null}
                </DropdownMenuItem>
                {availableBranches.map((b) => (
                  <DropdownMenuItem
                    key={b.id}
                    onClick={() => {
                      setBranchFilter(b.id)
                      table.setPageIndex(0)
                    }}
                    className="cursor-pointer text-xs"
                  >
                    <span>{b.name}</span>
                    {branchFilter === b.id ? (
                      <CheckIcon className="ml-auto size-4 text-primary" />
                    ) : null}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Multi-Filter: Type */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  color="neutral"
                  size="32"
                  className={cn(
                    "h-8 gap-1.5 text-xs font-normal",
                    typeFilter !== "all" &&
                      "border-primary bg-primary/5 font-medium text-primary"
                  )}
                >
                  <UserIcon className="size-3.5" />
                  <span>
                    {typeFilter === "all"
                      ? "Type: All"
                      : typeFilter === "company"
                        ? "Type: Company"
                        : "Type: Individual"}
                  </span>
                  <ChevronDownIcon className="size-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-36">
                <DropdownMenuItem
                  onClick={() => {
                    setTypeFilter("all")
                    table.setPageIndex(0)
                  }}
                  className="cursor-pointer text-xs"
                >
                  <span>All Types</span>
                  {typeFilter === "all" ? (
                    <CheckIcon className="ml-auto size-4 text-primary" />
                  ) : null}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setTypeFilter("company")
                    table.setPageIndex(0)
                  }}
                  className="cursor-pointer text-xs"
                >
                  <span>Company</span>
                  {typeFilter === "company" ? (
                    <CheckIcon className="ml-auto size-4 text-primary" />
                  ) : null}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setTypeFilter("individual")
                    table.setPageIndex(0)
                  }}
                  className="cursor-pointer text-xs"
                >
                  <span>Individual</span>
                  {typeFilter === "individual" ? (
                    <CheckIcon className="ml-auto size-4 text-primary" />
                  ) : null}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Multi-Filter: Category */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  color="neutral"
                  size="32"
                  className={cn(
                    "h-8 gap-1.5 text-xs font-normal",
                    categoryFilter !== "All" &&
                      "border-primary bg-primary/5 font-medium text-primary"
                  )}
                >
                  <FilterIcon className="size-3.5" />
                  <span className="max-w-[130px] truncate">
                    {categoryFilter === "All"
                      ? "Category: All"
                      : categoryFilter}
                  </span>
                  <ChevronDownIcon className="size-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="thin-scrollbar max-h-60 min-w-48 overflow-y-auto"
              >
                {supplierCategories.map((cat) => (
                  <DropdownMenuItem
                    key={cat}
                    onClick={() => {
                      setCategoryFilter(cat)
                      table.setPageIndex(0)
                    }}
                    className="cursor-pointer text-xs"
                  >
                    <span>{cat === "All" ? "All Categories" : cat}</span>
                    {categoryFilter === cat ? (
                      <CheckIcon className="ml-auto size-4 text-primary" />
                    ) : null}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Reset Filter Button */}
            {isAnyFilterActive ? (
              <Button
                variant="ghost"
                color="neutral"
                size="32"
                className="h-8 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={handleResetFilters}
              >
                <XIcon className="size-3.5" />
                Reset
              </Button>
            ) : null}
          </div>
        }
      />

      {/* Search & Add Supplier Dialog */}
      <SearchAddSupplierDialog
        open={searchAddDialogOpen}
        onOpenChange={setSearchAddDialogOpen}
        currentBranchId={currentBranchId}
        allSuppliers={suppliers}
        onAddSupplierToBranch={handleAddSupplierToBranch}
      />

      {/* Create Supplier Dialog */}
      <CreateSupplierDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        currentBranchId={currentBranchId}
        onCreateSupplier={handleCreateSupplier}
      />
    </div>
  )
}
