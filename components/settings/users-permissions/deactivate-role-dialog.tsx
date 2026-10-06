"use client"

import * as React from "react"
import { TriangleAlertIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Group } from "@/types/group"
import type { AppUser } from "@/types/user"

type DeactivateRoleDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: Group | null
  assignedUsers: AppUser[]
  onConfirm: () => void
}

export function DeactivateRoleDialog({
  open,
  onOpenChange,
  role,
  assignedUsers,
  onConfirm,
}: DeactivateRoleDialogProps) {
  const isBlocked = assignedUsers.length > 0
  const roleName = role?.name ?? "this role"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isBlocked ? (
              <TriangleAlertIcon className="size-5 text-destructive" />
            ) : null}
            {isBlocked ? "Cannot deactivate role" : "Deactivate role"}
          </DialogTitle>
          <DialogDescription>
            {isBlocked ? (
              <>
                <span className="font-medium text-foreground">{roleName}</span>{" "}
                is assigned to {assignedUsers.length}{" "}
                {assignedUsers.length === 1 ? "user" : "users"} and cannot be
                deactivated. Reassign those users to another role first.
              </>
            ) : (
              <>
                Are you sure you want to deactivate{" "}
                <span className="font-medium text-foreground">{roleName}</span>?
                Inactive roles cannot be assigned to users.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {isBlocked ? (
          <DialogBody>
            <ul className="max-h-40 overflow-auto rounded-lg border bg-muted/40 px-3 py-2 text-sm">
              {assignedUsers.map((user) => (
                <li key={user.id} className="truncate py-0.5">
                  {user.name}
                </li>
              ))}
            </ul>
          </DialogBody>
        ) : null}

        <DialogFooter>
          {isBlocked ? (
            <Button type="button" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                color="neutral"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="button" variant="soft" color="error" onClick={onConfirm}>
                Deactivate
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
