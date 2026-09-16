"use client"

import Link from "next/link"

import {
  type DataTableRowSize,
  dataTableClassNames,
  getDataTableBodyCellClass,
  getDataTableHeaderCellClass,
} from "@/components/data-table/data-table-styles"
import { formatLongDate } from "@/lib/format"
import { formatReportNumber } from "@/lib/reports/inventory-valuation"
import type { Annex5Row } from "@/lib/reports/annex-5"
import { cn } from "@/lib/utils"

const COLUMN_COUNT = 12

function boolLabel(value: boolean) {
  return value ? "true" : "false"
}

type Annex5TableProps = {
  rows: Annex5Row[]
  rowSize: DataTableRowSize
  emptyMessage?: string
}

export function Annex5Table({
  rows,
  rowSize,
  emptyMessage = "No sales match the selected filters.",
}: Annex5TableProps) {
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
            <th className={headerCell}>Fiscal Year</th>
            <th className={headerCell}>Bill No</th>
            <th className={headerCell}>Customer Name</th>
            <th className={headerCell}>Customer PAN</th>
            <th className={headerCell}>Bill Date</th>
            <th className={cn(headerCell, "text-right")}>Amount</th>
            <th className={cn(headerCell, "text-right")}>Discount</th>
            <th className={cn(headerCell, "text-right")}>Taxable Amount</th>
            <th className={cn(headerCell, "text-right")}>Tax Amount</th>
            <th className={cn(headerCell, "text-right")}>Total Amount</th>
            <th className={headerCell}>Sync with IRD</th>
            <th className={headerCell}>Entered By</th>
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
              <tr key={row.billNo} className={dataTableClassNames.bodyRow}>
                <td className={cn(bodyCell, "text-muted-foreground")}>
                  {row.fiscalYear}
                </td>
                <td className={cn(bodyCell, "font-mono text-xs")}>
                  <Link
                    href="/sales/order"
                    className="text-primary underline-offset-2 hover:underline"
                    title="Open Sales Order module"
                  >
                    {row.billNo}
                  </Link>
                </td>
                <td className={cn(bodyCell, "font-medium")}>{row.customerName}</td>
                <td className={cn(bodyCell, "font-mono text-xs text-muted-foreground")}>
                  {row.customerPan}
                </td>
                <td className={cn(bodyCell, "text-muted-foreground tabular-nums")}>
                  {formatLongDate(row.billDate)}
                </td>
                <td className={cn(bodyCell, "text-right tabular-nums")}>
                  {formatReportNumber(row.amount)}
                </td>
                <td className={cn(bodyCell, "text-right tabular-nums")}>
                  {row.discount ? formatReportNumber(row.discount) : "-"}
                </td>
                <td className={cn(bodyCell, "text-right tabular-nums")}>
                  {row.taxableAmount ? formatReportNumber(row.taxableAmount) : "-"}
                </td>
                <td className={cn(bodyCell, "text-right tabular-nums")}>
                  {row.taxAmount ? formatReportNumber(row.taxAmount) : "-"}
                </td>
                <td className={cn(bodyCell, "text-right font-medium tabular-nums")}>
                  {formatReportNumber(row.totalAmount)}
                </td>
                <td className={cn(bodyCell, "text-muted-foreground")}>
                  {boolLabel(row.syncWithIrd)}
                </td>
                <td className={bodyCell}>{row.enteredBy}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
