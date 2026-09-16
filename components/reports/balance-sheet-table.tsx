"use client"

import {
  type DataTableRowSize,
  dataTableClassNames,
  getDataTableBodyCellClass,
  getDataTableHeaderCellClass,
} from "@/components/data-table/data-table-styles"
import { formatReportNumber } from "@/lib/reports/inventory-valuation"
import type { BalanceSheetReport } from "@/lib/reports/balance-sheet"
import { cn } from "@/lib/utils"

type BalanceSheetTableProps = {
  report: BalanceSheetReport
  rowSize: DataTableRowSize
}

export function BalanceSheetTable({ report, rowSize }: BalanceSheetTableProps) {
  const headerCell = getDataTableHeaderCellClass(rowSize)
  const bodyCell = getDataTableBodyCellClass(rowSize)

  const rows = [
    { label: "Asset", value: report.asset },
    { label: "Liabilities", value: report.liabilities },
    { label: "Equity", value: report.equity },
    {
      label: "Difference in Opening Balance",
      value: report.differenceInOpeningBalance,
    },
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
            <tr key={row.label} className={dataTableClassNames.bodyRow}>
              <td className={cn(bodyCell, "font-medium")}>{row.label}</td>
              <td className={cn(bodyCell, "text-right tabular-nums")}>
                {formatReportNumber(row.value)}
              </td>
            </tr>
          ))}
          <tr className="border-t bg-muted/20 font-medium">
            <td className={bodyCell}>Total of Liabilities and Equity</td>
            <td className={cn(bodyCell, "text-right tabular-nums")}>
              {formatReportNumber(report.totalLiabilitiesAndEquity)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
