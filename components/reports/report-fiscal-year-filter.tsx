"use client"

import * as React from "react"
import { CalendarRangeIcon, CheckIcon, ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type ReportFiscalYearFilterProps = {
  options: string[]
  value: string
  onChange: (next: string) => void
  className?: string
}

export function ReportFiscalYearFilter({
  options,
  value,
  onChange,
  className,
}: ReportFiscalYearFilterProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className={cn("h-8 gap-1.5 text-xs font-normal", className)}
          >
            <CalendarRangeIcon className="size-3.5" />
            <span>As of: {value}</span>
            <ChevronDownIcon className="size-3 opacity-60" />
          </Button>
        }
      />
      <PopoverContent align="start" className="w-48 min-w-48 p-1">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => {
              onChange(option)
              setOpen(false)
            }}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted"
          >
            <span className="flex-1">{option}</span>
            {value === option ? (
              <CheckIcon className="size-4 text-primary" />
            ) : null}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}
