"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const periods = ["Current month", "Last month", "Current year", "Last year"] as const

type PeriodSelectProps = {
  value?: string
  onChange?: (value: string) => void
}

export function PeriodSelect({
  value = "Current month",
  onChange,
}: PeriodSelectProps) {
  const [current, setCurrent] = React.useState(value)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          color="neutral"
          size="32"
          className="h-7 gap-1 px-2.5 text-xs font-normal"
        >
          {current}
          <ChevronDown className="size-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-36">
        {periods.map((period) => (
          <DropdownMenuItem
            key={period}
            onClick={() => {
              setCurrent(period)
              onChange?.(period)
            }}
          >
            {period}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
