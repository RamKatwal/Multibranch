"use client"

import * as React from "react"
import { CalendarIcon, CheckIcon, ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { todayIsoDate } from "@/lib/branches/storage"
import { cn } from "@/lib/utils"
import {
  REPORT_AS_OF_PRESETS,
  reportAsOfPresetLabels,
  type ReportAsOfPreset,
} from "@/types/report"

export const DEFAULT_AS_OF_PRESET: ReportAsOfPreset = "fiscal-year-to-date"

type ReportAsOfFilterProps = {
  preset: ReportAsOfPreset
  customDate: string
  onChange: (next: { preset: ReportAsOfPreset; customDate: string }) => void
}

export function ReportAsOfFilter({
  preset,
  customDate,
  onChange,
}: ReportAsOfFilterProps) {
  const [open, setOpen] = React.useState(false)
  const isActive = preset !== DEFAULT_AS_OF_PRESET

  const label =
    preset === "custom" && customDate
      ? customDate
      : reportAsOfPresetLabels[preset]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-8 gap-1.5 text-xs font-normal",
              isActive && "border-primary bg-primary/5 font-medium text-primary"
            )}
          >
            <CalendarIcon className="size-3.5" />
            <span className="max-w-[160px] truncate">As of: {label}</span>
            <ChevronDownIcon className="size-3 opacity-60" />
          </Button>
        }
      />
      <PopoverContent align="start" className="w-56 min-w-56 p-1">
        {REPORT_AS_OF_PRESETS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => {
              onChange({
                preset: option,
                customDate:
                  option === "custom"
                    ? customDate || todayIsoDate()
                    : customDate,
              })
              if (option !== "custom") setOpen(false)
            }}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted"
          >
            <span className="flex-1">{reportAsOfPresetLabels[option]}</span>
            {preset === option ? (
              <CheckIcon className="size-4 text-primary" />
            ) : null}
          </button>
        ))}

        {preset === "custom" ? (
          <div className="mt-1 border-t px-2 pt-2 pb-1">
            <Input
              type="date"
              value={customDate}
              max={todayIsoDate()}
              onChange={(event) =>
                onChange({ preset: "custom", customDate: event.target.value })
              }
              className="h-8 text-xs"
            />
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}
