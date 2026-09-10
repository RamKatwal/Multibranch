"use client"

import * as React from "react"
import { SearchIcon } from "lucide-react"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { TransferableProduct } from "@/lib/mock/stock-transfers"
import { cn } from "@/lib/utils"

type ProductItemSelectProps = {
  value: string
  onChange: (product: TransferableProduct) => void
  products: TransferableProduct[]
  excludeIds?: string[]
  disabled?: boolean
  placeholder?: string
  emptyMessage?: string
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
  emptyMessage = "No item found.",
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

  function handleOpenChange(next: boolean, eventDetails?: { reason?: string }) {
    if (!next && eventDetails?.reason === "trigger-press") return
    setOpen(next)
    if (!next) setQuery("")
  }

  function selectProduct(product: TransferableProduct) {
    onChange(product)
    setQuery("")
    setOpen(false)
  }

  return (
    <div className={cn("relative w-full", className)}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger
          nativeButton={false}
          disabled={disabled}
          render={
            <Input
              role="combobox"
              aria-expanded={open}
              aria-autocomplete="list"
              aria-invalid={ariaInvalid}
              disabled={disabled}
              autoComplete="off"
              placeholder={open ? "Search items…" : placeholder}
              className="cursor-pointer pr-9"
              value={open ? query : (selected?.name ?? "")}
              onChange={(event) => {
                setQuery(event.target.value)
                if (!open) setOpen(true)
              }}
            />
          }
        />
        <PopoverContent
          align="start"
          sideOffset={6}
          initialFocus={false}
          className="w-(--anchor-width) min-w-72 p-0"
        >
          <Command shouldFilter={false}>
            <CommandList className="max-h-64">
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {filtered.map((product) => (
                  <CommandItem
                    key={product.id}
                    value={product.name}
                    data-checked={value === product.id ? "true" : undefined}
                    onSelect={() => selectProduct(product)}
                  >
                    <span className="min-w-0 flex-1 truncate">{product.name}</span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">
                      {product.availableQuantity} {product.unit}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <SearchIcon className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground opacity-50" />
    </div>
  )
}
