"use client"

import {
  type DataTableRowSize,
  dataTableClassNames,
  getDataTableBodyCellClass,
  getDataTableHeaderCellClass,
} from "@/components/data-table/data-table-styles"
import { formatReportNumber } from "@/lib/reports/inventory-valuation"
import type { SupplierSummaryRow } from "@/lib/reports/supplier-summary"
import { cn } from "@/lib/utils"

const COLUMN_COUNT = 6

type SupplierSummaryTableProps = {
  rows: SupplierSummaryRow[]
  rowSize: DataTableRowSize
  emptyMessage?: string
}

export function SupplierSummaryTable({
  rows,
  rowSize,
  emptyMessage = "No suppliers match the selected filters.",
}: SupplierSummaryTableProps) {
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
            <th className={headerCell}>Supplier ID</th>
            <th className={headerCell}>Supplier&apos;s Name</th>
            <th className={cn(headerCell, "text-right")}>Opening Balance</th>
            <th className={cn(headerCell, "text-right")}>Debit (Rs.)</th>
            <th className={cn(headerCell, "text-right")}>Credit (Rs.)</th>
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
            rows.map((row) => (
              <tr key={row.supplierId} className={dataTableClassNames.bodyRow}>
                <td className={cn(bodyCell, "font-mono text-xs text-muted-foreground")}>
                  {row.supplierId}
                </td>
                <td className={cn(bodyCell, "font-medium")}>{row.supplierName}</td>
                <td className={cn(bodyCell, "text-right tabular-nums")}>
                  {formatReportNumber(row.openingBalance)}
                </td>
                <td className={cn(bodyCell, "text-right tabular-nums")}>
                  {formatReportNumber(row.debit)}
                </td>
                <td className={cn(bodyCell, "text-right tabular-nums")}>
                  {formatReportNumber(row.credit)}
                </td>
                <td className={cn(bodyCell, "text-right font-medium tabular-nums")}>
                  {formatReportNumber(row.closingBalance)} ({row.closingSuffix})
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
