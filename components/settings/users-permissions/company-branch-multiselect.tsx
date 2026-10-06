"use client"

import * as React from "react"
import { ChevronsUpDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  branchChipLabel,
  getCompanyTone,
  RemovableStatusChip,
  StatusChip,
} from "@/components/settings/users-permissions/grouped-branch-chips"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  findCompanyForBranch,
  getBranchLabel,
  getCompanyById,
  getCompanyOptions,
  groupBranchesByCompany,
} from "@/lib/companies/options"
import { cn } from "@/lib/utils"

export type CompanyBranchSelection = {
  companyIds: string[]
  branchIds: string[]
}

type CompanyBranchMultiselectProps = {
  value: CompanyBranchSelection
  onChange: (value: CompanyBranchSelection) => void
  placeholder?: string
  disabled?: boolean
  /** When set, only these branches (and their companies) are selectable. */
  allowedBranchIds?: string[]
  /** When false, closes the picker (e.g. parent dialog closed). */
  active?: boolean
  className?: string
  id?: string
  "aria-invalid"?: boolean
}

function deriveCompanyIds(branchIds: string[]) {
  const ids = new Set<string>()
  for (const branchId of branchIds) {
    const company = findCompanyForBranch(branchId)
    if (company) ids.add(company.id)
  }
  return Array.from(ids)
}

export function CompanyBranchMultiselect({
  value,
  onChange,
  placeholder = "Select companies & branches…",
  disabled,
  allowedBranchIds,
  active = true,
  className,
  id,
  "aria-invalid": ariaInvalid,
}: CompanyBranchMultiselectProps) {
  const [open, setOpen] = React.useState(false)
  const allowedSet = React.useMemo(
    () => (allowedBranchIds ? new Set(allowedBranchIds) : null),
    [allowedBranchIds]
  )

  const companies = React.useMemo(() => {
    const all = getCompanyOptions()
    if (!allowedSet) return all

    return all
      .map((company) => ({
        ...company,
        branches: company.branches.filter((branch) => allowedSet.has(branch.id)),
      }))
      .filter((company) => company.branches.length > 0)
  }, [allowedSet])

  React.useEffect(() => {
    if (!active) {
      setOpen(false)
    }
  }, [active])

  const selectedGroups = React.useMemo(
    () => groupBranchesByCompany(value.branchIds),
    [value.branchIds]
  )

  function applyBranchIds(nextBranchIds: string[]) {
    const filtered = allowedSet
      ? nextBranchIds.filter((id) => allowedSet.has(id))
      : nextBranchIds
    onChange({
      companyIds: deriveCompanyIds(filtered),
      branchIds: filtered,
    })
  }

  function toggleBranch(branchId: string) {
    if (allowedSet && !allowedSet.has(branchId)) return
    const selected = value.branchIds.includes(branchId)
    applyBranchIds(
      selected
        ? value.branchIds.filter((id) => id !== branchId)
        : [...value.branchIds, branchId]
    )
  }

  function removeBranch(branchId: string, event: React.MouseEvent) {
    event.preventDefault()
    event.stopPropagation()
    applyBranchIds(value.branchIds.filter((id) => id !== branchId))
  }

  const emptyHint =
    allowedSet && companies.length === 0
      ? "No companies or branches for this role"
      : "No company or branch found."

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={disabled || (allowedSet !== null && companies.length === 0)}
        render={
          <button
            id={id}
            type="button"
            disabled={disabled || (allowedSet !== null && companies.length === 0)}
            aria-invalid={ariaInvalid}
            aria-haspopup="dialog"
            className={cn(
              "flex min-h-9 w-full cursor-pointer justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-1.5 text-left text-sm shadow-xs outline-none transition-[color,box-shadow] select-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
              selectedGroups.length === 0
                ? "items-center text-muted-foreground"
                : "items-start",
              className
            )}
          />
        }
      >
        <span className="flex min-w-0 flex-1 flex-col items-start gap-1.5 py-0.5 text-left">
          {selectedGroups.length === 0 ? (
            <span>{placeholder}</span>
          ) : (
            selectedGroups.map((group) => (
              <span key={group.companyId} className="flex flex-col items-start gap-1">
                <StatusChip
                  label={group.companyName}
                  tone={getCompanyTone(group.companyId)}
                />
                <span className="flex flex-wrap items-center gap-1">
                  {group.branches.map((branch) => (
                    <RemovableStatusChip
                      key={branch.id}
                      label={branchChipLabel(branch)}
                      tone={getCompanyTone(branch.companyId)}
                      removeLabel={`Remove ${group.companyName} ${branchChipLabel(branch)}`}
                      onRemove={(event) => removeBranch(branch.id, event)}
                    />
                  ))}
                </span>
              </span>
            ))
          )}
        </span>
        <ChevronsUpDownIcon className="mt-0.5 size-4 shrink-0 opacity-50" />
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-[var(--anchor-width)] p-0"
      >
        <Command>
          <CommandInput placeholder="Search companies or branches…" />
          <CommandList className="max-h-64">
            <CommandEmpty>{emptyHint}</CommandEmpty>

            {companies.map((company, index) => (
              <React.Fragment key={company.id}>
                {index > 0 ? <CommandSeparator /> : null}
                <CommandGroup heading={company.name}>
                  {company.branches.map((branch) => {
                    const checked = value.branchIds.includes(branch.id)

                    return (
                      <CommandItem
                        key={branch.id}
                        value={`${company.name} ${branch.name} ${branch.code} ${branch.isHeadOffice ? "head office headoffice hq" : ""}`}
                        data-checked={checked ? "true" : undefined}
                        onSelect={() => toggleBranch(branch.id)}
                      >
                        <span className="min-w-0 flex-1 truncate">
                          {branch.name}
                          {branch.isHeadOffice ? (
                            <span className="text-muted-foreground">
                              {" "}
                              · Head Office
                            </span>
                          ) : null}
                        </span>
                        <span className="shrink-0 text-[0.625rem] tracking-wide text-muted-foreground">
                          {branch.code}
                        </span>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              </React.Fragment>
            ))}
          </CommandList>
        </Command>

        <div className="flex items-center justify-between gap-2 border-t px-3 py-2">
          <p className="text-[0.6875rem] text-muted-foreground">
            {value.branchIds.length === 0
              ? allowedSet
                ? "Pick from this role’s companies & branches"
                : "Pick any companies and branches"
              : `${value.companyIds.length} compan${value.companyIds.length === 1 ? "y" : "ies"}, ${value.branchIds.length} branch${value.branchIds.length === 1 ? "" : "es"}`}
          </p>
          <Button type="button" size="32" onClick={() => setOpen(false)}>
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function getCompanyNamesForIds(companyIds: string[]) {
  return companyIds
    .map((id) => getCompanyById(id)?.name)
    .filter((name): name is string => Boolean(name))
}
