"use client"

import {
  type DataTableRowSize,
  dataTableClassNames,
  getDataTableBodyCellClass,
  getDataTableHeaderCellClass,
} from "@/components/data-table/data-table-styles"
import { formatReportNumber } from "@/lib/reports/inventory-master"
import { cn } from "@/lib/utils"
import type { InventoryMasterRow } from "@/lib/reports/inventory-master"

const COLUMN_COUNT = 10

const COLUMNS = [
  "ID",
  "Product Name",
  "SKU",
  "Product Type",
  "Product Category",
  "Sub Category",
  "UOM",
] as const

type InventoryMasterTableProps = {
  rows: InventoryMasterRow[]
  rowSize: DataTableRowSize
  emptyMessage?: string
}

export function InventoryMasterTable({
  rows,
  rowSize,
  emptyMessage = "No products match the selected filters.",
}: InventoryMasterTableProps) {
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
              <th key={label} rowSpan={2} className={headerCell}>
                {label}
              </th>
            ))}
            <th colSpan={3} className={cn(headerCell, "text-center")}>
              Closing Balance
            </th>
          </tr>
          <tr className={dataTableClassNames.headerRow}>
            {["Quantity", "Rate", "Amount"].map((label) => (
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
            rows.map((row) => (
              <tr key={row.id} className={dataTableClassNames.bodyRow}>
                <td className={cn(bodyCell, "font-mono text-xs text-muted-foreground")}>
                  {row.id}
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
                  {formatReportNumber(row.quantity)}
                </td>
                <td className={cn(bodyCell, "text-right tabular-nums")}>
                  {formatReportNumber(row.rate)}
                </td>
                <td className={cn(bodyCell, "text-right font-medium tabular-nums")}>
                  {formatReportNumber(row.amount)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
