"use client"

import * as React from "react"

import {
  dataTableClassNames,
  getDataTableHeaderCellClass,
  type DataTableRowSize,
} from "@/components/data-table/data-table-styles"
import { CityLocationInput } from "@/components/onboarding/city-location-input"
import { IconButton } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  generateBranchCode,
  resequenceBranchCodes,
  type QuickBranchRow,
} from "@/lib/onboarding/branch-draft"
import { cn } from "@/lib/utils"
import { MoreVerticalIcon } from "lucide-react"

export type QuickBranchErrors = Record<
  string,
  Partial<Record<keyof QuickBranchRow, string>>
>

type QuickBranchesTableProps = {
  rows: QuickBranchRow[]
  onChange: (rows: QuickBranchRow[]) => void
  companyPrefix: string
  errors?: QuickBranchErrors
  disabled?: boolean
  rowSize?: DataTableRowSize
  className?: string
  onSameAddressForAll?: () => void
  sameAddressDisabled?: boolean
}

const COL_ORDER = [
  "name",
  "location",
  "contactNumber",
  "contactEmail",
] as const

const cellInputClass =
  "h-7 w-full min-w-[6rem] rounded-md border border-input bg-input/20 px-2 text-xs shadow-none md:text-xs dark:bg-input/30"

const lockedCellClass =
  "h-7 w-full min-w-[6rem] rounded-md border border-transparent bg-muted/40 px-2 text-xs text-muted-foreground md:text-xs"

function FieldCell({
  className,
  error,
  children,
}: {
  className?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <td
      className={cn(
        "h-auto min-h-8 border-r border-border px-2 py-1.5 align-top last:border-r-0",
        className
      )}
    >
      <div className="flex flex-col gap-0.5">
        {children}
        {error ? (
          <p className="text-[10px] leading-tight text-destructive">{error}</p>
        ) : null}
      </div>
    </td>
  )
}

function isRowLocked(row: QuickBranchRow) {
  return Boolean(row.locked)
}

/** Onboarding head office draft hides the system-managed code as "-". */
function shouldHideCode(row: QuickBranchRow, index: number) {
  return isRowLocked(row) && !row.existingBranchId && index === 0
}

export function QuickBranchesTable({
  rows,
  onChange,
  companyPrefix,
  errors = {},
  disabled = false,
  rowSize = "sm",
  className,
  onSameAddressForAll,
  sameAddressDisabled = false,
}: QuickBranchesTableProps) {
  function updateRow(
    id: string,
    patch: Partial<QuickBranchRow>,
    opts?: { touchCode?: boolean }
  ) {
    const next = rows.map((row, index) => {
      if (row.id !== id) return row
      if (isRowLocked(row)) return row

      const updated: QuickBranchRow = { ...row, ...patch }

      if (opts?.touchCode) {
        updated.codeAuto = false
      }

      if (updated.codeAuto) {
        updated.code = generateBranchCode(
          companyPrefix,
          updated.location,
          index
        )
      }

      return updated
    })

    onChange(
      opts?.touchCode ? next : resequenceBranchCodes(next, companyPrefix)
    )
  }

  function handlePaste(event: React.ClipboardEvent<HTMLTableSectionElement>) {
    const text = event.clipboardData.getData("text/plain")
    if (!text.includes("\t") && !text.includes("\n")) return

    event.preventDefault()

    const target = event.target as HTMLElement
    const startRow = Number(target.getAttribute("data-row-index") ?? "0")
    const startCol = target.getAttribute("data-col") ?? "name"
    const startColIndex = Math.max(
      0,
      COL_ORDER.indexOf(startCol as (typeof COL_ORDER)[number])
    )

    const pasted = text
      .trimEnd()
      .split(/\r?\n/)
      .filter((line) => line.length > 0)
      .map((line) => line.split("\t"))

    if (pasted.length === 0) return

    const next = rows.map((row) => ({ ...row }))

    pasted.forEach((cells, rowOffset) => {
      const rowIndex = startRow + rowOffset
      if (rowIndex < 0 || rowIndex >= next.length) return
      if (isRowLocked(next[rowIndex]!)) return

      const row = { ...next[rowIndex]! }
      cells.forEach((value, colOffset) => {
        const col = COL_ORDER[startColIndex + colOffset]
        if (!col) return
        row[col] = value.trim()
      })
      row.codeAuto = true
      next[rowIndex] = row
    })

    onChange(resequenceBranchCodes(next, companyPrefix))
  }

  return (
    <div
      className={cn("flex min-h-0 flex-1 flex-col", className)}
      data-slot="data-table"
    >
      <div className="min-h-0 flex-1 overflow-auto">
        <table
          className={cn(dataTableClassNames.table, "min-w-[720px]")}
          data-row-size={rowSize}
        >
          <thead className="sticky top-0 z-10">
            <tr className={dataTableClassNames.headerRow}>
              <th className={cn(getDataTableHeaderCellClass(rowSize), "w-12")}>
                #
              </th>
              <th className={getDataTableHeaderCellClass(rowSize)}>
                Branch Name
              </th>
              <th className={getDataTableHeaderCellClass(rowSize)}>
                <div className="flex items-center justify-between gap-1">
                  <span>Location</span>
                  {onSameAddressForAll ? (
                    <IconButton
                      type="button"
                      variant="ghost"
                      color="neutral"
                      size="32"
                      className="size-6 shrink-0 text-muted-foreground hover:text-foreground"
                      disabled={disabled || sameAddressDisabled}
                      title="Same address for all"
                      aria-label="Same address for all"
                      onClick={onSameAddressForAll}
                    >
                      <MoreVerticalIcon className="size-3.5" />
                    </IconButton>
                  ) : null}
                </div>
              </th>
              <th className={getDataTableHeaderCellClass(rowSize)}>
                Branch Code
              </th>
              <th className={getDataTableHeaderCellClass(rowSize)}>Contact</th>
              <th className={getDataTableHeaderCellClass(rowSize)}>Email</th>
            </tr>
          </thead>
          <tbody onPaste={handlePaste}>
            {rows.map((row, index) => {
              const rowErrors = errors[row.id]
              const locked = isRowLocked(row)
              const hideCode = shouldHideCode(row, index)
              const isExisting = Boolean(row.existingBranchId)

              if (locked) {
                return (
                  <tr
                    key={row.id}
                    className="border-b border-border bg-muted/30"
                  >
                    <td className="h-auto min-h-8 w-12 border-r border-border px-2 py-1.5 align-middle text-muted-foreground tabular-nums">
                      {index + 1}
                    </td>
                    <FieldCell>
                      <div className={lockedCellClass}>{row.name}</div>
                      <p className="text-[10px] leading-tight text-muted-foreground">
                        {isExisting
                          ? "Already created — branch code cannot be changed."
                          : "This is head office — cannot be edited now."}
                      </p>
                    </FieldCell>
                    <FieldCell>
                      <div className={cn(lockedCellClass, "min-w-[9rem]")}>
                        {row.location || "—"}
                      </div>
                    </FieldCell>
                    <FieldCell>
                      <div
                        className={cn(
                          lockedCellClass,
                          "font-mono",
                          hideCode ? "text-center" : "uppercase"
                        )}
                        title={
                          isExisting
                            ? "Branch code cannot be changed after creation"
                            : undefined
                        }
                      >
                        {hideCode ? "-" : row.code || "—"}
                      </div>
                    </FieldCell>
                    <FieldCell>
                      <div className={lockedCellClass}>
                        {row.contactNumber || "—"}
                      </div>
                    </FieldCell>
                    <FieldCell>
                      <div className={cn(lockedCellClass, "min-w-[9rem]")}>
                        {row.contactEmail || "—"}
                      </div>
                    </FieldCell>
                  </tr>
                )
              }

              return (
                <tr
                  key={row.id}
                  className="border-b border-border bg-card transition-colors hover:bg-muted/40"
                >
                  <td className="h-auto min-h-8 w-12 border-r border-border px-2 py-1.5 align-middle text-muted-foreground tabular-nums">
                    {index + 1}
                  </td>
                  <FieldCell error={rowErrors?.name}>
                    <Input
                      data-row-index={index}
                      data-col="name"
                      className={cellInputClass}
                      disabled={disabled}
                      aria-invalid={Boolean(rowErrors?.name)}
                      value={row.name}
                      onChange={(event) =>
                        updateRow(row.id, { name: event.target.value })
                      }
                      placeholder={`Branch-${index}`}
                    />
                  </FieldCell>
                  <FieldCell error={rowErrors?.location}>
                    <CityLocationInput
                      data-row-index={index}
                      data-col="location"
                      className={cn(cellInputClass, "min-w-[9rem]")}
                      disabled={disabled}
                      invalid={Boolean(rowErrors?.location)}
                      value={row.location}
                      onChange={(location) =>
                        updateRow(row.id, { location })
                      }
                      placeholder="City / address"
                    />
                  </FieldCell>
                  <FieldCell error={rowErrors?.code}>
                    <Input
                      data-row-index={index}
                      data-col="code"
                      className={cn(cellInputClass, "font-mono uppercase")}
                      disabled={disabled}
                      aria-invalid={Boolean(rowErrors?.code)}
                      value={row.code}
                      onChange={(event) =>
                        updateRow(
                          row.id,
                          { code: event.target.value.toUpperCase() },
                          { touchCode: true }
                        )
                      }
                      placeholder={`${companyPrefix}-XXX-01`}
                    />
                  </FieldCell>
                  <FieldCell error={rowErrors?.contactNumber}>
                    <Input
                      data-row-index={index}
                      data-col="contactNumber"
                      className={cellInputClass}
                      disabled={disabled}
                      aria-invalid={Boolean(rowErrors?.contactNumber)}
                      value={row.contactNumber}
                      onChange={(event) =>
                        updateRow(row.id, {
                          contactNumber: event.target.value,
                        })
                      }
                      placeholder="Optional"
                    />
                  </FieldCell>
                  <FieldCell error={rowErrors?.contactEmail}>
                    <Input
                      data-row-index={index}
                      data-col="contactEmail"
                      type="email"
                      className={cn(cellInputClass, "min-w-[9rem]")}
                      disabled={disabled}
                      aria-invalid={Boolean(rowErrors?.contactEmail)}
                      value={row.contactEmail}
                      onChange={(event) =>
                        updateRow(row.id, {
                          contactEmail: event.target.value,
                        })
                      }
                      placeholder="Optional"
                    />
                  </FieldCell>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
