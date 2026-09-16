"use client"

import {
  type DataTableRowSize,
  dataTableClassNames,
  getDataTableBodyCellClass,
  getDataTableHeaderCellClass,
} from "@/components/data-table/data-table-styles"
import { formatCurrency } from "@/lib/format"
import { formatReportNumber } from "@/lib/reports/inventory-valuation"
import { cn } from "@/lib/utils"
import type { PurchaseByItemSummaryRow } from "@/lib/reports/purchase-by-item-summary"

const COLUMN_COUNT = 9

const COLUMNS = ["ID", "Product Name", "Product Category"] as const
const NUMERIC_COLUMNS = [
  "Quantity",
  "Amount",
  "Discount",
  "Net Purchase",
  "VAT",
  "Total Amount",
] as const

type PurchaseByItemSummaryTableProps = {
  rows: PurchaseByItemSummaryRow[]
  rowSize: DataTableRowSize
  emptyMessage?: string
}

export function PurchaseByItemSummaryTable({
  rows,
  rowSize,
  emptyMessage = "No purchases match the selected filters.",
}: PurchaseByItemSummaryTableProps) {
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
                <tr key={row.productId} className={dataTableClassNames.bodyRow}>
                  <td className={cn(bodyCell, "font-mono text-xs text-muted-foreground")}>
                    {row.productId}
                  </td>
                  <td className={cn(bodyCell, "font-medium")}>{row.productName}</td>
                  <td className={bodyCell}>{row.category}</td>
                  <td className={cn(bodyCell, "text-right tabular-nums")}>
                    {formatReportNumber(row.quantity)}
                  </td>
                  <td className={cn(bodyCell, "text-right tabular-nums")}>
                    {formatReportNumber(row.amount)}
                  </td>
                  <td className={cn(bodyCell, "text-right tabular-nums")}>
                    {formatReportNumber(row.discount)}
                  </td>
                  <td className={cn(bodyCell, "text-right tabular-nums")}>
                    {formatReportNumber(row.netPurchase)}
                  </td>
                  <td className={cn(bodyCell, "text-right tabular-nums")}>
                    {formatReportNumber(row.vat)}
                  </td>
                  <td className={cn(bodyCell, "text-right font-medium tabular-nums")}>
                    {formatReportNumber(row.totalAmount)}
                  </td>
                </tr>
              ))}
              <tr className="border-t bg-muted/20 font-medium">
                <td className={bodyCell} colSpan={3}>
                  Total
                </td>
                <td className={bodyCell} colSpan={4} />
                <td className={cn(bodyCell, "text-right tabular-nums")}>
                  {formatCurrency(total)}
                </td>
              </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  )
}
