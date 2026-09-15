"use client"

import {
  type DataTableRowSize,
  dataTableClassNames,
  getDataTableBodyCellClass,
  getDataTableHeaderCellClass,
} from "@/components/data-table/data-table-styles"
import { Badge } from "@/components/ui/badge"
import { formatReportNumber } from "@/lib/reports/reorder-inventory"
import { cn } from "@/lib/utils"
import type { ReorderInventoryRow } from "@/lib/reports/reorder-inventory"

const COLUMN_COUNT = 9

const COLUMNS = [
  "Item Code",
  "Product Name",
  "SKU",
  "Product Type",
  "Product Category",
  "Sub Category",
  "UOM",
] as const

type ReorderInventoryTableProps = {
  rows: ReorderInventoryRow[]
  rowSize: DataTableRowSize
  emptyMessage?: string
}

export function ReorderInventoryTable({
  rows,
  rowSize,
  emptyMessage = "No products match the selected filters.",
}: ReorderInventoryTableProps) {
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
            {COLUMNS.map((label) => (
              <th key={label} className={headerCell}>
                {label}
              </th>
            ))}
            <th className={cn(headerCell, "text-right")}>Reorder Quantity</th>
            <th className={cn(headerCell, "text-right")}>Closing Stock</th>
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
              <tr key={row.itemCode} className={dataTableClassNames.bodyRow}>
                <td className={cn(bodyCell, "font-mono text-xs text-muted-foreground")}>
                  {row.itemCode}
                </td>
                <td className={cn(bodyCell, "font-medium")}>{row.productName}</td>
                <td className={cn(bodyCell, "text-muted-foreground")}>{row.sku}</td>
                <td className={bodyCell}>{row.productType}</td>
                <td className={bodyCell}>{row.category}</td>
                <td className={cn(bodyCell, "text-muted-foreground")}>
                  {row.subCategory}
                </td>
                <td className={bodyCell}>{row.uom}</td>
                <td className={cn(bodyCell, "text-right tabular-nums")}>
                  {formatReportNumber(row.reorderQty)}
                </td>
                <td className={cn(bodyCell, "text-right tabular-nums")}>
                  {row.isBelowReorder ? (
                    <Badge variant="destructive">
                      {formatReportNumber(row.closingStock)}
                    </Badge>
                  ) : (
                    formatReportNumber(row.closingStock)
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
