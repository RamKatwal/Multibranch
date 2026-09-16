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
import type { SalesQuotationReportRow } from "@/lib/reports/sales-quotation"

const COLUMN_COUNT = 7

const COLUMNS = ["Date", "Quotation ID", "Customer", "Due Date"] as const

type SalesQuotationTableProps = {
  rows: SalesQuotationReportRow[]
  rowSize: DataTableRowSize
  emptyMessage?: string
}

export function SalesQuotationTable({
  rows,
  rowSize,
  emptyMessage = "No quotations match the selected filters.",
}: SalesQuotationTableProps) {
  const headerCell = getDataTableHeaderCellClass(rowSize)
  const bodyCell = getDataTableBodyCellClass(rowSize)
  const total = rows.reduce((sum, row) => sum + row.totalAmount, 0)

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
            <th className={cn(headerCell, "text-right")}>Total Amount</th>
            <th className={headerCell}>Status</th>
            <th className={headerCell}>Entry By</th>
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
                      href="/sales/quotation"
                      className="text-primary underline-offset-2 hover:underline"
                      title="Open Sales Quotation module"
                    >
                      {row.id}
                    </Link>
                  </td>
                  <td className={cn(bodyCell, "font-medium")}>{row.customer}</td>
                  <td className={cn(bodyCell, "text-muted-foreground tabular-nums")}>
                    {formatLongDate(row.dueDate)}
                  </td>
                  <td className={cn(bodyCell, "text-right tabular-nums")}>
                    {formatCurrency(row.totalAmount)}
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
                <td className={bodyCell} colSpan={4}>
                  Total
                </td>
                <td className={cn(bodyCell, "text-right tabular-nums")}>
                  {formatCurrency(total)}
                </td>
                <td className={bodyCell} colSpan={2} />
              </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  )
}
