"use client"

import Link from "next/link"

import {
  type DataTableRowSize,
  dataTableClassNames,
  getDataTableBodyCellClass,
  getDataTableHeaderCellClass,
} from "@/components/data-table/data-table-styles"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatLongDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { SalesOrderReportRow } from "@/lib/reports/sales-order"

const COLUMN_COUNT = 6

const COLUMNS = ["Date", "Order ID", "Customer", "Total Amount", "Status", "Entry By"] as const

type SalesOrderTableProps = {
  rows: SalesOrderReportRow[]
  rowSize: DataTableRowSize
  emptyMessage?: string
}

export function SalesOrderTable({
  rows,
  rowSize,
  emptyMessage = "No orders match the selected filters.",
}: SalesOrderTableProps) {
  const headerCell = getDataTableHeaderCellClass(rowSize)
  const bodyCell = getDataTableBodyCellClass(rowSize)
  const total = rows.reduce((sum, row) => sum + row.grandTotal, 0)

  return (
    <div
      className="thin-scrollbar min-h-0 flex-1 overflow-auto"
      data-slot="data-table"
    >
      <table className={dataTableClassNames.table} data-row-size={rowSize}>
        <thead className="sticky top-0 z-10">
          <tr className={dataTableClassNames.headerRow}>
            {COLUMNS.map((label) => (
              <th
                key={label}
                className={cn(
                  headerCell,
                  label === "Total Amount" && "text-right"
                )}
              >
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
            <>
              {rows.map((row) => (
                <tr key={row.id} className={dataTableClassNames.bodyRow}>
                  <td className={cn(bodyCell, "text-muted-foreground tabular-nums")}>
                    {formatLongDate(row.entryDate)}
                  </td>
                  <td className={cn(bodyCell, "font-mono text-xs")}>
                    <Link
                      href="/sales/order"
                      className="text-primary underline-offset-2 hover:underline"
                      title="Open Sales Order module"
                    >
                      {row.id}
                    </Link>
                  </td>
                  <td className={cn(bodyCell, "font-medium")}>{row.customer}</td>
                  <td className={cn(bodyCell, "text-right tabular-nums")}>
                    {formatCurrency(row.grandTotal)}
                  </td>
                  <td className={bodyCell}>
                    <Badge className={row.statusBadgeClassName}>
                      {row.statusLabel}
                    </Badge>
                  </td>
                  <td className={bodyCell}>{row.entryBy}</td>
                </tr>
              ))}
              <tr className="border-t bg-muted/20 font-medium">
                <td className={bodyCell}>Total</td>
                <td className={bodyCell} />
                <td className={bodyCell} />
                <td className={cn(bodyCell, "text-right tabular-nums")}>
                  {formatCurrency(total)}
                </td>
                <td className={bodyCell} />
                <td className={bodyCell} />
              </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  )
}
