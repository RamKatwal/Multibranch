"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  CheckIcon,
  ChevronDownIcon,
  DownloadIcon,
  FilterIcon,
  GitBranchIcon,
  PackageIcon,
  PlusIcon,
  UploadIcon,
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
import { createProductColumns } from "@/components/products/product-columns"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs } from "@/components/ui/tabs"
import { getBranchesByIds } from "@/lib/companies/options"
import {
  getActiveBranchContext,
  getBranchStockMap,
} from "@/lib/inventory/branch-stock"
import { mockProducts, productCategories } from "@/lib/mock/products"
import { cn } from "@/lib/utils"
import type { Product, ProductStatus } from "@/types/product"

type TypeFilter = "all" | "goods" | "service"

export function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = React.useState<Product[]>(mockProducts)
  const [statusTab, setStatusTab] = React.useState<ProductStatus>("active")
  const [branchFilter, setBranchFilter] = React.useState("all")
  const [typeFilter, setTypeFilter] = React.useState<TypeFilter>("all")
  const [categoryFilter, setCategoryFilter] = React.useState("All")
  const [rowSize, setRowSize] = React.useState<DataTableRowSize>("md")
  const [stockMap, setStockMap] = React.useState<Record<string, number> | null>(
    null
  )
  const { isFullscreen, toggleFullscreen } = useDataTableFullscreen()

  React.useEffect(() => {
    const { branch } = getActiveBranchContext()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStockMap(branch ? getBranchStockMap(branch.id) : null)
  }, [])

  const activeCount = products.filter((item) => item.status === "active").length
  const inactiveCount = products.filter(
    (item) => item.status === "inactive"
  ).length

  // Available unique branches for the branch multi-filter
  const availableBranches = React.useMemo(() => {
    const branchSet = new Set(
      products.map((p) => p.createdBranchId).filter(Boolean) as string[]
    )
    return getBranchesByIds(Array.from(branchSet))
  }, [products])

  // Multi-filtered data: status + branch + type + category. Quantity shown is
  // the on-hand stock for the branch the user is currently acting as.
  const filteredData = React.useMemo(
    () =>
      products
        .filter((item) => {
          if (item.status !== statusTab) return false
          if (branchFilter !== "all" && item.createdBranchId !== branchFilter)
            return false
          if (typeFilter !== "all" && item.type !== typeFilter) return false
          if (categoryFilter !== "All" && item.category !== categoryFilter)
            return false
          return true
        })
        .map((item) =>
          stockMap
            ? { ...item, totalQuantity: stockMap[item.id] ?? item.totalQuantity }
            : item
        ),
    [products, statusTab, branchFilter, typeFilter, categoryFilter, stockMap]
  )

  const isAnyFilterActive =
    branchFilter !== "all" || typeFilter !== "all" || categoryFilter !== "All"

  function handleResetFilters() {
    setBranchFilter("all")
    setTypeFilter("all")
    setCategoryFilter("All")
    table.setPageIndex(0)
  }

  function setStatus(product: Product, status: ProductStatus) {
    setProducts((current) =>
      current.map((item) =>
        item.id === product.id ? { ...item, status } : item
      )
    )
  }

  const columns = React.useMemo(
    () =>
      createProductColumns({
        onEdit: () => {},
        onDeactivate: (product) => setStatus(product, "inactive"),
        onActivate: (product) => setStatus(product, "active"),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [products]
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
        item.category.toLowerCase().includes(query) ||
        item.entryBy.toLowerCase().includes(query) ||
        String(item.totalQuantity).includes(query) ||
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
        title="Products"
        count={`${products.length} products`}
        actions={
          <>
            <Button variant="outline" size="sm">
              <DownloadIcon />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <UploadIcon />
              Import
            </Button>
            <Button size="sm">
              <PlusIcon />
              Create Product
            </Button>
          </>
        }
      />

      <DataTableCard
        table={table}
        columnCount={columns.length}
        searchPlaceholder="Search products by name, category, type..."
        rowSize={rowSize}
        onRowSizeChange={setRowSize}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        showFilter={false}
        emptyMessage={`No ${statusTab} products found.`}
        onRowClick={(product) =>
          router.push(`/inventory/products/${product.id}`)
        }
        leading={
          <div className="flex flex-wrap items-center gap-2">
            <Tabs
              items={statusTabItems}
              value={statusTab}
              onValueChange={(status) => {
                if (typeof status !== "string") return
                setStatusTab(status as ProductStatus)
                table.setPageIndex(0)
              }}
            />

            <div className="hidden h-4 w-px bg-border sm:block" />

            {/* Multi-Filter: Branch */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
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
                }
              />
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
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-8 gap-1.5 text-xs font-normal",
                      typeFilter !== "all" &&
                        "border-primary bg-primary/5 font-medium text-primary"
                    )}
                  >
                    <PackageIcon className="size-3.5" />
                    <span>
                      {typeFilter === "all"
                        ? "Type: All"
                        : typeFilter === "goods"
                          ? "Type: Goods"
                          : "Type: Service"}
                    </span>
                    <ChevronDownIcon className="size-3 opacity-60" />
                  </Button>
                }
              />
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
                    setTypeFilter("goods")
                    table.setPageIndex(0)
                  }}
                  className="cursor-pointer text-xs"
                >
                  <span>Goods</span>
                  {typeFilter === "goods" ? (
                    <CheckIcon className="ml-auto size-4 text-primary" />
                  ) : null}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setTypeFilter("service")
                    table.setPageIndex(0)
                  }}
                  className="cursor-pointer text-xs"
                >
                  <span>Service</span>
                  {typeFilter === "service" ? (
                    <CheckIcon className="ml-auto size-4 text-primary" />
                  ) : null}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Multi-Filter: Category */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
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
                }
              />
              <DropdownMenuContent
                align="start"
                className="thin-scrollbar max-h-60 min-w-48 overflow-y-auto"
              >
                {productCategories.map((cat) => (
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
                size="sm"
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
    </div>
  )
}
