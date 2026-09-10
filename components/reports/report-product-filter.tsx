"use client"

import * as React from "react"
import { ChevronDownIcon, PackageIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
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
import type { InventoryValuationProduct } from "@/lib/reports/inventory-valuation"
import { cn } from "@/lib/utils"

type ReportProductFilterProps = {
  options: InventoryValuationProduct[]
  /** `"all"` or an explicit list of selected product ids. */
  value: string[] | "all"
  onChange: (next: string[] | "all") => void
  className?: string
}

export function ReportProductFilter({
  options,
  value,
  onChange,
  className,
}: ReportProductFilterProps) {
  const [open, setOpen] = React.useState(false)

  const selectedIds = value === "all" ? [] : value
  const isActive = value !== "all" && selectedIds.length > 0

  const label =
    value === "all" || selectedIds.length === 0
      ? "Products: All"
      : selectedIds.length === 1
        ? `Products: ${
            options.find((option) => option.id === selectedIds[0])?.name ??
            "1 selected"
          }`
        : `Products: ${selectedIds.length} selected`

  function toggle(id: string) {
    const current = value === "all" ? [] : value
    const next = current.includes(id)
      ? current.filter((entry) => entry !== id)
      : [...current, id]
    onChange(next.length === 0 ? "all" : next)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-8 gap-1.5 text-xs font-normal",
              isActive && "border-primary bg-primary/5 font-medium text-primary",
              className
            )}
          >
            <PackageIcon className="size-3.5" />
            <span className="max-w-[160px] truncate">{label}</span>
            <ChevronDownIcon className="size-3 opacity-60" />
          </Button>
        }
      />
      <PopoverContent align="start" className="w-64 min-w-64 p-0">
        <Command shouldFilter>
          <CommandList className="thin-scrollbar max-h-64">
            <CommandEmpty>No products found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="All products"
                data-checked={value === "all" ? "true" : undefined}
                onSelect={() => {
                  onChange("all")
                  setOpen(false)
                }}
              >
                <span className="flex-1">All products</span>
              </CommandItem>
              {options.map((option) => {
                const checked = selectedIds.includes(option.id)
                return (
                  <CommandItem
                    key={option.id}
                    value={option.name}
                    data-checked={checked ? "true" : undefined}
                    onSelect={() => toggle(option.id)}
                  >
                    <span className="min-w-0 flex-1 truncate">
                      {option.name}
                    </span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
