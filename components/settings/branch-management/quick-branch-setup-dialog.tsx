"use client"

import * as React from "react"

import { QuickBranchesTable } from "@/components/onboarding/quick-branches-table"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import {
  FormDialogBody,
  FormDialogContent,
  FormDialogDescription,
  FormDialogFooter,
  FormDialogHeader,
  FormDialogTitle,
} from "@/components/ui/form-dialog"
import { Spinner } from "@/components/ui/spinner"
import {
  createBranchId,
  todayIsoDate,
} from "@/lib/branches/storage"
import { getCurrentCompanyProfile } from "@/lib/companies/profile"
import {
  buildQuickSetupRowsFromExisting,
  companyCodePrefix,
  DEMO_BRANCH_LOCATIONS,
  resequenceBranchCodes,
  type QuickBranchRow,
} from "@/lib/onboarding/branch-draft"
import type { Branch } from "@/types/branch"

type RowErrors = Record<string, Partial<Record<keyof QuickBranchRow, string>>>

type QuickBranchSetupDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  existingBranches: Branch[]
  branchLimit: number
  onSave: (created: Branch[]) => void
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function validateEditableRows(rows: QuickBranchRow[]): RowErrors {
  const errors: RowErrors = {}
  const seenCodes = new Set<string>()

  rows.forEach((row) => {
    if (row.locked) {
      if (row.code.trim()) {
        seenCodes.add(row.code.trim().toUpperCase())
      }
      return
    }

    const rowError: Partial<Record<keyof QuickBranchRow, string>> = {}

    if (!row.name.trim()) {
      rowError.name = "Required"
    }
    if (!row.location.trim()) {
      rowError.location = "Required"
    }

    if (!row.code.trim()) {
      rowError.code = "Required"
    } else if (!/^[A-Za-z0-9_-]+$/.test(row.code.trim())) {
      rowError.code = "Invalid"
    } else {
      const normalized = row.code.trim().toUpperCase()
      if (seenCodes.has(normalized)) {
        rowError.code = "Already used"
      } else {
        seenCodes.add(normalized)
      }
    }

    if (row.contactEmail.trim() && !isValidEmail(row.contactEmail.trim())) {
      rowError.contactEmail = "Invalid email"
    }

    if (Object.keys(rowError).length > 0) {
      errors[row.id] = rowError
    }
  })

  return errors
}

function rowsToNewBranches(rows: QuickBranchRow[]): Branch[] {
  const createdAt = todayIsoDate()
  return rows
    .filter((row) => !row.existingBranchId)
    .map((row) => {
      const code = row.code.trim().toUpperCase()
      return {
        id: createBranchId(code),
        name: row.name.trim(),
        code,
        address: row.location.trim(),
        contactNumber: row.contactNumber.trim(),
        contactEmail: row.contactEmail.trim(),
        status: "active" as const,
        createdAt,
      }
    })
}

export function QuickBranchSetupDialog({
  open,
  onOpenChange,
  existingBranches,
  branchLimit,
  onSave,
}: QuickBranchSetupDialogProps) {
  const [companyPrefix, setCompanyPrefix] = React.useState("BRN")
  const [rows, setRows] = React.useState<QuickBranchRow[]>([])
  const [errors, setErrors] = React.useState<RowErrors>({})
  const [isSaving, setIsSaving] = React.useState(false)

  const existingCount = existingBranches.length
  const newRowCount = rows.filter((row) => !row.existingBranchId).length
  const editableCount = rows.filter((row) => !row.locked).length
  const allSlotsFilled = existingCount >= branchLimit

  React.useEffect(() => {
    if (!open) return

    const profile = getCurrentCompanyProfile()
    const companyName = profile?.companyName ?? "Branch"
    const prefix = companyCodePrefix(companyName)

    setCompanyPrefix(prefix)
    setRows(
      buildQuickSetupRowsFromExisting(
        existingBranches,
        branchLimit,
        companyName,
        profile
          ? {
              companyName: profile.companyName,
              email: profile.email,
              contact: profile.contact,
              pan: profile.pan,
              registeredWithVat: profile.registeredWithVat,
              industryType: profile.industryType,
              province: profile.province,
              district: profile.district,
              fullAddress: profile.fullAddress,
            }
          : null
      )
    )
    setErrors({})
    setIsSaving(false)
  }, [open, existingBranches, branchLimit])

  function applySameAddressForAll() {
    const seedLocation =
      rows.find((row) => row.locked && row.location.trim())?.location.trim() ??
      rows.find((row) => row.location.trim())?.location.trim()
    if (!seedLocation) return

    setRows((current) =>
      resequenceBranchCodes(
        current.map((row) =>
          row.locked
            ? row
            : { ...row, location: seedLocation, codeAuto: true }
        ),
        companyPrefix
      )
    )
    setErrors({})
  }

  function fillDemoBranches() {
    let demoIndex = 0
    setRows((current) =>
      resequenceBranchCodes(
        current.map((row) => {
          if (row.locked) return row
          const location =
            DEMO_BRANCH_LOCATIONS[demoIndex % DEMO_BRANCH_LOCATIONS.length]
          demoIndex += 1
          return {
            ...row,
            location,
            contactNumber: "",
            contactEmail: "",
            codeAuto: true,
          }
        }),
        companyPrefix
      )
    )
    setErrors({})
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (allSlotsFilled || newRowCount === 0) {
      onOpenChange(false)
      return
    }

    const nextErrors = validateEditableRows(rows)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setIsSaving(true)
    const created = rowsToNewBranches(rows)
    onSave(created)
    setIsSaving(false)
    onOpenChange(false)
  }

  const canSameAddress =
    editableCount > 0 &&
    Boolean(
      rows.some((row) => row.locked && row.location.trim()) ||
        rows.some((row) => !row.locked && row.location.trim())
    )

  const description = allSlotsFilled
    ? `All ${branchLimit} branch slots are already created. Branch codes cannot be changed.`
    : existingCount > 0
      ? `${existingCount} of ${branchLimit} branches already exist (codes locked). Fill the remaining ${editableCount} row${editableCount === 1 ? "" : "s"}.`
      : `Create up to ${branchLimit} branches. Branch codes cannot be changed after creation.`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FormDialogContent size="5xl" className="max-h-[min(820px,calc(100svh-2rem))]">
        <FormDialogHeader>
          <FormDialogTitle>Quick branch setup</FormDialogTitle>
          <FormDialogDescription>{description}</FormDialogDescription>
        </FormDialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <FormDialogBody className="min-h-0 flex-1 gap-0 overflow-hidden p-0">
            <div className="flex shrink-0 items-center justify-between gap-2 border-b px-5 py-2.5">
              <p className="text-xs text-muted-foreground">
                {existingCount > 0
                  ? "Existing branches are read-only. Edit only empty rows."
                  : "Use one row per branch. Codes auto-fill from location."}
              </p>
              {editableCount > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  color="neutral"
                  size="32"
                  className="h-7 shrink-0 text-xs"
                  disabled={isSaving}
                  onClick={fillDemoBranches}
                >
                  Fill demo
                </Button>
              ) : null}
            </div>

            <QuickBranchesTable
              rows={rows}
              companyPrefix={companyPrefix}
              disabled={isSaving || allSlotsFilled}
              onSameAddressForAll={
                editableCount > 0 ? applySameAddressForAll : undefined
              }
              sameAddressDisabled={!canSameAddress}
              onChange={(next) => {
                setRows(next)
                setErrors({})
              }}
              errors={errors}
              className="min-h-[16rem]"
            />
          </FormDialogBody>

          <FormDialogFooter className="sm:justify-between">
            <p className="text-xs text-muted-foreground">
              {allSlotsFilled
                ? "No new branches to create"
                : `${newRowCount} new branch${newRowCount === 1 ? "" : "es"} · ${existingCount} existing`}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                color="neutral"
                disabled={isSaving}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving || (!allSlotsFilled && newRowCount === 0)}
              >
                {isSaving ? (
                  <Spinner size={16} variant="default" />
                ) : allSlotsFilled ? (
                  "Close"
                ) : (
                  `Create ${newRowCount} branch${newRowCount === 1 ? "" : "es"}`
                )}
              </Button>
            </div>
          </FormDialogFooter>
        </form>
      </FormDialogContent>
    </Dialog>
  )
}
