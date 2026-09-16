"use client"

import * as React from "react"
import { ChevronDownIcon, TruckIcon } from "lucide-react"

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
import { cn } from "@/lib/utils"

type ReportSupplierFilterProps = {
  options: { id: string; name: string }[]
  /** `"all"` or a single selected supplier id. */
  value: string | "all"
  onChange: (next: string | "all") => void
  className?: string
}

export function ReportSupplierFilter({
  options,
  value,
  onChange,
  className,
}: ReportSupplierFilterProps) {
  const [open, setOpen] = React.useState(false)
  const isActive = value !== "all"
  const label = options.find((option) => option.id === value)?.name ?? "All"

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
            <TruckIcon className="size-3.5" />
            <span className="max-w-[160px] truncate">Supplier: {label}</span>
            <ChevronDownIcon className="size-3 opacity-60" />
          </Button>
        }
      />
      <PopoverContent align="start" className="w-64 min-w-64 p-0">
        <Command shouldFilter>
          <CommandList className="thin-scrollbar max-h-64">
            <CommandEmpty>No suppliers found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="All suppliers"
                data-checked={value === "all" ? "true" : undefined}
                onSelect={() => {
                  onChange("all")
                  setOpen(false)
                }}
              >
                <span className="flex-1">All suppliers</span>
              </CommandItem>
              {options.map((option) => (
                <CommandItem
                  key={option.id}
                  value={option.name}
                  data-checked={value === option.id ? "true" : undefined}
                  onSelect={() => {
                    onChange(option.id)
                    setOpen(false)
                  }}
                >
                  <span className="min-w-0 flex-1 truncate">{option.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
