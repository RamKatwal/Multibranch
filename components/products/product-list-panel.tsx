"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CheckIcon,
  ChevronDownIcon,
  MoreHorizontalIcon,
  PlusIcon,
  SearchIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  getProductDetailById,
  mockProducts,
} from "@/lib/mock/products"
import { cn } from "@/lib/utils"
import {
  productStatusLabels,
  type Product,
  type ProductStatus,
} from "@/types/product"

type ListFilter = "all" | ProductStatus

const listFilterLabels: Record<ListFilter, string> = {
  all: "All Products",
  active: "Active Products",
  inactive: "Inactive Products",
}

function formatRs(value: number) {
  return `Rs ${value.toLocaleString("en-IN")}`
}

function getSellingPrice(product: Product) {
  return getProductDetailById(product.id)?.sellingPrice ?? 0
}

type ProductListPanelProps = {
  selectedId: string
  className?: string
}

export function ProductListPanel({
  selectedId,
  className,
}: ProductListPanelProps) {
  const router = useRouter()
  const [listFilter, setListFilter] = React.useState<ListFilter>("all")
  const [query, setQuery] = React.useState("")
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const selectedRowRef = React.useRef<HTMLAnchorElement | null>(null)

  const filteredProducts = React.useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return mockProducts.filter((product) => {
      if (listFilter !== "all" && product.status !== listFilter) return false
      if (!normalized) return true
      return (
        product.name.toLowerCase().includes(normalized) ||
        product.id.toLowerCase().includes(normalized) ||
        product.category.toLowerCase().includes(normalized)
      )
    })
  }, [listFilter, query])

  React.useEffect(() => {
    selectedRowRef.current?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    })
  }, [selectedId])

  function toggleSelected(id: string, checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  return (
    <aside
      className={cn(
        "sticky top-14 flex h-[calc(100svh-3.5rem)] w-72 shrink-0 flex-col overflow-hidden border-r bg-card lg:w-80",
        className
      )}
    >
      <div className="flex shrink-0 flex-col gap-2 border-b px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 min-w-0 flex-1 justify-start gap-1 px-2 font-semibold"
                />
              }
            >
              <span className="truncate">{listFilterLabels[listFilter]}</span>
              <ChevronDownIcon className="size-3.5 shrink-0 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-48">
              {(Object.keys(listFilterLabels) as ListFilter[]).map((key) => (
                <DropdownMenuItem
                  key={key}
                  className="cursor-pointer text-xs"
                  onClick={() => setListFilter(key)}
                >
                  <span>{listFilterLabels[key]}</span>
                  {listFilter === key ? (
                    <CheckIcon className="ml-auto size-4 text-primary" />
                  ) : null}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            size="icon-sm"
            className="size-8 shrink-0"
            aria-label="Create product"
            onClick={() => toast.info("Product creation is coming soon.")}
          >
            <PlusIcon />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  size="icon-sm"
                  variant="outline"
                  className="size-8 shrink-0"
                  aria-label="More list actions"
                />
              }
            >
              <MoreHorizontalIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-44">
              <DropdownMenuItem
                className="cursor-pointer text-xs"
                onClick={() =>
                  toast.info(
                    selectedIds.size
                      ? `Bulk actions for ${selectedIds.size} products coming soon.`
                      : "Select products to run bulk actions."
                  )
                }
              >
                Bulk actions
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-xs"
                onClick={() => router.push("/inventory/products")}
              >
                Open full list
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products…"
            className="h-8 bg-background pl-8 text-xs"
            aria-label="Search products"
          />
        </div>
      </div>

      <div className="thin-scrollbar min-h-0 flex-1 overflow-y-auto">
        {filteredProducts.length ? (
          <ul className="divide-y divide-border/80" role="listbox" aria-label="Products">
            {filteredProducts.map((product) => {
              const isActive = product.id === selectedId
              const isChecked = selectedIds.has(product.id)
              const price = getSellingPrice(product)

              return (
                <li key={product.id} className="relative">
                  <div
                    className={cn(
                      "group flex items-stretch gap-2 border-l-2 border-transparent pr-3 transition-colors",
                      isActive
                        ? "border-l-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center py-2.5 pl-3">
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(checked) =>
                          toggleSelected(product.id, checked)
                        }
                        aria-label={`Select ${product.name}`}
                        onClick={(event) => event.stopPropagation()}
                      />
                    </div>

                    <Link
                      ref={isActive ? selectedRowRef : undefined}
                      href={`/inventory/products/${product.id}`}
                      role="option"
                      aria-selected={isActive}
                      onClick={(event: React.MouseEvent<HTMLAnchorElement>) => {
                        if (
                          event.metaKey ||
                          event.ctrlKey ||
                          event.shiftKey ||
                          event.altKey
                        ) {
                          return
                        }
                        event.preventDefault()
                        if (product.id !== selectedId) {
                          router.push(`/inventory/products/${product.id}`)
                        }
                      }}
                      className="flex min-w-0 flex-1 items-start justify-between gap-2 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-inset"
                    >
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "truncate text-xs leading-snug",
                            isActive
                              ? "font-semibold text-foreground"
                              : "font-medium text-foreground"
                          )}
                          title={product.name}
                        >
                          {product.name}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                          {product.id}
                          <span className="mx-1 text-border">·</span>
                          {productStatusLabels[product.status]}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 pt-0.5 text-right text-[11px] tabular-nums",
                          isActive
                            ? "font-semibold text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {formatRs(price)}
                      </span>
                    </Link>
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="px-4 py-10 text-center text-xs text-muted-foreground">
            No products match this filter.
          </div>
        )}
      </div>

      <div className="shrink-0 border-t px-3 py-2 text-[11px] tabular-nums text-muted-foreground">
        {filteredProducts.length} of {mockProducts.length} products
      </div>
    </aside>
  )
}
