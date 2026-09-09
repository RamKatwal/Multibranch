"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { DemoFillFab } from "@/components/demo-fill-fab"
import { QuickBranchesTable } from "@/components/onboarding/quick-branches-table"
import { SettingUpScreen } from "@/components/onboarding/setting-up-screen"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  saveActiveBranchId,
  saveBranches,
  todayIsoDate,
} from "@/lib/branches/storage"
import {
  getBranchLimit,
  persistBranchLimit,
} from "@/lib/branches/subscription"
import {
  buildDefaultBranchRows,
  companyCodePrefix,
  DEMO_BRANCH_LOCATIONS,
  resequenceBranchCodes,
  type QuickBranchRow,
} from "@/lib/onboarding/branch-draft"
import { loadCompanyDraft } from "@/lib/onboarding/company-storage"
import { homeAfterOrgCreated } from "@/lib/organizations/home-after-created"
import {
  apiJson,
  clearOnboardingDraftsClient,
  saveOnboardingSessionClient,
} from "@/lib/onboarding/client-session"
import type { OnboardingSessionData } from "@/lib/onboarding/session-types"
import type { Branch } from "@/types/branch"

type RowErrors = Record<string, Partial<Record<keyof QuickBranchRow, string>>>

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function validateRows(rows: QuickBranchRow[]): RowErrors {
  const errors: RowErrors = {}
  const seenCodes = new Set<string>()

  rows.forEach((row, index) => {
    const rowError: Partial<Record<keyof QuickBranchRow, string>> = {}
    const isLocked = Boolean(row.locked)
    const isHeadOffice = isLocked && !row.existingBranchId && index === 0

    if (isLocked) {
      if (row.code.trim()) {
        seenCodes.add(row.code.trim().toUpperCase())
      }
      return
    }

    if (!row.name.trim()) {
      rowError.name = "Required"
    }
    if (!row.location.trim()) {
      rowError.location = "Required"
    }

    // Head office code is system-managed (shown as "-"); still unique under the hood.
    if (!isHeadOffice) {
      if (!row.code.trim()) {
        rowError.code = "Required"
      } else if (!/^[A-Za-z0-9_-]+$/.test(row.code.trim())) {
        rowError.code = "Invalid"
      } else {
        const normalized = row.code.trim().toUpperCase()
        if (seenCodes.has(normalized)) {
          rowError.code = "Duplicate"
        } else {
          seenCodes.add(normalized)
        }
      }
    } else if (row.code.trim()) {
      seenCodes.add(row.code.trim().toUpperCase())
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

function rowsToBranches(rows: QuickBranchRow[]): Branch[] {
  const createdAt = todayIsoDate()
  const stamp = Date.now()
  return rows.map((row, index) => {
    const code = row.code.trim().toUpperCase()
    const slug = code
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
    return {
      id: `br-${slug || "branch"}-${stamp}-${index}`,
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

export default function BranchesSetupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")?.trim() ?? ""
  const emailQuery = email ? `?email=${encodeURIComponent(email)}` : ""
  const fromBranchManagement =
    searchParams.get("from")?.trim() === "branch-management"
  const branchManagementReturnPath =
    "/configurations/general/branch-management"

  const [companyPrefix, setCompanyPrefix] = React.useState("BRN")
  const [branchLimit, setBranchLimit] = React.useState(1)
  const [rows, setRows] = React.useState<QuickBranchRow[]>([])
  const [errors, setErrors] = React.useState<RowErrors>({})
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSettingUp, setIsSettingUp] = React.useState(false)
  const [hydrated, setHydrated] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      let draft = loadCompanyDraft()
      try {
        const data = await apiJson<{ session: OnboardingSessionData | null }>(
          "/api/onboarding/status"
        )
        if (cancelled) return
        if (data.session) {
          saveOnboardingSessionClient(data.session)
          draft = data.session.company ?? draft
        }
      } catch {
        // fall through to local draft
      }

      if (!draft) {
        router.replace(
          fromBranchManagement
            ? branchManagementReturnPath
            : `/onboarding/company${emailQuery}`
        )
        return
      }

      const limit = getBranchLimit()
      const prefix = companyCodePrefix(draft.companyName)
      setCompanyPrefix(prefix)
      setBranchLimit(limit)
      setRows(buildDefaultBranchRows(limit, draft))
      setHydrated(true)
    })()
    return () => {
      cancelled = true
    }
  }, [emailQuery, fromBranchManagement, router])

  async function finishSetup(branches: Branch[]) {
    persistBranchLimit(branchLimit)
    saveBranches(branches)
    if (branches[0]) {
      saveActiveBranchId(branches[0].id)
    }

    const provisionToken = `prov_${Date.now().toString(36)}`
    setIsLoading(true)

    try {
      const res = await apiJson<{
        session: OnboardingSessionData
        alreadyProvisioned?: boolean
      }>("/api/onboarding/branches", {
        method: "POST",
        body: JSON.stringify({
          branches: branches.map((b) => ({
            id: b.id,
            name: b.name,
            code: b.code,
            address: b.address,
            contactNumber: b.contactNumber,
            contactEmail: b.contactEmail,
          })),
          provisionToken,
        }),
      })
      saveOnboardingSessionClient(res.session)
      if (!fromBranchManagement) {
        clearOnboardingDraftsClient()
      }
      if (fromBranchManagement) {
        router.push(branchManagementReturnPath)
        return
      }
      const homePath = homeAfterOrgCreated(res.session.companyId)
      setIsSettingUp(true)
      window.setTimeout(() => {
        router.push(homePath)
      }, 2500)
    } catch {
      // Demo resilience: still enter the workspace with local branches
      if (!fromBranchManagement) {
        clearOnboardingDraftsClient()
      }
      if (fromBranchManagement) {
        router.push(branchManagementReturnPath)
        return
      }
      setIsSettingUp(true)
      window.setTimeout(() => {
        router.push(homeAfterOrgCreated())
      }, 2500)
    } finally {
      setIsLoading(false)
    }
  }

  function handleCreateBranches() {
    if (rows.length === 0) return
    const nextErrors = validateRows(rows)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    finishSetup(rowsToBranches(rows))
  }

  function applySameAddressForAll() {
    const hqLocation = rows[0]?.location?.trim()
    if (!hqLocation) return
    setRows((current) =>
      resequenceBranchCodes(
        current.map((row) =>
          row.locked
            ? row
            : { ...row, location: hqLocation, codeAuto: true }
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

  if (!hydrated) {
    return null
  }

  if (isSettingUp) {
    return <SettingUpScreen open />
  }

  const canSameAddress = Boolean(rows[0]?.location?.trim()) && rows.length > 1

  return (
    <>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <PageHeader
          title="Quick branch setup"
          count={`${branchLimit} / ${branchLimit}`}
        />

        <div className="flex max-h-[min(36rem,65svh)] min-h-0 flex-col overflow-hidden rounded-xl border bg-card shadow-xs">
          <div className="border-b px-3 py-2.5">
            <p className="text-xs text-muted-foreground">
              Row 1 is your head office from company details.
            </p>
          </div>

          <QuickBranchesTable
            rows={rows}
            companyPrefix={companyPrefix}
            disabled={isLoading}
            onSameAddressForAll={applySameAddressForAll}
            sameAddressDisabled={!canSameAddress}
            onChange={(next) => {
              setRows(next)
              setErrors({})
            }}
            errors={errors}
            className="min-h-0"
          />

          <div className="flex flex-col-reverse gap-2 border-t bg-muted/20 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              {rows.length} branch{rows.length === 1 ? "" : "es"} ready to create
            </p>
            <Button
              type="button"
              size="sm"
              disabled={isLoading || rows.length === 0}
              onClick={handleCreateBranches}
            >
              {isLoading ? (
                <Spinner size={16} variant="default" />
              ) : (
                <>
                  Save all ({rows.length})
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    className="size-4"
                    data-icon="inline-end"
                  />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {!isLoading ? (
        <DemoFillFab label="Fill demo branches" onFill={fillDemoBranches} />
      ) : null}
    </>
  )
}
