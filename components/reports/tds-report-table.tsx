"use client"

import {
  type DataTableRowSize,
  dataTableClassNames,
  getDataTableBodyCellClass,
  getDataTableHeaderCellClass,
} from "@/components/data-table/data-table-styles"
import { formatCurrency, formatLongDate } from "@/lib/format"
import { formatReportNumber } from "@/lib/reports/inventory-valuation"
import type { TdsReportRow } from "@/lib/reports/tds-report"
import { cn } from "@/lib/utils"

const COLUMN_COUNT = 8

type TdsReportTableProps = {
  rows: TdsReportRow[]
  rowSize: DataTableRowSize
  emptyMessage?: string
}

export function TdsReportTable({
  rows,
  rowSize,
  emptyMessage = "No TDS deductions match the selected filters.",
}: TdsReportTableProps) {
  const headerCell = getDataTableHeaderCellClass(rowSize)
  const bodyCell = getDataTableBodyCellClass(rowSize)
  const total = rows.reduce((sum, row) => sum + row.tdsAmount, 0)

  return (
    <div
      className="thin-scrollbar min-h-0 flex-1 overflow-auto"
      data-slot="data-table"
    >
      <table className={dataTableClassNames.table} data-row-size={rowSize}>
        <thead className="sticky top-0 z-10">
          <tr className={dataTableClassNames.headerRow}>
            <th className={headerCell}>Party Name</th>
            <th className={headerCell}>PAN Number</th>
            <th className={headerCell}>Date</th>
            <th className={headerCell}>Transaction Type</th>
            <th className={headerCell}>Reference</th>
            <th className={cn(headerCell, "text-right")}>TDS Amount</th>
            <th className={headerCell}>TDS Type</th>
            <th className={headerCell}>TDS Account</th>
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
              {rows.map((row, index) => (
                <tr key={index} className={dataTableClassNames.bodyRow}>
                  <td className={cn(bodyCell, "font-medium")}>{row.partyName}</td>
                  <td className={cn(bodyCell, "font-mono text-xs text-muted-foreground")}>
                    {row.panNumber}
                  </td>
                  <td className={cn(bodyCell, "text-muted-foreground tabular-nums")}>
                    {formatLongDate(row.date)}
                  </td>
                  <td className={bodyCell}>{row.transactionType}</td>
                  <td className={cn(bodyCell, "font-mono text-xs text-muted-foreground")}>
                    {row.reference}
                  </td>
                  <td className={cn(bodyCell, "text-right tabular-nums")}>
                    {formatReportNumber(row.tdsAmount)}
                  </td>
                  <td className={bodyCell}>{row.tdsType}</td>
                  <td className={bodyCell}>{row.tdsAccount}</td>
                </tr>
              ))}
              <tr className="border-t bg-muted/20 font-medium">
                <td className={bodyCell} colSpan={5}>
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
