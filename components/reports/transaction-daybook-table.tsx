"use client"

import {
  type DataTableRowSize,
  dataTableClassNames,
  getDataTableBodyCellClass,
  getDataTableHeaderCellClass,
} from "@/components/data-table/data-table-styles"
import { formatCurrency, formatLongDate } from "@/lib/format"
import type { TransactionDaybookRow } from "@/lib/reports/transaction-daybook"
import { cn } from "@/lib/utils"

const COLUMN_COUNT = 8

type TransactionDaybookTableProps = {
  rows: TransactionDaybookRow[]
  rowSize: DataTableRowSize
  emptyMessage?: string
}

export function TransactionDaybookTable({
  rows,
  rowSize,
  emptyMessage = "No transactions on this date.",
}: TransactionDaybookTableProps) {
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
            <th className={headerCell}>Date</th>
            <th className={headerCell}>Transaction ID</th>
            <th className={headerCell}>Transaction Type</th>
            <th className={headerCell}>Details</th>
            <th className={cn(headerCell, "text-right")}>Total Amount</th>
            <th className={headerCell}>Prepared By</th>
            <th className={headerCell}>Approved By</th>
            <th className={headerCell}>Description</th>
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
                    {formatLongDate(row.date)}
                  </td>
                  <td className={cn(bodyCell, "font-mono text-xs")}>{row.id}</td>
                  <td className={bodyCell}>{row.transactionType}</td>
                  <td className={cn(bodyCell, "font-medium")}>{row.details}</td>
                  <td className={cn(bodyCell, "text-right tabular-nums")}>
                    {formatCurrency(row.totalAmount)}
                  </td>
                  <td className={bodyCell}>{row.preparedBy}</td>
                  <td className={bodyCell}>{row.approvedBy}</td>
                  <td className={cn(bodyCell, "text-muted-foreground")}>
                    {row.description}
                  </td>
                </tr>
              ))}
              <tr className="border-t bg-muted/20 font-medium">
                <td className={bodyCell} colSpan={4}>
                  Total
                </td>
                <td className={cn(bodyCell, "text-right tabular-nums")}>
                  {formatCurrency(total)}
                </td>
                <td className={bodyCell} colSpan={3} />
              </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  )
}
