"use client"

import { Fragment } from "react"

import {
  type DataTableRowSize,
  dataTableClassNames,
  getDataTableBodyCellClass,
  getDataTableHeaderCellClass,
} from "@/components/data-table/data-table-styles"
import { formatCurrency } from "@/lib/format"
import { formatReportNumber } from "@/lib/reports/inventory-valuation"
import {
  FISCAL_MONTHS,
  FISCAL_QUARTERS,
  type PurchaseByItemMonthlyRow,
} from "@/lib/reports/purchase-by-item-monthly"
import { cn } from "@/lib/utils"

const COLUMN_COUNT = 19

type PurchaseByItemMonthlyTableProps = {
  rows: PurchaseByItemMonthlyRow[]
  rowSize: DataTableRowSize
  emptyMessage?: string
}

export function PurchaseByItemMonthlyTable({
  rows,
  rowSize,
  emptyMessage = "No purchases recorded for this fiscal year.",
}: PurchaseByItemMonthlyTableProps) {
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
            <th className={headerCell}>ID</th>
            <th className={headerCell}>Product Name</th>
            {FISCAL_QUARTERS.map((quarter) => (
              <Fragment key={quarter.label}>
                {quarter.monthIndexes.map((monthIndex) => (
                  <th
                    key={monthIndex}
                    className={cn(headerCell, "text-right")}
                  >
                    {FISCAL_MONTHS[monthIndex]}
                  </th>
                ))}
                <th className={cn(headerCell, "bg-muted/70 text-right")}>
                  {quarter.label}
                </th>
              </Fragment>
            ))}
            <th className={cn(headerCell, "text-right")}>Total Amount</th>
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
                  {FISCAL_QUARTERS.map((quarter, quarterIndex) => (
                    <Fragment key={quarter.label}>
                      {quarter.monthIndexes.map((monthIndex) => (
                        <td
                          key={monthIndex}
                          className={cn(bodyCell, "text-right tabular-nums")}
                        >
                          {row.months[monthIndex]
                            ? formatReportNumber(row.months[monthIndex])
                            : "-"}
                        </td>
                      ))}
                      <td
                        className={cn(
                          bodyCell,
                          "bg-muted/20 text-right font-medium tabular-nums"
                        )}
                      >
                        {row.quarterTotals[quarterIndex]
                          ? formatReportNumber(row.quarterTotals[quarterIndex])
                          : "-"}
                      </td>
                    </Fragment>
                  ))}
                  <td className={cn(bodyCell, "text-right font-medium tabular-nums")}>
                    {formatReportNumber(row.totalAmount)}
                  </td>
                </tr>
              ))}
              <tr className="border-t bg-muted/20 font-medium">
                <td className={bodyCell} colSpan={2}>
                  Total
                </td>
                <td className={bodyCell} colSpan={16} />
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
