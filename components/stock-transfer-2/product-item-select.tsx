"use client"

import * as React from "react"
import { CheckIcon, ChevronsUpDownIcon, PackageIcon } from "lucide-react"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { TransferableProduct } from "@/lib/mock/stock-transfers-2"
import { cn } from "@/lib/utils"

type ProductItemSelectProps = {
  value: string
  onChange: (product: TransferableProduct) => void
  products: TransferableProduct[]
  excludeIds?: string[]
  disabled?: boolean
  placeholder?: string
  className?: string
  "aria-invalid"?: boolean
}

export function ProductItemSelect({
  value,
  onChange,
  products,
  excludeIds = [],
  disabled,
  placeholder = "Select item…",
  className,
  "aria-invalid": ariaInvalid,
}: ProductItemSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")

  const selected = products.find((product) => product.id === value)

  const available = React.useMemo(() => {
    const excluded = new Set(excludeIds.filter((id) => id && id !== value))
    return products.filter((product) => !excluded.has(product.id))
  }, [excludeIds, products, value])

  const filtered = React.useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return available
    return available.filter(
      (product) =>
        product.name.toLowerCase().includes(needle) ||
        product.category.toLowerCase().includes(needle)
    )
  }, [available, query])

  function selectProduct(product: TransferableProduct) {
    onChange(product)
    setQuery("")
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={disabled}
        render={
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-invalid={ariaInvalid}
            disabled={disabled}
            className={cn(
              "flex h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 text-left text-sm shadow-xs outline-none transition-[color,box-shadow] select-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30",
              !selected && "text-muted-foreground",
              className
            )}
          />
        }
      >
        <span className="flex min-w-0 items-center gap-2">
          <PackageIcon className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">
            {selected ? selected.name : placeholder}
          </span>
        </span>
        <ChevronsUpDownIcon className="size-3.5 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={6} className="p-0">
        <Command shouldFilter={false}>
          <div className="border-b p-2">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search items…"
              className="flex h-8 w-full rounded-md bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
              autoFocus
            />
          </div>
          <CommandList className="max-h-64">
            <CommandEmpty>No item found.</CommandEmpty>
            <CommandGroup>
              {filtered.map((product) => (
                <CommandItem
                  key={product.id}
                  value={product.name}
                  data-checked={value === product.id ? "true" : undefined}
                  onSelect={() => selectProduct(product)}
                  className="items-start gap-2 py-2"
                >
                  <CheckIcon
                    className={cn(
                      "mt-0.5 size-3.5 shrink-0",
                      value === product.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">
                      {product.name}
                    </span>
                    <span className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span>{product.category}</span>
                      <span aria-hidden>·</span>
                      <span className="tabular-nums">
                        {product.availableQuantity} {product.unit} avail.
                      </span>
                    </span>
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
