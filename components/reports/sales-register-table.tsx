"use client"

import Link from "next/link"

import {
  type DataTableRowSize,
  dataTableClassNames,
  getDataTableBodyCellClass,
  getDataTableHeaderCellClass,
} from "@/components/data-table/data-table-styles"
import { formatCurrency, formatLongDate } from "@/lib/format"
import { formatReportNumber } from "@/lib/reports/inventory-valuation"
import type { SalesRegisterRow } from "@/lib/reports/sales-register"
import { cn } from "@/lib/utils"

const COLUMN_COUNT = 10

type SalesRegisterTableProps = {
  rows: SalesRegisterRow[]
  rowSize: DataTableRowSize
  emptyMessage?: string
}

export function SalesRegisterTable({
  rows,
  rowSize,
  emptyMessage = "No sales match the selected filters.",
}: SalesRegisterTableProps) {
  const headerCell = getDataTableHeaderCellClass(rowSize)
  const bodyCell = getDataTableBodyCellClass(rowSize)
  const total = rows.reduce((sum, row) => sum + row.totalSalesOrExports, 0)

  return (
    <div
      className="thin-scrollbar min-h-0 flex-1 overflow-auto"
      data-slot="data-table"
    >
      <table className={dataTableClassNames.table} data-row-size={rowSize}>
        <thead className="sticky top-0 z-10">
          <tr className={dataTableClassNames.headerRow}>
            <th className={headerCell}>Date</th>
            <th className={headerCell}>Invoice No</th>
            <th className={headerCell}>Buyer&apos;s Name</th>
            <th className={headerCell}>Buyer&apos;s PAN Number</th>
            <th className={cn(headerCell, "text-right")}>Price (Rs.)</th>
            <th className={cn(headerCell, "text-right")}>Tax (Rs.)</th>
            <th className={cn(headerCell, "text-right")}>
              Total Sales/Exports (Rs.)
            </th>
            <th className={cn(headerCell, "text-right")}>
              Price of Goods/Services Exported
            </th>
            <th className={headerCell}>Country of Export</th>
            <th className={headerCell}>Export Declaration No.</th>
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
                  <td className={cn(bodyCell, "font-mono text-xs")}>
                    <Link
                      href="/sales/order"
                      className="text-primary underline-offset-2 hover:underline"
                      title="Open Sales Order module"
                    >
                      {row.id}
                    </Link>
                  </td>
                  <td className={cn(bodyCell, "font-medium")}>{row.buyerName}</td>
                  <td className={cn(bodyCell, "font-mono text-xs text-muted-foreground")}>
                    {row.buyerPan}
                  </td>
                  <td className={cn(bodyCell, "text-right tabular-nums")}>
                    {formatReportNumber(row.price)}
                  </td>
                  <td className={cn(bodyCell, "text-right tabular-nums")}>
                    {formatReportNumber(row.tax)}
                  </td>
                  <td className={cn(bodyCell, "text-right tabular-nums")}>
                    {formatReportNumber(row.totalSalesOrExports)}
                  </td>
                  <td className={cn(bodyCell, "text-right tabular-nums")}>
                    {row.exportPrice || "-"}
                  </td>
                  <td className={cn(bodyCell, "text-muted-foreground")}>
                    {row.countryOfExport}
                  </td>
                  <td className={cn(bodyCell, "text-muted-foreground")}>
                    {row.exportDeclarationNo}
                  </td>
                </tr>
              ))}
              <tr className="border-t bg-muted/20 font-medium">
                <td className={bodyCell} colSpan={6}>
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
