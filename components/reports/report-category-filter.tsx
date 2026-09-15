"use client"

import * as React from "react"
import { ChevronDownIcon, TagIcon } from "lucide-react"

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

type ReportCategoryFilterProps = {
  options: string[]
  /** `"all"` or a single selected category. */
  value: string | "all"
  onChange: (next: string | "all") => void
  className?: string
}

export function ReportCategoryFilter({
  options,
  value,
  onChange,
  className,
}: ReportCategoryFilterProps) {
  const [open, setOpen] = React.useState(false)
  const isActive = value !== "all"

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
            <TagIcon className="size-3.5" />
            <span className="max-w-[160px] truncate">
              Category: {isActive ? value : "All"}
            </span>
            <ChevronDownIcon className="size-3 opacity-60" />
          </Button>
        }
      />
      <PopoverContent align="start" className="w-56 min-w-56 p-0">
        <Command shouldFilter>
          <CommandList className="thin-scrollbar max-h-64">
            <CommandEmpty>No categories found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="All categories"
                data-checked={value === "all" ? "true" : undefined}
                onSelect={() => {
                  onChange("all")
                  setOpen(false)
                }}
              >
                <span className="flex-1">All categories</span>
              </CommandItem>
              {options.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  data-checked={value === option ? "true" : undefined}
                  onSelect={() => {
                    onChange(option)
                    setOpen(false)
                  }}
                >
                  <span className="min-w-0 flex-1 truncate">{option}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
