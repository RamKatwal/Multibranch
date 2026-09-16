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
import type { PurchaseBookRow } from "@/lib/reports/purchase-book"

const COLUMN_COUNT = 15

const COLUMNS = [
  "Date",
  "Invoice ID",
  "Supplier's Name",
  "Supplier's PAN Number",
  "Invoice Date",
  "Total Amount",
  "Non Taxable Amount",
  "Taxable Amount",
  "VAT Amount",
  "Type",
  "Country",
  "Declaration No.",
  "Import Date",
  "Entry By",
  "Remarks",
] as const

const RIGHT_ALIGNED = new Set([
  "Total Amount",
  "Non Taxable Amount",
  "Taxable Amount",
  "VAT Amount",
])

type PurchaseBookTableProps = {
  rows: PurchaseBookRow[]
  rowSize: DataTableRowSize
  emptyMessage?: string
}

export function PurchaseBookTable({
  rows,
  rowSize,
  emptyMessage = "No booked purchases match the selected filters.",
}: PurchaseBookTableProps) {
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
              <th
                key={label}
                className={cn(headerCell, RIGHT_ALIGNED.has(label) && "text-right")}
              >
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
                      href="/purchase/order"
                      className="text-primary underline-offset-2 hover:underline"
                      title="Open Purchase Order module"
                    >
                      {row.id}
                    </Link>
                  </td>
                  <td className={cn(bodyCell, "font-medium")}>
                    {row.supplierName}
                  </td>
                  <td className={cn(bodyCell, "font-mono text-xs text-muted-foreground")}>
                    {row.supplierPan}
                  </td>
                  <td className={cn(bodyCell, "text-muted-foreground tabular-nums")}>
                    {formatLongDate(row.invoiceDate)}
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
                  <td className={bodyCell}>{row.type}</td>
                  <td className={bodyCell}>{row.country}</td>
                  <td className={bodyCell}>{row.declarationNo}</td>
                  <td className={cn(bodyCell, "tabular-nums")}>
                    {row.importDate === "-" ? "-" : formatLongDate(row.importDate)}
                  </td>
                  <td className={bodyCell}>{row.entryBy}</td>
                  <td className={cn(bodyCell, "text-muted-foreground")}>
                    {row.remarks}
                  </td>
                </tr>
              ))}
              <tr className="border-t bg-muted/20 font-medium">
                <td className={bodyCell}>Total</td>
                <td className={bodyCell} colSpan={4} />
                <td className={cn(bodyCell, "text-right tabular-nums")}>
                  {formatCurrency(total)}
                </td>
                <td className={bodyCell} colSpan={9} />
              </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  )
}
