"use client"

import type { ReactNode } from "react"
import { PencilIcon } from "lucide-react"

import {
  CompanyAccessChips,
  UserAccessGroups,
} from "@/components/settings/users-permissions/grouped-branch-chips"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Divider } from "@/components/ui/divider"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { Group } from "@/types/group"
import type { AppUser } from "@/types/user"

type UserDetailSheetProps = {
  user: AppUser | null
  roles: Group[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (user: AppUser) => void
}

function DetailItem({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1 py-2.5">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium wrap-break-word">{children}</dd>
    </div>
  )
}

function displayValue(value: string | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : "—"
}

export function UserDetailSheet({
  user,
  roles,
  open,
  onOpenChange,
  onEdit,
}: UserDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        <SheetHeader className="shrink-0 border-b px-5 py-4 pr-12">
          <SheetTitle className="text-base font-semibold">
            User Details
          </SheetTitle>
        </SheetHeader>

        {user ? (
          <>
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold">{user.name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {user.email}
                  </p>
                </div>
                <Badge
                  variant={user.status === "active" ? "strong" : "soft"}
                  color={user.status === "active" ? "primary" : "neutral"}
                  size="20"
                  className="shrink-0"
                >
                  {user.status === "active" ? "Active" : "Inactive"}
                </Badge>
              </div>

              <Divider className="my-4" />

              <dl className="grid grid-cols-1">
                <DetailItem label="Address">
                  {displayValue(user.address)}
                </DetailItem>
                <DetailItem label="Contact">
                  {displayValue(user.contact)}
                </DetailItem>
                <DetailItem label="Designation">
                  {displayValue(user.designation)}
                </DetailItem>
                <DetailItem label="Username">
                  {displayValue(user.username)}
                </DetailItem>
                <DetailItem label="Entry by">
                  {displayValue(user.entryBy)}
                </DetailItem>
                <DetailItem label="Company">
                  <CompanyAccessChips
                    branchIds={user.assignments.map(
                      (assignment) => assignment.branchId
                    )}
                    emptyLabel="No access"
                  />
                </DetailItem>
                <DetailItem label="Branches">
                  <UserAccessGroups
                    assignments={user.assignments}
                    roles={roles}
                    emptyLabel="No access"
                  />
                </DetailItem>
              </dl>
            </div>

            <SheetFooter className="shrink-0 flex-row justify-end border-t px-5 py-4">
              <Button
                type="button"
                onClick={() => {
                  onOpenChange(false)
                  onEdit(user)
                }}
              >
                <PencilIcon />
                Edit
              </Button>
            </SheetFooter>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
