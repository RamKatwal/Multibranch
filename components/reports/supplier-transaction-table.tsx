"use client"

import {
  type DataTableRowSize,
  dataTableClassNames,
  getDataTableBodyCellClass,
  getDataTableHeaderCellClass,
} from "@/components/data-table/data-table-styles"
import { formatLongDate } from "@/lib/format"
import { formatReportNumber } from "@/lib/reports/inventory-valuation"
import type { SupplierTransactionRow } from "@/lib/reports/supplier-transaction"
import { cn } from "@/lib/utils"

const COLUMN_COUNT = 4

type SupplierTransactionTableProps = {
  rows: SupplierTransactionRow[]
  rowSize: DataTableRowSize
  emptyMessage?: string
}

export function SupplierTransactionTable({
  rows,
  rowSize,
  emptyMessage = "Select a supplier to see their transactions.",
}: SupplierTransactionTableProps) {
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
            <th className={headerCell}>Date</th>
            <th className={headerCell}>Transaction Type</th>
            <th className={cn(headerCell, "text-right")}>Total</th>
            <th className={cn(headerCell, "text-right")}>Closing Balance</th>
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
            rows.map((row, index) => (
              <tr key={index} className={dataTableClassNames.bodyRow}>
                <td className={cn(bodyCell, "text-muted-foreground tabular-nums")}>
                  {formatLongDate(row.date)}
                </td>
                <td className={bodyCell}>{row.type}</td>
                <td className={cn(bodyCell, "text-right tabular-nums")}>
                  {formatReportNumber(row.total)}
                </td>
                <td className={cn(bodyCell, "text-right font-medium tabular-nums")}>
                  {formatReportNumber(row.closingBalanceAmount)} ({row.closingBalanceSuffix})
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
