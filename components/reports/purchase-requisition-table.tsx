"use client"

import Link from "next/link"

import {
  type DataTableRowSize,
  dataTableClassNames,
  getDataTableBodyCellClass,
  getDataTableHeaderCellClass,
} from "@/components/data-table/data-table-styles"
import { Badge } from "@/components/ui/badge"
import { formatLongDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { PurchaseRequisitionReportRow } from "@/lib/reports/purchase-requisition"

const COLUMN_COUNT = 5

const COLUMNS = ["Date", "Requisition ID", "Due Date", "Status", "Entry By"] as const

type PurchaseRequisitionTableProps = {
  rows: PurchaseRequisitionReportRow[]
  rowSize: DataTableRowSize
  emptyMessage?: string
}

export function PurchaseRequisitionTable({
  rows,
  rowSize,
  emptyMessage = "No requisitions match the selected filters.",
}: PurchaseRequisitionTableProps) {
  const headerCell = getDataTableHeaderCellClass(rowSize)
  const bodyCell = getDataTableBodyCellClass(rowSize)

  return (
    <div
      className="thin-scrollbar min-h-0 flex-1 overflow-auto"
      data-slot="data-table"
    >
      <table className={dataTableClassNames.table} data-row-size={rowSize}>
        <thead className="sticky top-0 z-10">
          <tr className={dataTableClassNames.headerRow}>
            {COLUMNS.map((label) => (
              <th key={label} className={headerCell}>
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={COLUMN_COUNT} className={dataTableClassNames.emptyCell}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id} className={dataTableClassNames.bodyRow}>
                <td className={cn(bodyCell, "text-muted-foreground tabular-nums")}>
                  {formatLongDate(row.entryDate)}
                </td>
                <td className={cn(bodyCell, "font-mono text-xs")}>
                  <Link
                    href="/purchase/requisition"
                    className="text-primary underline-offset-2 hover:underline"
                    title="Open Purchase Requisition module"
                  >
                    {row.id}
                  </Link>
                </td>
                <td className={cn(bodyCell, "text-muted-foreground tabular-nums")}>
                  {formatLongDate(row.dueDate)}
                </td>
                <td className={bodyCell}>
                  <Badge className={row.statusBadgeClassName}>
                    {row.statusLabel}
                  </Badge>
                </td>
                <td className={bodyCell}>{row.entryBy}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
