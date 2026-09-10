"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react"

import {
  type DataTableRowSize,
  dataTableClassNames,
  getDataTableBodyCellClass,
  getDataTableHeaderCellClass,
} from "@/components/data-table/data-table-styles"
import { formatReportNumber } from "@/lib/reports/inventory-valuation"
import { formatLongDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type {
  InventoryValuationGroup,
  InventoryValuationLine,
} from "@/types/report"

const COLUMN_COUNT = 12

type InventoryValuationTableProps = {
  groups: InventoryValuationGroup[]
  rowSize: DataTableRowSize
  emptyMessage?: string
}

function num(value: number, blank = false) {
  if (blank) return ""
  return formatReportNumber(value)
}

function NumberCell({
  value,
  blank,
  rowSize,
  strong,
}: {
  value: number
  blank?: boolean
  rowSize: DataTableRowSize
  strong?: boolean
}) {
  return (
    <td
      className={cn(
        getDataTableBodyCellClass(rowSize),
        "text-right tabular-nums",
        strong && "font-medium"
      )}
    >
      {num(value, blank)}
    </td>
  )
}

export function InventoryValuationTable({
  groups,
  rowSize,
  emptyMessage = "No products match the selected filters.",
}: InventoryValuationTableProps) {
  const [collapsed, setCollapsed] = React.useState<Set<string>>(new Set())

  function toggle(productId: string) {
    setCollapsed((current) => {
      const next = new Set(current)
      if (next.has(productId)) next.delete(productId)
      else next.add(productId)
      return next
    })
  }

  const headerCell = getDataTableHeaderCellClass(rowSize)

  return (
    <div
      className="thin-scrollbar min-h-0 flex-1 overflow-auto"
      data-slot="data-table"
    >
      <table className={dataTableClassNames.table} data-row-size={rowSize}>
        <thead className="sticky top-0 z-10">
          <tr className={dataTableClassNames.headerRow}>
            <th rowSpan={2} className={headerCell}>
              Date
            </th>
            <th rowSpan={2} className={headerCell}>
              Particulars
            </th>
            <th rowSpan={2} className={headerCell}>
              Reference
            </th>
            <th colSpan={3} className={cn(headerCell, "text-center")}>
              Inward
            </th>
            <th colSpan={3} className={cn(headerCell, "text-center")}>
              Outward
            </th>
            <th colSpan={3} className={cn(headerCell, "text-center")}>
              Balance
            </th>
          </tr>
          <tr className={dataTableClassNames.headerRow}>
            {(["inward", "outward", "balance"] as const).flatMap((group) =>
              ["Quantity", "Rate", "Amount"].map((label) => (
                <th
                  key={`${group}-${label}`}
                  className={cn(headerCell, "text-right")}
                >
                  {label}
                </th>
              ))
            )}
          </tr>
        </thead>
        <tbody>
          {groups.length === 0 ? (
            <tr>
              <td colSpan={COLUMN_COUNT} className={dataTableClassNames.emptyCell}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            groups.map((group) => {
              const isOpen = !collapsed.has(group.productId)

              return (
                <React.Fragment key={group.productId}>
                  <tr
                    className={cn(
                      "border-b border-border bg-muted/40 transition-colors hover:bg-muted"
                    )}
                  >
                    <td
                      colSpan={COLUMN_COUNT}
                      className={getDataTableBodyCellClass(rowSize)}
                    >
                      <button
                        type="button"
                        onClick={() => toggle(group.productId)}
                        className="flex w-full items-center gap-1.5 text-left text-sm font-medium"
                        aria-expanded={isOpen}
                      >
                        {isOpen ? (
                          <ChevronDownIcon className="size-3.5 text-muted-foreground" />
                        ) : (
                          <ChevronRightIcon className="size-3.5 text-muted-foreground" />
                        )}
                        {group.productName}
                      </button>
                    </td>
                  </tr>

                  {isOpen
                    ? group.lines.map((line, index) => (
                        <InventoryValuationRow
                          key={`${group.productId}-${index}`}
                          line={line}
                          rowSize={rowSize}
                        />
                      ))
                    : null}
                </React.Fragment>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

function InventoryValuationRow({
  line,
  rowSize,
}: {
  line: InventoryValuationLine
  rowSize: DataTableRowSize
}) {
  const isSummary = line.kind !== "movement"
  const hideInOut = line.kind === "opening"
  const bodyCell = getDataTableBodyCellClass(rowSize)

  return (
    <tr
      className={cn(
        dataTableClassNames.bodyRow,
        isSummary && "bg-muted/10 font-medium"
      )}
    >
      <td className={cn(bodyCell, "text-muted-foreground tabular-nums")}>
        {line.date ? formatLongDate(line.date) : ""}
      </td>
      <td className={bodyCell}>{line.particulars}</td>
      <td className={cn(bodyCell, "font-mono text-xs text-muted-foreground")}>
        {line.reference && line.referenceHref ? (
          <Link
            href={line.referenceHref}
            className="text-primary underline-offset-2 hover:underline"
            title={`Open source document for ${line.reference}`}
          >
            {line.reference}
          </Link>
        ) : (
          line.reference
        )}
      </td>

      <NumberCell value={line.inwardQty} blank={hideInOut} rowSize={rowSize} />
      <NumberCell value={line.inwardRate} blank={hideInOut} rowSize={rowSize} />
      <NumberCell value={line.inwardAmount} blank={hideInOut} rowSize={rowSize} />

      <NumberCell value={line.outwardQty} blank={hideInOut} rowSize={rowSize} />
      <NumberCell value={line.outwardRate} blank={hideInOut} rowSize={rowSize} />
      <NumberCell
        value={line.outwardAmount}
        blank={hideInOut}
        rowSize={rowSize}
      />

      <NumberCell value={line.balanceQty} rowSize={rowSize} strong />
      <NumberCell value={line.balanceRate} rowSize={rowSize} strong />
      <NumberCell value={line.balanceAmount} rowSize={rowSize} strong />
    </tr>
  )
}
