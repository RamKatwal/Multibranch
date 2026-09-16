"use client"

import Link from "next/link"

import {
  type DataTableRowSize,
  dataTableClassNames,
  getDataTableBodyCellClass,
  getDataTableHeaderCellClass,
} from "@/components/data-table/data-table-styles"
import { formatCurrency, formatLongDate } from "@/lib/format"
import { formatReportNumber } from "@/lib/reports/inventory-valuation"
import type { PurchaseRegisterRow } from "@/lib/reports/purchase-register"
import { cn } from "@/lib/utils"

const COLUMN_COUNT = 10

type PurchaseRegisterTableProps = {
  rows: PurchaseRegisterRow[]
  rowSize: DataTableRowSize
  emptyMessage?: string
}

export function PurchaseRegisterTable({
  rows,
  rowSize,
  emptyMessage = "No purchases match the selected filters.",
}: PurchaseRegisterTableProps) {
  const headerCell = getDataTableHeaderCellClass(rowSize)
  const bodyCell = getDataTableBodyCellClass(rowSize)
  const total = rows.reduce((sum, row) => sum + row.totalPurchaseOrImports, 0)

  return (
    <div
      className="thin-scrollbar min-h-0 flex-1 overflow-auto"
      data-slot="data-table"
    >
      <table className={dataTableClassNames.table} data-row-size={rowSize}>
        <thead className="sticky top-0 z-10">
          <tr className={dataTableClassNames.headerRow}>
            <th className={headerCell}>Date</th>
            <th className={headerCell}>Bill No</th>
            <th className={headerCell}>Supplier&apos;s Name</th>
            <th className={headerCell}>Supplier&apos;s PAN Number</th>
            <th className={cn(headerCell, "text-right")}>Price (Rs.)</th>
            <th className={cn(headerCell, "text-right")}>Tax (Rs.)</th>
            <th className={cn(headerCell, "text-right")}>
              Total Purchase/Imports (Rs.)
            </th>
            <th className={cn(headerCell, "text-right")}>
              Price of Goods/Services Imported
            </th>
            <th className={headerCell}>Country of Origin</th>
            <th className={headerCell}>Import Declaration No.</th>
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
                <tr key={row.id} className={dataTableClassNames.bodyRow}>
                  <td className={cn(bodyCell, "text-muted-foreground tabular-nums")}>
                    {formatLongDate(row.date)}
                  </td>
                  <td className={cn(bodyCell, "font-mono text-xs")}>
                    <Link
                      href="/purchase/order"
                      className="text-primary underline-offset-2 hover:underline"
                      title="Open Purchase Order module"
                    >
                      {row.id}
                    </Link>
                  </td>
                  <td className={cn(bodyCell, "font-medium")}>{row.supplierName}</td>
                  <td className={cn(bodyCell, "font-mono text-xs text-muted-foreground")}>
                    {row.supplierPan}
                  </td>
                  <td className={cn(bodyCell, "text-right tabular-nums")}>
                    {formatReportNumber(row.price)}
                  </td>
                  <td className={cn(bodyCell, "text-right tabular-nums")}>
                    {formatReportNumber(row.tax)}
                  </td>
                  <td className={cn(bodyCell, "text-right tabular-nums")}>
                    {formatReportNumber(row.totalPurchaseOrImports)}
                  </td>
                  <td className={cn(bodyCell, "text-right tabular-nums")}>
                    {row.importPrice || "-"}
                  </td>
                  <td className={cn(bodyCell, "text-muted-foreground")}>
                    {row.countryOfOrigin}
                  </td>
                  <td className={cn(bodyCell, "text-muted-foreground")}>
                    {row.importDeclarationNo}
                  </td>
                </tr>
              ))}
              <tr className="border-t bg-muted/20 font-medium">
                <td className={bodyCell} colSpan={6}>
                  Total
                </td>
                <td className={cn(bodyCell, "text-right tabular-nums")}>
                  {formatCurrency(total)}
                </td>
                <td className={bodyCell} colSpan={3} />
              </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  )
}
