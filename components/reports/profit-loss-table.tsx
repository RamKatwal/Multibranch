"use client"

import {
  type DataTableRowSize,
  dataTableClassNames,
  getDataTableBodyCellClass,
  getDataTableHeaderCellClass,
} from "@/components/data-table/data-table-styles"
import { formatReportNumber } from "@/lib/reports/inventory-valuation"
import type { ProfitLossReport } from "@/lib/reports/profit-loss"
import { cn } from "@/lib/utils"

type ProfitLossTableProps = {
  report: ProfitLossReport
  rowSize: DataTableRowSize
}

export function ProfitLossTable({ report, rowSize }: ProfitLossTableProps) {
  const headerCell = getDataTableHeaderCellClass(rowSize)
  const bodyCell = getDataTableBodyCellClass(rowSize)

  const rows = [
    { label: "Sales", value: report.sales },
    { label: "Direct Income", value: report.directIncome },
    { label: "COGS", value: report.cogs },
    { label: "Gross Profit/Loss", value: report.grossProfit, strong: true },
    { label: "Indirect Income", value: report.indirectIncome },
    { label: "Indirect Expense", value: report.indirectExpense },
    { label: "Net Profit/Loss", value: report.netProfit, strong: true },
  ]

  return (
    <div
      className="thin-scrollbar min-h-0 flex-1 overflow-auto"
      data-slot="data-table"
    >
      <table className={dataTableClassNames.table} data-row-size={rowSize}>
        <thead className="sticky top-0 z-10">
          <tr className={dataTableClassNames.headerRow}>
            <th className={headerCell}>Particulars</th>
            <th className={cn(headerCell, "text-right")}>Balance</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.label}
              className={cn(
                dataTableClassNames.bodyRow,
                row.strong && "bg-muted/10 font-medium"
              )}
            >
              <td className={bodyCell}>{row.label}</td>
              <td className={cn(bodyCell, "text-right tabular-nums")}>
                {formatReportNumber(row.value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
