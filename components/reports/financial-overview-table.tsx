"use client"

import Link from "next/link"

import {
  type DataTableRowSize,
  dataTableClassNames,
  getDataTableBodyCellClass,
  getDataTableHeaderCellClass,
} from "@/components/data-table/data-table-styles"
import { formatCurrency } from "@/lib/format"
import type { FinancialOverviewRow } from "@/lib/reports/financial-overview"
import { cn } from "@/lib/utils"

type FinancialOverviewTableProps = {
  rows: FinancialOverviewRow[]
  rowSize: DataTableRowSize
}

export function FinancialOverviewTable({
  rows,
  rowSize,
}: FinancialOverviewTableProps) {
  const headerCell = getDataTableHeaderCellClass(rowSize)
  const bodyCell = getDataTableBodyCellClass(rowSize)
  const total = rows.reduce((sum, row) => sum + row.closingBalance, 0)

  return (
    <div
      className="thin-scrollbar min-h-0 flex-1 overflow-auto"
      data-slot="data-table"
    >
      <table className={dataTableClassNames.table} data-row-size={rowSize}>
        <thead className="sticky top-0 z-10">
          <tr className={dataTableClassNames.headerRow}>
            <th className={headerCell}>Account</th>
            <th className={cn(headerCell, "text-right")}>Opening Balance</th>
            <th className={cn(headerCell, "text-right")}>In</th>
            <th className={cn(headerCell, "text-right")}>Out</th>
            <th className={cn(headerCell, "text-right")}>Closing Balance</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.glCode} className={dataTableClassNames.bodyRow}>
              <td className={cn(bodyCell, "font-medium")}>
                <Link
                  href={`/reports/financial-transactions?accountId=${row.glCode}`}
                  className="text-primary underline-offset-2 hover:underline"
                >
                  {row.account}
                </Link>
              </td>
              <td className={cn(bodyCell, "text-right tabular-nums")}>
                {row.openingBalance}
              </td>
              <td className={cn(bodyCell, "text-right tabular-nums")}>
                {row.inAmount}
              </td>
              <td className={cn(bodyCell, "text-right tabular-nums")}>
                {row.outAmount}
              </td>
              <td className={cn(bodyCell, "text-right tabular-nums")}>
                {row.closingBalance}
              </td>
            </tr>
          ))}
          <tr className="border-t bg-muted/20 font-medium">
            <td className={bodyCell}>Total</td>
            <td className={cn(bodyCell, "text-right tabular-nums")}>
              {formatCurrency(0)}
            </td>
            <td className={cn(bodyCell, "text-right tabular-nums")}>
              {formatCurrency(0)}
            </td>
            <td className={cn(bodyCell, "text-right tabular-nums")}>
              {formatCurrency(0)}
            </td>
            <td className={cn(bodyCell, "text-right tabular-nums")}>
              {formatCurrency(total)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
