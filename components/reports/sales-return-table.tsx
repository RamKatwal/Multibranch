"use client"

import Link from "next/link"

import {
  type DataTableRowSize,
  dataTableClassNames,
  getDataTableBodyCellClass,
  getDataTableHeaderCellClass,
} from "@/components/data-table/data-table-styles"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatLongDate } from "@/lib/format"
import { formatReportNumber } from "@/lib/reports/inventory-valuation"
import { cn } from "@/lib/utils"
import type { SalesReturnRow } from "@/lib/reports/sales-return"

const COLUMN_COUNT = 11

const COLUMNS = [
  "Date",
  "Return ID",
  "Customer Name",
  "PAN Number",
  "Ref. Invoice No.",
] as const

const RIGHT_ALIGNED = new Set([
  "Total Amount",
  "Non Taxable Amount",
  "Taxable Amount",
  "VAT Amount",
])
const NUMERIC_COLUMNS = [
  "Total Amount",
  "Non Taxable Amount",
  "Taxable Amount",
  "VAT Amount",
] as const

type SalesReturnTableProps = {
  rows: SalesReturnRow[]
  rowSize: DataTableRowSize
  emptyMessage?: string
}

export function SalesReturnTable({
  rows,
  rowSize,
  emptyMessage = "No returns match the selected filters.",
}: SalesReturnTableProps) {
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
            {COLUMNS.map((label) => (
              <th key={label} className={headerCell}>
                {label}
              </th>
            ))}
            {NUMERIC_COLUMNS.map((label) => (
              <th
                key={label}
                className={cn(headerCell, RIGHT_ALIGNED.has(label) && "text-right")}
              >
                {label}
              </th>
            ))}
            <th className={headerCell}>Status</th>
            <th className={headerCell}>Entry By</th>
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
                      href="/sales/return"
                      className="text-primary underline-offset-2 hover:underline"
                      title="Open Sales Return module"
                    >
                      {row.id}
                    </Link>
                  </td>
                  <td className={cn(bodyCell, "font-medium")}>{row.customerName}</td>
                  <td className={cn(bodyCell, "font-mono text-xs text-muted-foreground")}>
                    {row.panNumber}
                  </td>
                  <td className={cn(bodyCell, "font-mono text-xs text-muted-foreground")}>
                    {row.refInvoice}
                  </td>
                  <td className={cn(bodyCell, "text-right tabular-nums")}>
                    {formatReportNumber(row.totalAmount)}
                  </td>
                  <td className={cn(bodyCell, "text-right tabular-nums")}>
                    {formatReportNumber(row.nonTaxableAmount)}
                  </td>
                  <td className={cn(bodyCell, "text-right tabular-nums")}>
                    {formatReportNumber(row.taxableAmount)}
                  </td>
                  <td className={cn(bodyCell, "text-right tabular-nums")}>
                    {formatReportNumber(row.vatAmount)}
                  </td>
                  <td className={bodyCell}>
                    <Badge className={row.statusBadgeClassName}>
                      {row.statusLabel}
                    </Badge>
                  </td>
                  <td className={bodyCell}>{row.entryBy}</td>
                </tr>
              ))}
              <tr className="border-t bg-muted/20 font-medium">
                <td className={bodyCell} colSpan={5}>
                  Total
                </td>
                <td className={cn(bodyCell, "text-right tabular-nums")}>
                  {formatCurrency(total)}
                </td>
                <td className={bodyCell} colSpan={5} />
              </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  )
}
