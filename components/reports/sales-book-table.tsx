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
import { cn } from "@/lib/utils"
import type { SalesBookRow } from "@/lib/reports/sales-book"

const COLUMN_COUNT = 9

const COLUMNS = ["Date", "Bill No", "Buyer's Name", "Buyer's PAN Number"] as const
const NUMERIC_COLUMNS = [
  "Total Sales",
  "Non Taxable Sales",
  "Discount",
  "Taxable Sales",
  "VAT Amount",
] as const

type SalesBookTableProps = {
  rows: SalesBookRow[]
  rowSize: DataTableRowSize
  emptyMessage?: string
}

export function SalesBookTable({
  rows,
  rowSize,
  emptyMessage = "No booked sales match the selected filters.",
}: SalesBookTableProps) {
  const headerCell = getDataTableHeaderCellClass(rowSize)
  const bodyCell = getDataTableBodyCellClass(rowSize)
  const total = rows.reduce((sum, row) => sum + row.totalSales, 0)

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
            {NUMERIC_COLUMNS.map((label) => (
              <th key={label} className={cn(headerCell, "text-right")}>
                {label}
              </th>
            ))}
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
                    {formatReportNumber(row.totalSales)}
                  </td>
                  <td className={cn(bodyCell, "text-right tabular-nums")}>
                    {formatReportNumber(row.nonTaxableSales)}
                  </td>
                  <td className={cn(bodyCell, "text-right tabular-nums")}>
                    {formatReportNumber(row.discount)}
                  </td>
                  <td className={cn(bodyCell, "text-right tabular-nums")}>
                    {formatReportNumber(row.taxableSales)}
                  </td>
                  <td className={cn(bodyCell, "text-right tabular-nums")}>
                    {formatReportNumber(row.vatAmount)}
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
                <td className={bodyCell} colSpan={4} />
              </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  )
}
