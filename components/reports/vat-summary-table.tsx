"use client"

import {
  type DataTableRowSize,
  dataTableClassNames,
  getDataTableBodyCellClass,
  getDataTableHeaderCellClass,
} from "@/components/data-table/data-table-styles"
import { formatReportNumber } from "@/lib/reports/inventory-valuation"
import { FISCAL_MONTHS, type VatSummaryRow } from "@/lib/reports/vat-summary"
import { cn } from "@/lib/utils"

type VatSummaryTableProps = {
  rows: VatSummaryRow[]
  rowSize: DataTableRowSize
}

export function VatSummaryTable({ rows, rowSize }: VatSummaryTableProps) {
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
            <th className={headerCell}>Particulars</th>
            {FISCAL_MONTHS.map((month) => (
              <th key={month} className={cn(headerCell, "text-right")}>
                {month}
              </th>
            ))}
            <th className={cn(headerCell, "bg-muted/70 text-right")}>Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className={dataTableClassNames.bodyRow}>
              <td className={cn(bodyCell, "font-medium")}>{row.label}</td>
              {row.months.map((value, index) => (
                <td key={index} className={cn(bodyCell, "text-right tabular-nums")}>
                  {value ? formatReportNumber(value) : "-"}
                </td>
              ))}
              <td className={cn(bodyCell, "bg-muted/20 text-right font-medium tabular-nums")}>
                {formatReportNumber(row.total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
