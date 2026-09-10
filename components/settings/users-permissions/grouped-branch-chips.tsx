"use client"

import type { MouseEvent, ReactNode } from "react"
import { XIcon } from "lucide-react"

import {
  getBranchesByIds,
  getCompanyOptions,
  groupBranchesByCompany,
  type ResolvedBranchOption,
} from "@/lib/companies/options"
import { cn } from "@/lib/utils"
import type { Group } from "@/types/group"
import type { UserEntityAssignment } from "@/types/user"

type StatusChipTone = {
  color: string
}

const statusChipBaseClass =
  "inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-background px-2 py-0.5 text-xs font-normal leading-none text-foreground"

const companyToneColors = [
  "hsl(199 89% 48%)",
  "hsl(258 90% 58%)",
  "hsl(160 84% 39%)",
  "hsl(38 92% 50%)",
  "hsl(350 89% 60%)",
  "hsl(173 80% 40%)",
  "hsl(25 95% 53%)",
  "hsl(239 84% 67%)",
  "hsl(292 84% 54%)",
  "hsl(84 81% 44%)",
  "hsl(330 81% 60%)",
  "hsl(189 94% 43%)",
]

function companyColorIndex(companyId: string) {
  const companies = getCompanyOptions()
  const index = companies.findIndex((company) => company.id === companyId)
  if (index >= 0) return index
  return [...companyId].reduce((hash, char) => hash + char.charCodeAt(0), 0)
}

export function getCompanyTone(companyId: string): StatusChipTone {
  const index = companyColorIndex(companyId)
  const paletteColor = companyToneColors[index]
  if (paletteColor) {
    return { color: paletteColor }
  }
  const hue = Math.round((index * 137.508) % 360)
  return { color: `hsl(${hue} 72% 46%)` }
}

export function branchChipLabel(branch: ResolvedBranchOption) {
  return branch.isHeadOffice ? "Head Office" : branch.name
}

export function StatusChip({
  label,
  tone,
  className,
}: {
  label: string
  tone: StatusChipTone
  className?: string
}) {
  return (
    <span className={cn(statusChipBaseClass, className)}>
      <span
        className="size-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: tone.color }}
        aria-hidden
      />
      <span className="truncate">{label}</span>
    </span>
  )
}

export function RemovableStatusChip({
  label,
  tone,
  onRemove,
  removeLabel,
}: {
  label: string
  tone: StatusChipTone
  onRemove: (event: MouseEvent) => void
  removeLabel: string
}) {
  return (
    <span className={cn(statusChipBaseClass, "gap-1 py-0.5 pr-1 pl-2")}>
      <span
        className="size-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: tone.color }}
        aria-hidden
      />
      <span className="truncate">{label}</span>
      <span
        role="button"
        tabIndex={-1}
        aria-label={removeLabel}
        className="rounded-sm text-muted-foreground opacity-70 hover:opacity-100"
        onClick={onRemove}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            onRemove(event as unknown as MouseEvent)
          }
        }}
      >
        <XIcon className="size-3" />
      </span>
    </span>
  )
}

function ChipRow({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)}>
      {children}
    </div>
  )
}

export function groupedBranchAccessSearchText(branchIds: string[]) {
  return getBranchesByIds(branchIds)
    .map(
      (branch) =>
        `${branch.companyName} ${branchChipLabel(branch)} ${branch.code}`
    )
    .join(" ")
}

function roleNameForAssignment(
  assignment: UserEntityAssignment,
  roles: Group[]
) {
  return (
    roles.find((role) => role.id === assignment.groupId)?.name ??
    assignment.groupId
  )
}

export function userAccessSearchText(
  assignments: UserEntityAssignment[],
  roles: Group[]
) {
  if (assignments.length === 0) return ""
  const roleByBranch = new Map(
    assignments.map((assignment) => [assignment.branchId, assignment])
  )
  return groupBranchesByCompany(assignments.map((item) => item.branchId))
    .flatMap((group) =>
      group.branches.map((branch) => {
        const assignment = roleByBranch.get(branch.id)
        const roleName = assignment
          ? roleNameForAssignment(assignment, roles)
          : ""
        return `${group.companyName} ${branchChipLabel(branch)} ${branch.code} ${roleName}`
      })
    )
    .join(" ")
}

type UserAccessGroupsProps = {
  assignments: UserEntityAssignment[]
  roles: Group[]
  emptyLabel?: string
  className?: string
}

/** Company → branch · role, for list tables and detail views. */
export function UserAccessGroups({
  assignments,
  roles,
  emptyLabel = "No access",
  className,
}: UserAccessGroupsProps) {
  const groups = groupBranchesByCompany(
    assignments.map((assignment) => assignment.branchId)
  )
  const roleByBranch = new Map(
    assignments.map((assignment) => [assignment.branchId, assignment])
  )

  if (groups.length === 0) {
    return <span className="text-muted-foreground">{emptyLabel}</span>
  }

  return (
    <ChipRow className={className}>
      {groups.flatMap((group) =>
        group.branches.map((branch) => {
          const assignment = roleByBranch.get(branch.id)
          const roleName = assignment
            ? roleNameForAssignment(assignment, roles)
            : "—"
          return (
            <StatusChip
              key={branch.id}
              label={`${branchChipLabel(branch)} · ${roleName}`}
              tone={getCompanyTone(branch.companyId)}
            />
          )
        })
      )}
    </ChipRow>
  )
}

type BranchChipListProps = {
  branchIds: string[]
  emptyLabel?: string
  className?: string
}

export function CompanyAccessChips({
  branchIds,
  emptyLabel = "—",
  className,
}: BranchChipListProps) {
  const groups = groupBranchesByCompany(branchIds)

  if (groups.length === 0) {
    return <span className="text-muted-foreground">{emptyLabel}</span>
  }

  return (
    <ChipRow className={className}>
      {groups.map((group) => (
        <StatusChip
          key={group.companyId}
          label={group.companyName}
          tone={getCompanyTone(group.companyId)}
        />
      ))}
    </ChipRow>
  )
}

export function BranchAccessChips({
  branchIds,
  emptyLabel = "—",
  className,
}: BranchChipListProps) {
  const groups = groupBranchesByCompany(branchIds)
  const resolved = groups.flatMap((group) => group.branches)

  if (branchIds.length === 0) {
    return <span className="text-muted-foreground">{emptyLabel}</span>
  }

  if (resolved.length === 0) {
    return <span className="text-muted-foreground">{emptyLabel}</span>
  }

  return (
    <ChipRow className={className}>
      {resolved.map((branch) => (
        <StatusChip
          key={branch.id}
          label={branchChipLabel(branch)}
          tone={getCompanyTone(branch.companyId)}
        />
      ))}
    </ChipRow>
  )
}

/** Stacked company + branch chips for detail panels and forms. */
export function GroupedBranchChips({
  branchIds,
  emptyLabel = "—",
  className,
}: BranchChipListProps) {
  const groups = groupBranchesByCompany(branchIds)

  if (groups.length === 0) {
    return <span className="text-muted-foreground">{emptyLabel}</span>
  }

  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      {groups.map((group) => (
        <div key={group.companyId} className="flex flex-col gap-1">
          <StatusChip
            label={group.companyName}
            tone={getCompanyTone(group.companyId)}
          />
          <ChipRow>
            {group.branches.map((branch) => (
              <StatusChip
                key={branch.id}
                label={branchChipLabel(branch)}
                tone={getCompanyTone(branch.companyId)}
              />
            ))}
          </ChipRow>
        </div>
      ))}
    </div>
  )
}
