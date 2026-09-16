"use client"

import {
  type DataTableRowSize,
  dataTableClassNames,
  getDataTableBodyCellClass,
  getDataTableHeaderCellClass,
} from "@/components/data-table/data-table-styles"
import { formatCurrency } from "@/lib/format"
import { formatReportNumber } from "@/lib/reports/inventory-valuation"
import type { SupplierAgeingRow } from "@/lib/reports/supplier-ageing"
import { cn } from "@/lib/utils"

const COLUMN_COUNT = 6

type SupplierAgeingTableProps = {
  rows: SupplierAgeingRow[]
  rowSize: DataTableRowSize
  emptyMessage?: string
}

export function SupplierAgeingTable({
  rows,
  rowSize,
  emptyMessage = "No outstanding balances.",
}: SupplierAgeingTableProps) {
  const headerCell = getDataTableHeaderCellClass(rowSize)
  const bodyCell = getDataTableBodyCellClass(rowSize)
  const totals = rows.reduce(
    (sum, row) => ({
      current: sum.current + row.current,
      bucket0to4: sum.bucket0to4 + row.bucket0to4,
      bucket5to9: sum.bucket5to9 + row.bucket5to9,
      bucket10plus: sum.bucket10plus + row.bucket10plus,
      totalDue: sum.totalDue + row.totalDue,
    }),
    { current: 0, bucket0to4: 0, bucket5to9: 0, bucket10plus: 0, totalDue: 0 }
  )

  return (
    <div
      className="thin-scrollbar min-h-0 flex-1 overflow-auto"
      data-slot="data-table"
    >
      <table className={dataTableClassNames.table} data-row-size={rowSize}>
        <thead className="sticky top-0 z-10">
          <tr className={dataTableClassNames.headerRow}>
            <th className={headerCell}>Supplier</th>
            <th className={cn(headerCell, "text-right")}>Current</th>
            <th className={cn(headerCell, "text-right")}>0 - 4 days</th>
            <th className={cn(headerCell, "text-right")}>5 - 9 days</th>
            <th className={cn(headerCell, "text-right")}>10+ days</th>
            <th className={cn(headerCell, "text-right")}>Total Due</th>
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
                <tr key={row.supplierId} className={dataTableClassNames.bodyRow}>
                  <td className={cn(bodyCell, "font-medium")}>{row.supplierName}</td>
                  <td className={cn(bodyCell, "text-right tabular-nums")}>
                    {formatReportNumber(row.current)}
                  </td>
                  <td className={cn(bodyCell, "text-right tabular-nums")}>
                    {formatReportNumber(row.bucket0to4)}
                  </td>
                  <td className={cn(bodyCell, "text-right tabular-nums")}>
                    {formatReportNumber(row.bucket5to9)}
                  </td>
                  <td className={cn(bodyCell, "text-right tabular-nums")}>
                    {formatReportNumber(row.bucket10plus)}
                  </td>
                  <td className={cn(bodyCell, "text-right font-medium tabular-nums")}>
                    {formatReportNumber(row.totalDue)}
                  </td>
                </tr>
              ))}
              <tr className="border-t bg-muted/20 font-medium">
                <td className={bodyCell}>Total</td>
                <td className={cn(bodyCell, "text-right tabular-nums")}>
                  {formatCurrency(totals.current)}
                </td>
                <td className={cn(bodyCell, "text-right tabular-nums")}>
                  {formatCurrency(totals.bucket0to4)}
                </td>
                <td className={cn(bodyCell, "text-right tabular-nums")}>
                  {formatCurrency(totals.bucket5to9)}
                </td>
                <td className={cn(bodyCell, "text-right tabular-nums")}>
                  {formatCurrency(totals.bucket10plus)}
                </td>
                <td className={cn(bodyCell, "text-right tabular-nums")}>
                  {formatCurrency(totals.totalDue)}
                </td>
              </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  )
}
