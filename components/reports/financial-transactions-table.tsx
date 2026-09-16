"use client"

import {
  type DataTableRowSize,
  dataTableClassNames,
  getDataTableBodyCellClass,
  getDataTableHeaderCellClass,
} from "@/components/data-table/data-table-styles"
import type { FinancialTransactionRow } from "@/lib/reports/financial-transactions"

const COLUMN_COUNT = 7

type FinancialTransactionsTableProps = {
  rows: FinancialTransactionRow[]
  rowSize: DataTableRowSize
  emptyMessage?: string
}

export function FinancialTransactionsTable({
  rows,
  rowSize,
  emptyMessage = "No cash or bank movements are recorded yet.",
}: FinancialTransactionsTableProps) {
  const headerCell = getDataTableHeaderCellClass(rowSize)

  return (
    <div
      className="thin-scrollbar min-h-0 flex-1 overflow-auto"
      data-slot="data-table"
    >
      <table className={dataTableClassNames.table} data-row-size={rowSize}>
        <thead className="sticky top-0 z-10">
          <tr className={dataTableClassNames.headerRow}>
            <th className={headerCell}>Date</th>
            <th className={headerCell}>Account</th>
            <th className={headerCell}>Reference</th>
            <th className={headerCell}>Transaction</th>
            <th className={headerCell}>In</th>
            <th className={headerCell}>Out</th>
            <th className={headerCell}>Balance</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={COLUMN_COUNT} className={dataTableClassNames.emptyCell}>
              {rows.length === 0 ? emptyMessage : null}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
