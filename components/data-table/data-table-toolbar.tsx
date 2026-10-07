"use client"

import type { Table } from "@tanstack/react-table"
import {
  CheckIcon,
  FilterIcon,
  Maximize2Icon,
  Minimize2Icon,
  Rows3Icon,
  SearchIcon,
} from "lucide-react"

import { Button, IconButton } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

import {
  type DataTableRowSize,
  dataTableRowSizes,
} from "./data-table-styles"

export type DataTableFilterOption = {
  value: string
  label: string
  count?: number
}

export type DataTableFilters = {
  value: string
  options: DataTableFilterOption[]
  onValueChange: (value: string) => void
}

type DataTableToolbarProps<TData> = {
  table: Table<TData>
  searchPlaceholder?: string
  className?: string
  rowSize?: DataTableRowSize
  onRowSizeChange?: (size: DataTableRowSize) => void
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
  filters?: DataTableFilters
  showFilter?: boolean
}

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = "Search...",
  className,
  rowSize = "md",
  onRowSizeChange,
  isFullscreen = false,
  onToggleFullscreen,
  filters,
  showFilter = true,
}: DataTableToolbarProps<TData>) {
  const globalFilter = (table.getState().globalFilter as string) ?? ""
  const isFiltered = Boolean(
    filters && filters.value !== filters.options[0]?.value
  )

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative w-full max-w-[220px]">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          size="32"
          data-page-search="true"
          placeholder={searchPlaceholder}
          value={globalFilter}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className="pl-9"
        />
      </div>

      <ButtonGroup>
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <IconButton
                  variant="outline"
                  color="neutral"
                  size="32"
                  aria-label="Row size"
                >
                  <Rows3Icon />
                </IconButton>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Row size</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="min-w-40">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Row size</DropdownMenuLabel>
              {dataTableRowSizes.map((size) => (
                <DropdownMenuItem
                  key={size.value}
                  onClick={() => onRowSizeChange?.(size.value)}
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
          <TooltipTrigger asChild>
            <IconButton
              variant="outline"
              color="neutral"
              size="32"
              aria-label={isFullscreen ? "Exit full screen" : "Full screen"}
              aria-pressed={isFullscreen}
              onClick={onToggleFullscreen}
            >
              {isFullscreen ? <Minimize2Icon /> : <Maximize2Icon />}
            </IconButton>
          </TooltipTrigger>
          <TooltipContent>
            {isFullscreen ? "Exit full screen" : "Full screen"}
          </TooltipContent>
        </Tooltip>

        {showFilter ? (
          filters ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  color="neutral"
                  size="32"
                  aria-label="Filter"
                  aria-pressed={isFiltered}
                  className={cn(isFiltered && "border-foreground/20 bg-muted")}
                >
                  <FilterIcon />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-44">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Filter</DropdownMenuLabel>
                  {filters.options.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => filters.onValueChange(option.value)}
                    >
                      <span>{option.label}</span>
                      <span className="ml-auto flex items-center gap-2">
                        {option.count != null ? (
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {option.count}
                          </span>
                        ) : null}
                        {filters.value === option.value ? (
                          <CheckIcon className="size-4" />
                        ) : (
                          <span className="size-4" aria-hidden />
                        )}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" color="neutral" size="32">
              <FilterIcon />
              Filter
            </Button>
          )
        ) : null}
      </ButtonGroup>
    </div>
  )
}
