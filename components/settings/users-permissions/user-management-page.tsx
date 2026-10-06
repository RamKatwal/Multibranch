"use client"

import * as React from "react"
import { PlusIcon } from "lucide-react"

import {
  type DataTableRowSize,
  DataTableCard,
  useDataTable,
  useDataTableFullscreen,
} from "@/components/data-table/data-table"
import { PageHeader } from "@/components/layout/page-header"
import type { PermissionGroupFormValues } from "@/components/settings/users-permissions/group-form-dialog"
import { createUserColumns, getUserAccessLabel } from "@/components/settings/users-permissions/user-columns"
import { UserDetailSheet } from "@/components/settings/users-permissions/user-detail-sheet"
import {
  UserFormDialog,
  type UserFormValues,
} from "@/components/settings/users-permissions/user-form-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs } from "@/components/ui/tabs"
import { getCurrentUser } from "@/lib/auth/current-user"
import { readCustomGroups, saveCustomGroup } from "@/lib/groups/storage"
import { mockGroups } from "@/lib/mock/groups"
import { mockPermissionGroups } from "@/lib/mock/permission-groups"
import { mockUsers } from "@/lib/mock/users"
import {
  createPermissionGroupId,
  readPermissionGroups,
  savePermissionGroups,
} from "@/lib/users/groups-storage"
import {
  createUserId,
  readUsers,
  saveUsers,
  todayIsoDate,
} from "@/lib/users/storage"
import { getGroupStatus, normalizeGroupCompanies, type Group } from "@/types/group"
import type { AppUser, UserStatus } from "@/types/user"

export type UserRoleSource = "permission-groups" | "configuration-roles"

type UserManagementPageProps = {
  /** Where role options come from. Defaults to admin permission groups. */
  roleSource?: UserRoleSource
}

function readConfigurationRoles(): Group[] {
  const byId = new Map<string, Group>()
  for (const role of [...mockGroups, ...readCustomGroups()]) {
    byId.set(role.id, normalizeGroupCompanies(role))
  }
  return Array.from(byId.values())
}

function loadRoles(roleSource: UserRoleSource): Group[] {
  if (roleSource === "configuration-roles") {
    return readConfigurationRoles()
  }
  return readPermissionGroups().map((role) => normalizeGroupCompanies(role))
}

function assignableRoles(roles: Group[]) {
  return roles.filter((role) => getGroupStatus(role) === "active")
}

export function UserManagementPage({
  roleSource = "permission-groups",
}: UserManagementPageProps) {
  const [users, setUsers] = React.useState<AppUser[]>(mockUsers)
  const [roles, setRoles] = React.useState<Group[]>(
    roleSource === "configuration-roles"
      ? mockGroups.map((role) => normalizeGroupCompanies(role))
      : mockPermissionGroups.map((role) => normalizeGroupCompanies(role))
  )
  const [statusTab, setStatusTab] = React.useState<UserStatus>("active")
  const [rowSize, setRowSize] = React.useState<DataTableRowSize>("md")
  const { isFullscreen, toggleFullscreen } = useDataTableFullscreen()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [dialogMode, setDialogMode] = React.useState<"create" | "edit">("create")
  const [editingUser, setEditingUser] = React.useState<AppUser | null>(null)
  const [viewingUser, setViewingUser] = React.useState<AppUser | null>(null)
  const [resentUser, setResentUser] = React.useState<AppUser | null>(null)

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUsers(readUsers())
    setRoles(loadRoles(roleSource))
  }, [roleSource])

  const persist = React.useCallback((next: AppUser[]) => {
    setUsers(next)
    saveUsers(next)
  }, [])

  const visibleUsers = React.useMemo(
    () => users.filter((user) => user.status === statusTab),
    [users, statusTab]
  )

  const activeCount = users.filter((user) => user.status === "active").length
  const inactiveCount = users.filter((user) => user.status === "inactive").length

  function openCreate() {
    setRoles(loadRoles(roleSource))
    setViewingUser(null)
    setDialogMode("create")
    setEditingUser(null)
    setDialogOpen(true)
  }

  function openView(user: AppUser) {
    setDialogOpen(false)
    setViewingUser(user)
  }

  function openEdit(user: AppUser) {
    setRoles(loadRoles(roleSource))
    setViewingUser(null)
    setDialogMode("edit")
    setEditingUser(user)
    setDialogOpen(true)
  }

  function handleFormSubmit(values: UserFormValues) {
    if (dialogMode === "create") {
      const nextUser: AppUser = {
        id: createUserId(values.email),
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        username: values.username.trim(),
        contact: values.contact.trim(),
        address: values.address.trim(),
        designation: values.designation.trim(),
        status: "active",
        assignments: values.assignments.map((assignment) => ({
          ...assignment,
        })),
        createdAt: todayIsoDate(),
        entryBy: getCurrentUser().name,
      }
      persist([nextUser, ...users])
      return
    }

    if (!editingUser) return

    persist(
      users.map((user) =>
        user.id === editingUser.id
          ? {
              ...user,
              name: values.name.trim(),
              email: values.email.trim().toLowerCase(),
              username: values.username.trim(),
              contact: values.contact.trim(),
              address: values.address.trim(),
              designation: values.designation.trim(),
              assignments: values.assignments.map((assignment) => ({
                ...assignment,
              })),
            }
          : user
      )
    )
  }

  function handleCreateRole(
    values: PermissionGroupFormValues & { companyNames: string[] }
  ) {
    const nextGroup = normalizeGroupCompanies({
      id: createPermissionGroupId(values.name),
      name: values.name,
      description: "",
      companyIds: values.companyIds,
      companyNames: values.companyNames,
      branchIds: values.branchIds,
      status: "active",
      entryBy: getCurrentUser().name,
      locked: false,
    })

    if (roleSource === "configuration-roles") {
      saveCustomGroup(nextGroup)
    } else {
      savePermissionGroups([nextGroup, ...readPermissionGroups()])
    }

    setRoles(loadRoles(roleSource))
    return nextGroup
  }

  function setStatus(user: AppUser, status: AppUser["status"]) {
    persist(
      users.map((item) =>
        item.id === user.id ? { ...item, status } : item
      )
    )
  }

  const columns = React.useMemo(
    () =>
      createUserColumns({
        groups: roles,
        onView: openView,
        onEdit: openEdit,
        onActivate: (user) => setStatus(user, "active"),
        onDeactivate: (user) => setStatus(user, "inactive"),
        onResendEmail: setResentUser,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [users, roles]
  )

  const table = useDataTable({
    data: visibleUsers,
    columns,
    pageSize: 10,
    globalFilterFn: (row, _columnId, filterValue) => {
      const query = filterValue.toLowerCase()
      const item = row.original

      return (
        item.name.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        item.username?.toLowerCase().includes(query) ||
        (item.entryBy ?? "").toLowerCase().includes(query) ||
        getUserAccessLabel(item, roles).toLowerCase().includes(query)
      )
    },
  })

  const formRoles = assignableRoles(roles)
  const statusTabItems = [
    { value: "active", label: "Active", count: activeCount },
    { value: "inactive", label: "Inactive", count: inactiveCount },
  ]

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="User Management"
        count={`${users.length} users`}
        actions={
          <Button size="32" onClick={openCreate}>
            <PlusIcon />
            Add User
          </Button>
        }
      />

      <DataTableCard
        table={table}
        columnCount={columns.length}
        searchPlaceholder="Search users..."
        rowSize={rowSize}
        onRowSizeChange={setRowSize}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        showFilter={false}
        emptyMessage={
          statusTab === "active" ? "No active users." : "No inactive users."
        }
        onRowClick={openView}
        leading={
          <Tabs
            items={statusTabItems}
            value={statusTab}
            onValueChange={(value) => {
              if (value !== "active" && value !== "inactive") return
              setStatusTab(value)
              table.setPageIndex(0)
            }}
          />
        }
      />

      <UserFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        user={editingUser}
        roles={formRoles}
        existingEmails={users.map((user) => user.email)}
        existingUsernames={users.map((user) => user.username ?? "")}
        existingRoleNames={roles.map((role) => role.name)}
        onSubmit={handleFormSubmit}
        onCreateRole={handleCreateRole}
      />

      <UserDetailSheet
        user={viewingUser}
        roles={roles}
        open={Boolean(viewingUser)}
        onOpenChange={(open) => {
          if (!open) setViewingUser(null)
        }}
        onEdit={openEdit}
      />

      <Dialog
        open={Boolean(resentUser)}
        onOpenChange={(open) => {
          if (!open) setResentUser(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Email sent</DialogTitle>
            <DialogDescription>
              The invitation email was resent to{" "}
              {resentUser?.email ?? "this user"}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" onClick={() => setResentUser(null)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
