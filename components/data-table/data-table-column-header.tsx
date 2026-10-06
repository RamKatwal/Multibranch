"use client"

import type { Column } from "@tanstack/react-table"
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type DataTableColumnHeaderProps<TData, TValue> =
  React.HTMLAttributes<HTMLDivElement> & {
    column: Column<TData, TValue>
    title: string
  }

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  const sorted = column.getIsSorted()

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        variant="ghost"
        color="neutral"
        size="32"
        className="h-7 -ml-2 px-2 text-xs font-medium text-muted-foreground hover:bg-transparent hover:text-foreground data-[state=open]:bg-muted"
        onClick={() => column.toggleSorting(sorted === "asc")}
      >
        <span>{title}</span>
        {sorted === "desc" ? (
          <ArrowDownIcon className="size-3.5" />
        ) : sorted === "asc" ? (
          <ArrowUpIcon className="size-3.5" />
        ) : (
          <ArrowUpDownIcon className="size-3.5 opacity-50" />
        )}
      </Button>
    </div>
  )
}
