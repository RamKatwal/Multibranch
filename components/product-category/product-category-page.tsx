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
import { createProductCategoryColumns } from "@/components/product-category/product-category-columns"
import {
  ProductCategoryFormDialog,
  type ProductCategoryFormValues,
} from "@/components/product-category/product-category-form-dialog"
import { Button } from "@/components/ui/button"
import { Tabs } from "@/components/ui/tabs"
import { mockProductCategories } from "@/lib/mock/product-categories"
import {
  createProductCategoryId,
  readProductCategories,
  saveProductCategories,
} from "@/lib/product-categories/storage"
import type {
  ProductCategory,
  ProductCategoryStatus,
} from "@/types/product-category"

export function ProductCategoryPage() {
  const [categories, setCategories] = React.useState<ProductCategory[]>(
    mockProductCategories
  )
  const [statusTab, setStatusTab] =
    React.useState<ProductCategoryStatus>("active")
  const [rowSize, setRowSize] = React.useState<DataTableRowSize>("md")
  const { isFullscreen, toggleFullscreen } = useDataTableFullscreen()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [dialogMode, setDialogMode] = React.useState<"create" | "edit">(
    "create"
  )
  const [editingCategory, setEditingCategory] =
    React.useState<ProductCategory | null>(null)

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCategories(readProductCategories())
  }, [])

  const persist = React.useCallback((next: ProductCategory[]) => {
    setCategories(saveProductCategories(next))
  }, [])

  const activeCount = categories.filter((item) => item.status === "active")
    .length
  const inactiveCount = categories.filter((item) => item.status === "inactive")
    .length

  const filteredData = React.useMemo(
    () => categories.filter((item) => item.status === statusTab),
    [categories, statusTab]
  )

  const parentOptions = React.useMemo(
    () =>
      categories.filter(
        (item) =>
          !item.isSubCategory &&
          item.status === "active" &&
          item.id !== editingCategory?.id
      ),
    [categories, editingCategory?.id]
  )

  function openCreate() {
    setDialogMode("create")
    setEditingCategory(null)
    setDialogOpen(true)
  }

  function openEdit(category: ProductCategory) {
    setDialogMode("edit")
    setEditingCategory(category)
    setDialogOpen(true)
  }

  function handleFormSubmit(values: ProductCategoryFormValues) {
    const parent = values.isSubCategory
      ? categories.find((item) => item.id === values.parentId)
      : null

    if (dialogMode === "create") {
      const nextCategory: ProductCategory = {
        id: createProductCategoryId(categories),
        name: values.name.trim(),
        isSubCategory: values.isSubCategory,
        parentId: parent?.id ?? null,
        parentName: parent?.name ?? null,
        entryBy: "ram",
        status: "active",
      }
      persist([nextCategory, ...categories])
      toast.success(`Category "${nextCategory.name}" created.`)
      return
    }

    if (!editingCategory) return

    persist(
      categories.map((item) => {
        if (item.id === editingCategory.id) {
          return {
            ...item,
            name: values.name.trim(),
            parentId: item.isSubCategory ? (parent?.id ?? null) : null,
            parentName: item.isSubCategory ? (parent?.name ?? null) : null,
          }
        }

        if (item.parentId === editingCategory.id) {
          return { ...item, parentName: values.name.trim() }
        }

        return item
      })
    )
    toast.success(`Category "${values.name.trim()}" updated.`)
  }

  function setStatus(category: ProductCategory, status: ProductCategoryStatus) {
    persist(
      categories.map((item) =>
        item.id === category.id ? { ...item, status } : item
      )
    )
  }

  function handleDelete(category: ProductCategory) {
    const hasChildren = categories.some((item) => item.parentId === category.id)
    if (hasChildren) {
      toast.error("Remove or reassign sub-categories before deleting.")
      return
    }
    persist(categories.filter((item) => item.id !== category.id))
    toast.success(`Category "${category.name}" deleted.`)
  }

  const columns = React.useMemo(
    () =>
      createProductCategoryColumns({
        onEdit: openEdit,
        onDeactivate: (category) => setStatus(category, "inactive"),
        onActivate: (category) => setStatus(category, "active"),
        onDelete: handleDelete,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categories]
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
        item.name.toLowerCase().includes(query) ||
        (item.parentName ?? "").toLowerCase().includes(query) ||
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
        title="Product Category"
        count={`${categories.length} categories`}
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
              Create Category
            </Button>
          </>
        }
      />

      <DataTableCard
        table={table}
        columnCount={columns.length}
        searchPlaceholder="Search categories..."
        rowSize={rowSize}
        onRowSizeChange={setRowSize}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        showFilter={false}
        emptyMessage={`No ${statusTab} categories found.`}
        onRowClick={openEdit}
        leading={
          <Tabs
            items={statusTabItems}
            value={statusTab}
            onValueChange={(status) => {
              if (typeof status !== "string") return
              setStatusTab(status as ProductCategoryStatus)
              table.setPageIndex(0)
            }}
          />
        }
      />

      <ProductCategoryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        category={editingCategory}
        parentOptions={parentOptions}
        onSubmit={handleFormSubmit}
      />
    </div>
  )
}
