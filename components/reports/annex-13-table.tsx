"use client"

import {
  type DataTableRowSize,
  dataTableClassNames,
  getDataTableBodyCellClass,
  getDataTableHeaderCellClass,
} from "@/components/data-table/data-table-styles"
import { formatReportNumber } from "@/lib/reports/inventory-valuation"
import type { Annex13Row } from "@/lib/reports/annex-13"
import { cn } from "@/lib/utils"

const COLUMN_COUNT = 11

type Annex13TableProps = {
  rows: Annex13Row[]
  rowSize: DataTableRowSize
  emptyMessage?: string
}

export function Annex13Table({
  rows,
  rowSize,
  emptyMessage = "No transactions match the selected filters.",
}: Annex13TableProps) {
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
            <th className={headerCell}>Trade Name</th>
            <th className={headerCell}>PAN</th>
            <th className={headerCell}>Type</th>
            <th className={cn(headerCell, "text-right")}>Opening Balance</th>
            <th className={cn(headerCell, "text-right")}>Service Purchase Capital</th>
            <th className={cn(headerCell, "text-right")}>Service Purchase Others</th>
            <th className={cn(headerCell, "text-right")}>Goods Purchase Capital</th>
            <th className={cn(headerCell, "text-right")}>Goods Purchase Others</th>
            <th className={cn(headerCell, "text-right")}>Service Sales</th>
            <th className={cn(headerCell, "text-right")}>Goods Sales</th>
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
            rows.map((row, index) => (
              <tr key={index} className={dataTableClassNames.bodyRow}>
                <td className={cn(bodyCell, "font-medium")}>{row.tradeName}</td>
                <td className={cn(bodyCell, "font-mono text-xs text-muted-foreground")}>
                  {row.pan}
                </td>
                <td className={bodyCell}>{row.type}</td>
                <td className={cn(bodyCell, "text-right tabular-nums")}>
                  {formatReportNumber(row.openingBalance)}
                </td>
                <td className={cn(bodyCell, "text-right tabular-nums")}>
                  {row.servicePurchaseCapital || "-"}
                </td>
                <td className={cn(bodyCell, "text-right tabular-nums")}>
                  {row.servicePurchaseOthers || "-"}
                </td>
                <td className={cn(bodyCell, "text-right tabular-nums")}>
                  {row.goodsPurchaseCapital || "-"}
                </td>
                <td className={cn(bodyCell, "text-right tabular-nums")}>
                  {row.goodsPurchaseOthers
                    ? formatReportNumber(row.goodsPurchaseOthers)
                    : "-"}
                </td>
                <td className={cn(bodyCell, "text-right tabular-nums")}>
                  {row.serviceSales || "-"}
                </td>
                <td className={cn(bodyCell, "text-right tabular-nums")}>
                  {row.goodsSales ? formatReportNumber(row.goodsSales) : "-"}
                </td>
                <td className={cn(bodyCell, "text-right font-medium tabular-nums")}>
                  {formatReportNumber(row.closingBalance)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
