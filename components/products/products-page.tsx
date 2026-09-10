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
import { isHeadOfficeBranch } from "@/lib/branches/head-office"
import { readBranches } from "@/lib/branches/storage"
import {
  getActiveBranchContext,
  getBranchStockMap,
} from "@/lib/inventory/branch-stock"
import { mockProducts, productCategories } from "@/lib/mock/products"
import { cn } from "@/lib/utils"
import type { Branch } from "@/types/branch"
import {
  productBelongsToBranch,
  type Product,
  type ProductStatus,
} from "@/types/product"

type TypeFilter = "all" | "goods" | "service"

/** Map seed branch ids onto the live Head Office / branch list. */
function alignProductsToLiveBranches(
  products: Product[],
  branches: Branch[]
): Product[] {
  if (branches.length === 0) return products

  const headOffice =
    branches.find((branch) => isHeadOfficeBranch(branch)) ?? branches[0]
  const secondary =
    branches.find((branch) => branch.id !== headOffice.id) ?? headOffice

  const remap = (id: string | undefined, fallbackIndex: number) => {
    if (!id) {
      return fallbackIndex % 2 === 0 ? headOffice.id : secondary.id
    }
    if (id === "br-hq" || id === headOffice.id) return headOffice.id
    if (id === "br-ktm-hub" || id === secondary.id) return secondary.id
    if (branches.some((branch) => branch.id === id)) return id
    return fallbackIndex % 2 === 0 ? headOffice.id : secondary.id
  }

  return products.map((product, index) => {
    const createdBranchId = remap(product.createdBranchId, index)
    const added = (product.addedBranchIds ?? []).map((id, addedIndex) =>
      remap(id, index + addedIndex)
    )
    return {
      ...product,
      createdBranchId,
      addedBranchIds: [...new Set(added.length > 0 ? added : [createdBranchId])],
    }
  })
}

export function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = React.useState<Product[]>(mockProducts)
  const [statusTab, setStatusTab] = React.useState<ProductStatus>("active")
  const [branchFilter, setBranchFilter] = React.useState("all")
  const [isHeadOffice, setIsHeadOffice] = React.useState(true)
  const [activeBranchId, setActiveBranchId] = React.useState<string | null>(null)
  const [liveBranches, setLiveBranches] = React.useState<Branch[]>([])
  const [typeFilter, setTypeFilter] = React.useState<TypeFilter>("all")
  const [categoryFilter, setCategoryFilter] = React.useState("All")
  const [rowSize, setRowSize] = React.useState<DataTableRowSize>("md")
  const [stockMap, setStockMap] = React.useState<Record<string, number> | null>(
    null
  )
  const { isFullscreen, toggleFullscreen } = useDataTableFullscreen()

  React.useEffect(() => {
    const { branch, isHeadOffice: ho } = getActiveBranchContext()
    const branches = readBranches().filter((item) => item.status === "active")
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLiveBranches(branches)
    setIsHeadOffice(ho)
    setActiveBranchId(branch?.id ?? null)
    setStockMap(branch ? getBranchStockMap(branch.id) : null)
    setProducts(alignProductsToLiveBranches(mockProducts, branches))
    // Head Office defaults to All; a branch defaults to that branch.
    setBranchFilter(ho ? "all" : (branch?.id ?? "all"))
  }, [])

  const scopedProducts = React.useMemo(() => {
    if (branchFilter === "all") return products
    return products.filter((item) => productBelongsToBranch(item, branchFilter))
  }, [products, branchFilter])

  const activeCount = scopedProducts.filter((item) => item.status === "active").length
  const inactiveCount = scopedProducts.filter(
    (item) => item.status === "inactive"
  ).length

  // Head Office: All + every live branch. A branch: All + that branch only.
  const filterBranches = React.useMemo(() => {
    if (isHeadOffice) return liveBranches
    return liveBranches.filter((branch) => branch.id === activeBranchId)
  }, [isHeadOffice, liveBranches, activeBranchId])

  // Multi-filtered data: status + branch + type + category. Quantity shown is
  // the on-hand stock for the branch the user is currently acting as.
  const filteredData = React.useMemo(
    () =>
      scopedProducts
        .filter((item) => {
          if (item.status !== statusTab) return false
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
    [scopedProducts, statusTab, typeFilter, categoryFilter, stockMap]
  )

  // Head Office reset/default is All; branch reset/default is that branch.
  const defaultBranchFilter = isHeadOffice ? "all" : (activeBranchId ?? "all")
  const isAnyFilterActive =
    branchFilter !== defaultBranchFilter ||
    typeFilter !== "all" ||
    categoryFilter !== "All"

  function handleResetFilters() {
    setBranchFilter(defaultBranchFilter)
    setTypeFilter("all")
    setCategoryFilter("All")
    table.setPageIndex(0)
  }

  const columns = React.useMemo(() => createProductColumns(), [])

  const table = useDataTable({
    data: filteredData,
    columns,
    pageSize: 50,
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
        count={`${scopedProducts.length} products`}
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

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-8 gap-1.5 text-xs font-normal",
                      branchFilter !== defaultBranchFilter &&
                        "border-primary bg-primary/5 font-medium text-primary"
                    )}
                  >
                    <GitBranchIcon className="size-3.5" />
                    <span className="max-w-[120px] truncate">
                      {branchFilter === "all"
                        ? "Branch: All"
                        : liveBranches.find((b) => b.id === branchFilter)
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
                {filterBranches.map((b) => (
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
