"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowLeftIcon,
  CheckIcon,
  DownloadIcon,
  Maximize2Icon,
  Minimize2Icon,
  Rows3Icon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import {
  type DataTableRowSize,
  dataTableRowSizes,
} from "@/components/data-table/data-table-styles"
import {
  dataTableFullscreenClassName,
  useDataTableFullscreen,
} from "@/components/data-table/use-data-table-fullscreen"
import { PageHeader } from "@/components/layout/page-header"
import {
  DEFAULT_AS_OF_PRESET,
  ReportAsOfFilter,
} from "@/components/reports/report-as-of-filter"
import { ReportCustomerFilter } from "@/components/reports/report-customer-filter"
import { ReportListPanel } from "@/components/reports/report-list-panel"
import { SalesBookTable } from "@/components/reports/sales-book-table"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  getSalesBookCustomers,
  getSalesBookReport,
} from "@/lib/reports/sales-book"
import { cn } from "@/lib/utils"
import type { ReportAsOfPreset } from "@/types/report"

export function SalesBookReportPage() {
  const [preset, setPreset] =
    React.useState<ReportAsOfPreset>(DEFAULT_AS_OF_PRESET)
  const [customDate, setCustomDate] = React.useState("")
  const [customerFilter, setCustomerFilter] = React.useState<string | "all">(
    "all"
  )
  const [rowSize, setRowSize] = React.useState<DataTableRowSize>("md")
  const { isFullscreen, toggleFullscreen } = useDataTableFullscreen()

  const customerOptions = React.useMemo(() => getSalesBookCustomers(), [])

  const rows = React.useMemo(
    () => getSalesBookReport({ preset, customDate, customerFilter }),
    [preset, customDate, customerFilter]
  )

  const isAsOfActive = preset !== DEFAULT_AS_OF_PRESET
  const isCustomerFilterActive = customerFilter !== "all"
  const isAnyFilterActive = isAsOfActive || isCustomerFilterActive

  function clearFilters() {
    setPreset(DEFAULT_AS_OF_PRESET)
    setCustomDate("")
    setCustomerFilter("all")
  }

  return (
    <div className="-mt-3 -mb-3 -ml-3 flex min-h-[calc(100svh-3.5rem)] md:-mt-4 md:-mb-4 md:-ml-4">
      <ReportListPanel
        activeHref="/reports/sales-book"
        className="hidden lg:flex"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-4 pt-3 pr-0 pb-3 pl-3 md:pt-4 md:pb-4 md:pl-4">
        <PageHeader
          breadcrumb={
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2 h-7 w-fit px-2 text-muted-foreground"
              nativeButton={false}
              render={<Link href="/reports" />}
            >
              <ArrowLeftIcon />
              Back to reports
            </Button>
          }
          title="Sales Book"
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info("Export is coming soon.")}
            >
              <DownloadIcon />
              Export
            </Button>
          }
        />

        <div
          className={cn(
            "flex flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10",
            dataTableFullscreenClassName(isFullscreen)
          )}
        >
          <div className="flex flex-col gap-3 border-b px-3 py-2.5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <ReportAsOfFilter
                preset={preset}
                customDate={customDate}
                onChange={(next) => {
                  setPreset(next.preset)
                  setCustomDate(next.customDate)
                }}
              />
              <ReportCustomerFilter
                options={customerOptions}
                value={customerFilter}
                onChange={setCustomerFilter}
              />
              {isAnyFilterActive ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={clearFilters}
                >
                  <XIcon className="size-3.5" />
                  Clear Filters
                </Button>
              ) : null}
            </div>

            <ButtonGroup className="self-end lg:self-auto">
              <DropdownMenu>
                <Tooltip>
                  <DropdownMenuTrigger
                    render={
                      <TooltipTrigger
                        render={
                          <Button
                            variant="outline"
                            size="icon-sm"
                            aria-label="Row size"
                          />
                        }
                      />
                    }
                  >
                    <Rows3Icon />
                  </DropdownMenuTrigger>
                  <TooltipContent>Row size</TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end" className="min-w-40">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Row size</DropdownMenuLabel>
                    {dataTableRowSizes.map((size) => (
                      <DropdownMenuItem
                        key={size.value}
                        onClick={() => setRowSize(size.value)}
                      >
                        <span>{size.label}</span>
                        {rowSize === size.value ? (
                          <CheckIcon className="ml-auto size-4" />
                        ) : (
                          <span className="ml-auto size-4" aria-hidden />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="outline"
                      size="icon-sm"
                      aria-label={
                        isFullscreen ? "Exit full screen" : "Full screen"
                      }
                      aria-pressed={isFullscreen}
                      onClick={toggleFullscreen}
                    />
                  }
                >
                  {isFullscreen ? <Minimize2Icon /> : <Maximize2Icon />}
                </TooltipTrigger>
                <TooltipContent>
                  {isFullscreen ? "Exit full screen" : "Full screen"}
                </TooltipContent>
              </Tooltip>
            </ButtonGroup>
          </div>

          <SalesBookTable rows={rows} rowSize={rowSize} />
        </div>
      </div>
    </div>
  )
}
