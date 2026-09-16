"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowLeftIcon,
  CheckIcon,
  ChevronDownIcon,
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
import { GeneralLedgerTable } from "@/components/reports/general-ledger-table"
import { PageHeader } from "@/components/layout/page-header"
import {
  DEFAULT_AS_OF_PRESET,
  ReportAsOfFilter,
} from "@/components/reports/report-as-of-filter"
import { ReportListPanel } from "@/components/reports/report-list-panel"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  getGeneralLedgerReport,
  mockChartOfAccounts,
} from "@/lib/reports/general-ledger-report"
import { cn } from "@/lib/utils"
import type { ReportAsOfPreset } from "@/types/report"

function AccountFilter({
  value,
  onChange,
}: {
  value: string | "all"
  onChange: (next: string | "all") => void
}) {
  const [open, setOpen] = React.useState(false)
  const isActive = value !== "all"
  const label =
    mockChartOfAccounts.find((account) => account.code === value)?.name ?? "All"

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
            <span className="max-w-[180px] truncate">
              Chart of Accounts: {label}
            </span>
            <ChevronDownIcon className="size-3 opacity-60" />
          </Button>
        }
      />
      <PopoverContent align="start" className="w-64 min-w-64 p-0">
        <Command shouldFilter>
          <CommandList className="thin-scrollbar max-h-64">
            <CommandEmpty>No accounts found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="All accounts"
                data-checked={value === "all" ? "true" : undefined}
                onSelect={() => {
                  onChange("all")
                  setOpen(false)
                }}
              >
                <span className="flex-1">All accounts</span>
              </CommandItem>
              {mockChartOfAccounts.map((account) => (
                <CommandItem
                  key={account.code}
                  value={account.name}
                  data-checked={value === account.code ? "true" : undefined}
                  onSelect={() => {
                    onChange(account.code)
                    setOpen(false)
                  }}
                >
                  <span className="min-w-0 flex-1 truncate">{account.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export function GeneralLedgerReportPage() {
  const [preset, setPreset] =
    React.useState<ReportAsOfPreset>(DEFAULT_AS_OF_PRESET)
  const [customDate, setCustomDate] = React.useState("")
  const [accountFilter, setAccountFilter] = React.useState<string | "all">("all")
  const [rowSize, setRowSize] = React.useState<DataTableRowSize>("md")
  const { isFullscreen, toggleFullscreen } = useDataTableFullscreen()

  const rows = React.useMemo(
    () => getGeneralLedgerReport({ preset, customDate, accountFilter }),
    [preset, customDate, accountFilter]
  )

  const isAsOfActive = preset !== DEFAULT_AS_OF_PRESET
  const isAccountFilterActive = accountFilter !== "all"
  const isAnyFilterActive = isAsOfActive || isAccountFilterActive

  function clearFilters() {
    setPreset(DEFAULT_AS_OF_PRESET)
    setCustomDate("")
    setAccountFilter("all")
  }

  return (
    <div className="-mt-3 -mb-3 -ml-3 flex min-h-[calc(100svh-3.5rem)] md:-mt-4 md:-mb-4 md:-ml-4">
      <ReportListPanel
        activeHref="/reports/general-ledger"
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
          title="General Ledger"
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
              <AccountFilter value={accountFilter} onChange={setAccountFilter} />
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

          <GeneralLedgerTable rows={rows} rowSize={rowSize} />
        </div>
      </div>
    </div>
  )
}
