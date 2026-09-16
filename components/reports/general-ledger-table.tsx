"use client"

import {
  type DataTableRowSize,
  dataTableClassNames,
  getDataTableBodyCellClass,
  getDataTableHeaderCellClass,
} from "@/components/data-table/data-table-styles"
import { formatLongDate } from "@/lib/format"
import { formatReportNumber } from "@/lib/reports/inventory-valuation"
import type { GeneralLedgerReportRow } from "@/lib/reports/general-ledger-report"
import { cn } from "@/lib/utils"

const COLUMN_COUNT = 9

type GeneralLedgerTableProps = {
  rows: GeneralLedgerReportRow[]
  rowSize: DataTableRowSize
  emptyMessage?: string
}

export function GeneralLedgerTable({
  rows,
  rowSize,
  emptyMessage = "No ledger entries match the selected filters.",
}: GeneralLedgerTableProps) {
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
            <th className={headerCell}>GL Code</th>
            <th className={headerCell}>GL Name</th>
            <th className={headerCell}>Description</th>
            <th className={headerCell}>Reference</th>
            <th className={headerCell}>Transaction</th>
            <th className={headerCell}>Entry Date</th>
            <th className={cn(headerCell, "text-right")}>Debit (Rs.)</th>
            <th className={cn(headerCell, "text-right")}>Credit (Rs.)</th>
            <th className={cn(headerCell, "text-right")}>Balance</th>
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
                <td className={cn(bodyCell, "font-mono text-xs text-muted-foreground")}>
                  {row.glCode}
                </td>
                <td className={cn(bodyCell, "font-medium")}>{row.glName}</td>
                <td className={cn(bodyCell, "text-muted-foreground")}>
                  {row.description}
                </td>
                <td className={cn(bodyCell, "font-mono text-xs text-muted-foreground")}>
                  {row.reference}
                </td>
                <td className={bodyCell}>{row.transactionType}</td>
                <td className={cn(bodyCell, "text-muted-foreground tabular-nums")}>
                  {formatLongDate(row.date)}
                </td>
                <td className={cn(bodyCell, "text-right tabular-nums")}>
                  {row.debit ? formatReportNumber(row.debit) : "-"}
                </td>
                <td className={cn(bodyCell, "text-right tabular-nums")}>
                  {row.credit ? formatReportNumber(row.credit) : "-"}
                </td>
                <td className={cn(bodyCell, "text-right font-medium tabular-nums")}>
                  {formatReportNumber(row.balanceAmount)} ({row.balanceSuffix})
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
