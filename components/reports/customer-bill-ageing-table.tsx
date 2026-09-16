"use client"

import {
  type DataTableRowSize,
  dataTableClassNames,
  getDataTableBodyCellClass,
  getDataTableHeaderCellClass,
} from "@/components/data-table/data-table-styles"
import { Badge } from "@/components/ui/badge"
import { formatLongDate } from "@/lib/format"
import { formatReportNumber } from "@/lib/reports/inventory-valuation"
import type { CustomerBillAgeingRow } from "@/lib/reports/customer-bill-ageing"
import { cn } from "@/lib/utils"

const COLUMN_COUNT = 9

const STATUS_BADGE_CLASSNAME: Record<string, string> = {
  Paid: "border-transparent bg-success/15 text-success",
  "Partially Paid": "border-transparent bg-warning/15 text-warning-foreground dark:text-warning",
  Unpaid: "border-transparent bg-destructive/15 text-destructive",
}

type CustomerBillAgeingTableProps = {
  rows: CustomerBillAgeingRow[]
  rowSize: DataTableRowSize
  emptyMessage?: string
}

export function CustomerBillAgeingTable({
  rows,
  rowSize,
  emptyMessage = "No bills match the selected filters.",
}: CustomerBillAgeingTableProps) {
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
            <th className={headerCell}>Date</th>
            <th className={headerCell}>Due Date</th>
            <th className={headerCell}>Invoice Number</th>
            <th className={headerCell}>Customer</th>
            <th className={cn(headerCell, "text-right")}>Total Amount</th>
            <th className={cn(headerCell, "text-right")}>Paid Amount</th>
            <th className={cn(headerCell, "text-right")}>Remaining Balance</th>
            <th className={headerCell}>Status</th>
            <th className={cn(headerCell, "text-right")}>Overdue Days</th>
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
              <tr key={row.billId} className={dataTableClassNames.bodyRow}>
                <td className={cn(bodyCell, "text-muted-foreground tabular-nums")}>
                  {formatLongDate(row.date)}
                </td>
                <td className={cn(bodyCell, "text-muted-foreground tabular-nums")}>
                  {formatLongDate(row.dueDate)}
                </td>
                <td className={cn(bodyCell, "font-mono text-xs")}>{row.billId}</td>
                <td className={cn(bodyCell, "font-medium")}>{row.customerName}</td>
                <td className={cn(bodyCell, "text-right tabular-nums")}>
                  {formatReportNumber(row.totalAmount)}
                </td>
                <td className={cn(bodyCell, "text-right tabular-nums")}>
                  {formatReportNumber(row.paidAmount)}
                </td>
                <td className={cn(bodyCell, "text-right font-medium tabular-nums")}>
                  {formatReportNumber(row.remainingBalance)}
                </td>
                <td className={bodyCell}>
                  <Badge className={STATUS_BADGE_CLASSNAME[row.status]}>
                    {row.status}
                  </Badge>
                </td>
                <td className={cn(bodyCell, "text-right tabular-nums")}>
                  {row.overdueDays}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
