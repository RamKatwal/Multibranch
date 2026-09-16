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
import type { TrialBalanceRow } from "@/lib/reports/trial-balance"
import { cn } from "@/lib/utils"

const CATEGORY_ORDER: TrialBalanceRow["category"][] = [
  "Current Assets",
  "Non Current Assets",
  "Current Liability",
  "Non Current Liability",
  "Equity",
  "Income",
  "Expense",
]

type TrialBalanceTableProps = {
  rows: TrialBalanceRow[]
  rowSize: DataTableRowSize
}

export function TrialBalanceTable({ rows, rowSize }: TrialBalanceTableProps) {
  const headerCell = getDataTableHeaderCellClass(rowSize)
  const bodyCell = getDataTableBodyCellClass(rowSize)

  const totals = rows.reduce(
    (sum, row) => ({
      openingDebit: sum.openingDebit + row.openingDebit,
      openingCredit: sum.openingCredit + row.openingCredit,
      transactionDebit: sum.transactionDebit + row.transactionDebit,
      transactionCredit: sum.transactionCredit + row.transactionCredit,
      closingDebit: sum.closingDebit + row.closingDebit,
      closingCredit: sum.closingCredit + row.closingCredit,
    }),
    {
      openingDebit: 0,
      openingCredit: 0,
      transactionDebit: 0,
      transactionCredit: 0,
      closingDebit: 0,
      closingCredit: 0,
    }
  )

  return (
    <div
      className="thin-scrollbar min-h-0 flex-1 overflow-auto"
      data-slot="data-table"
    >
      <table className={dataTableClassNames.table} data-row-size={rowSize}>
        <thead className="sticky top-0 z-10">
          <tr className={dataTableClassNames.headerRow}>
            <th rowSpan={2} className={headerCell}>
              Particulars
            </th>
            <th colSpan={2} className={cn(headerCell, "text-center")}>
              Opening Balance
            </th>
            <th colSpan={2} className={cn(headerCell, "text-center")}>
              Transactions
            </th>
            <th colSpan={2} className={cn(headerCell, "text-center")}>
              Closing Balance
            </th>
          </tr>
          <tr className={dataTableClassNames.headerRow}>
            {Array.from({ length: 3 }).map((_, index) => (
              <Fragment key={index}>
                <th className={cn(headerCell, "text-right")}>Debit (Rs.)</th>
                <th className={cn(headerCell, "text-right")}>Credit (Rs.)</th>
              </Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {CATEGORY_ORDER.map((category) => {
            const categoryRows = rows.filter((row) => row.category === category)
            const categoryTotal = categoryRows.reduce(
              (sum, row) => ({
                openingDebit: sum.openingDebit + row.openingDebit,
                openingCredit: sum.openingCredit + row.openingCredit,
                transactionDebit: sum.transactionDebit + row.transactionDebit,
                transactionCredit: sum.transactionCredit + row.transactionCredit,
                closingDebit: sum.closingDebit + row.closingDebit,
                closingCredit: sum.closingCredit + row.closingCredit,
              }),
              {
                openingDebit: 0,
                openingCredit: 0,
                transactionDebit: 0,
                transactionCredit: 0,
                closingDebit: 0,
                closingCredit: 0,
              }
            )

            return (
              <tr key={category} className={dataTableClassNames.bodyRow}>
                <td className={cn(bodyCell, "font-medium")}>{category}</td>
                <td className={cn(bodyCell, "text-right tabular-nums")}>
                  {formatReportNumber(categoryTotal.openingDebit)}
                </td>
                <td className={cn(bodyCell, "text-right tabular-nums")}>
                  {formatReportNumber(categoryTotal.openingCredit)}
                </td>
                <td className={cn(bodyCell, "text-right tabular-nums")}>
                  {formatReportNumber(categoryTotal.transactionDebit)}
                </td>
                <td className={cn(bodyCell, "text-right tabular-nums")}>
                  {formatReportNumber(categoryTotal.transactionCredit)}
                </td>
                <td className={cn(bodyCell, "text-right tabular-nums")}>
                  {formatReportNumber(categoryTotal.closingDebit)}
                </td>
                <td className={cn(bodyCell, "text-right tabular-nums")}>
                  {formatReportNumber(categoryTotal.closingCredit)}
                </td>
              </tr>
            )
          })}
          <tr className="border-t bg-muted/20 font-medium">
            <td className={bodyCell}>Total</td>
            <td className={cn(bodyCell, "text-right tabular-nums")}>
              {formatCurrency(totals.openingDebit)}
            </td>
            <td className={cn(bodyCell, "text-right tabular-nums")}>
              {formatCurrency(totals.openingCredit)}
            </td>
            <td className={cn(bodyCell, "text-right tabular-nums")}>
              {formatCurrency(totals.transactionDebit)}
            </td>
            <td className={cn(bodyCell, "text-right tabular-nums")}>
              {formatCurrency(totals.transactionCredit)}
            </td>
            <td className={cn(bodyCell, "text-right tabular-nums")}>
              {formatCurrency(totals.closingDebit)}
            </td>
            <td className={cn(bodyCell, "text-right tabular-nums")}>
              {formatCurrency(totals.closingCredit)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
