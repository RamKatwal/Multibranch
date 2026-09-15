"use client"

import {
  type DataTableRowSize,
  dataTableClassNames,
  getDataTableBodyCellClass,
  getDataTableHeaderCellClass,
} from "@/components/data-table/data-table-styles"
import { Badge } from "@/components/ui/badge"
import { formatLongDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { ExpiryInventoryRow } from "@/lib/reports/expiry-inventory"

const COLUMN_COUNT = 9

const COLUMNS = [
  "Product Code",
  "Product Name",
  "Batch Number",
  "Product Type",
  "Product Category",
  "Sub Category",
  "UOM",
  "Expiry Date",
] as const

const NEAR_EXPIRY_THRESHOLD_DAYS = 30

type ExpiryInventoryTableProps = {
  rows: ExpiryInventoryRow[]
  rowSize: DataTableRowSize
  emptyMessage?: string
}

export function ExpiryInventoryTable({
  rows,
  rowSize,
  emptyMessage = "No products match the selected filters.",
}: ExpiryInventoryTableProps) {
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
            <th className={cn(headerCell, "text-right")}>Remaining Days</th>
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
            rows.map((row) => {
              const isExpired = row.remainingDays < 0
              const isNearExpiry =
                !isExpired && row.remainingDays <= NEAR_EXPIRY_THRESHOLD_DAYS

              return (
                <tr key={row.productCode} className={dataTableClassNames.bodyRow}>
                  <td className={cn(bodyCell, "font-mono text-xs text-muted-foreground")}>
                    {row.productCode}
                  </td>
                  <td className={cn(bodyCell, "font-medium")}>{row.productName}</td>
                  <td className={cn(bodyCell, "text-muted-foreground")}>
                    {row.batchNumber}
                  </td>
                  <td className={bodyCell}>{row.productType}</td>
                  <td className={bodyCell}>{row.category}</td>
                  <td className={cn(bodyCell, "text-muted-foreground")}>
                    {row.subCategory}
                  </td>
                  <td className={bodyCell}>{row.uom}</td>
                  <td className={cn(bodyCell, "text-muted-foreground tabular-nums")}>
                    {formatLongDate(row.expiryDate)}
                  </td>
                  <td className={cn(bodyCell, "text-right tabular-nums")}>
                    {isExpired || isNearExpiry ? (
                      <Badge variant={isExpired ? "destructive" : "outline"}>
                        {row.remainingDays}
                      </Badge>
                    ) : (
                      row.remainingDays
                    )}
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
