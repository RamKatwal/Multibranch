"use client"

import * as React from "react"
import { ChevronDownIcon, CircleDotIcon } from "lucide-react"

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

type ReportStatusFilterProps = {
  options: { value: string; label: string }[]
  /** `"all"` or a single selected status value. */
  value: string | "all"
  onChange: (next: string | "all") => void
  className?: string
}

export function ReportStatusFilter({
  options,
  value,
  onChange,
  className,
}: ReportStatusFilterProps) {
  const [open, setOpen] = React.useState(false)
  const isActive = value !== "all"
  const label = options.find((option) => option.value === value)?.label ?? "All"

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
            <CircleDotIcon className="size-3.5" />
            <span className="max-w-[160px] truncate">Status: {label}</span>
            <ChevronDownIcon className="size-3 opacity-60" />
          </Button>
        }
      />
      <PopoverContent align="start" className="w-56 min-w-56 p-0">
        <Command shouldFilter>
          <CommandList className="thin-scrollbar max-h-64">
            <CommandEmpty>No statuses found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="All statuses"
                data-checked={value === "all" ? "true" : undefined}
                onSelect={() => {
                  onChange("all")
                  setOpen(false)
                }}
              >
                <span className="flex-1">All statuses</span>
              </CommandItem>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  data-checked={value === option.value ? "true" : undefined}
                  onSelect={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                >
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
