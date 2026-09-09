"use client"

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getBranchesByIds } from "@/lib/companies/options"
import { branchChipLabel } from "@/components/settings/users-permissions/grouped-branch-chips"
import type {
  SubscriptionAssignedBranch,
  SubscriptionMember,
} from "@/types/subscription"

const MAX_VISIBLE_AVATARS = 3

const avatarFallbackClass =
  "bg-muted text-[10px] font-medium text-muted-foreground"

type StackedAvatarItem = {
  key: string
  initials: string
  title: string
}

function branchInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase()
}

export function StackedAvatars({
  items,
  total,
  emptyLabel = "—",
}: {
  items: StackedAvatarItem[]
  total: number
  emptyLabel?: string
}) {
  if (total <= 0 && items.length === 0) {
    return <span className="text-muted-foreground">{emptyLabel}</span>
  }

  const visible = items.slice(0, MAX_VISIBLE_AVATARS)
  const remaining = Math.max(total, items.length) - visible.length
  const remainingNames = items
    .slice(MAX_VISIBLE_AVATARS)
    .map((item) => item.title)
  const remainingLabel =
    remainingNames.length > 0 ? remainingNames.join(", ") : `${remaining} more`

  return (
    <div className="flex items-center gap-2">
      <AvatarGroup>
        {visible.map((item) => (
          <Tooltip key={item.key}>
            <TooltipTrigger
              render={
                <Avatar
                  size="sm"
                  className="cursor-default after:border-border"
                  aria-label={item.title}
                />
              }
            >
              <AvatarFallback className={avatarFallbackClass}>
                {item.initials}
              </AvatarFallback>
            </TooltipTrigger>
            <TooltipContent side="top">{item.title}</TooltipContent>
          </Tooltip>
        ))}
        {remaining > 0 ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <AvatarGroupCount
                  className="size-6 cursor-default border border-border bg-muted text-[10px] font-medium text-muted-foreground"
                  aria-label={remainingLabel}
                />
              }
            >
              +{remaining}
            </TooltipTrigger>
            <TooltipContent side="top">{remainingLabel}</TooltipContent>
          </Tooltip>
        ) : null}
      </AvatarGroup>
    </div>
  )
}

export function userAvatarItems(
  members: SubscriptionMember[],
  usersUsed: number
): StackedAvatarItem[] {
  const fromMembers = members.map((member) => ({
    key: member.id,
    initials: member.initials,
    title: member.name,
  }))

  if (fromMembers.length > 0) return fromMembers

  return Array.from(
    { length: Math.min(usersUsed, MAX_VISIBLE_AVATARS) },
    (_, index) => ({
      key: `user-${index}`,
      initials: `U${index + 1}`,
      title: `User ${index + 1}`,
    })
  )
}

export function branchAvatarItems(
  branches: SubscriptionAssignedBranch[]
): StackedAvatarItem[] {
  return branches.map((branch) => ({
    key: branch.branchId,
    initials: branchInitials(branch.branchName),
    title: branch.branchName,
  }))
}

export function branchAvatarItemsFromIds(
  branchIds: string[] = []
): StackedAvatarItem[] {
  const branches = getBranchesByIds(branchIds)
  const branchMap = new Map(branches.map((b) => [b.id, b]))

  return branchIds.map((id) => {
    const branch = branchMap.get(id)
    const title = branch ? branchChipLabel(branch) : id
    return {
      key: id,
      initials: branchInitials(title),
      title,
    }
  })
}
