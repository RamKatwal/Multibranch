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
import { DeactivateRoleDialog } from "@/components/settings/users-permissions/deactivate-role-dialog"
import { createPermissionGroupColumns } from "@/components/settings/users-permissions/group-columns"
import { groupedBranchAccessSearchText } from "@/components/settings/users-permissions/grouped-branch-chips"
import {
  PermissionGroupFormDialog,
  type PermissionGroupFormValues,
} from "@/components/settings/users-permissions/group-form-dialog"
import { Button } from "@/components/ui/button"
import { Tabs } from "@/components/ui/tabs"
import { getCurrentUser } from "@/lib/auth/current-user"
import { mockPermissionGroups } from "@/lib/mock/permission-groups"
import {
  createPermissionGroupId,
  ensureDefaultPermissionGroups,
  readPermissionGroups,
  savePermissionGroups,
} from "@/lib/users/groups-storage"
import { getUsersAssignedToRole } from "@/lib/users/storage"
import {
  getGroupStatus,
  isProtectedRole,
  normalizeGroupCompanies,
  type Group,
  type GroupStatus,
} from "@/types/group"
import type { AppUser } from "@/types/user"

export function PermissionGroupsPage() {
  const [groups, setGroups] = React.useState<Group[]>(mockPermissionGroups)
  const [statusTab, setStatusTab] = React.useState<GroupStatus>("active")
  const [rowSize, setRowSize] = React.useState<DataTableRowSize>("md")
  const { isFullscreen, toggleFullscreen } = useDataTableFullscreen()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [dialogMode, setDialogMode] = React.useState<"create" | "edit">("create")
  const [editingGroup, setEditingGroup] = React.useState<Group | null>(null)
  const [deactivateOpen, setDeactivateOpen] = React.useState(false)
  const [pendingDeactivate, setPendingDeactivate] =
    React.useState<Group | null>(null)
  const [assignedUsers, setAssignedUsers] = React.useState<AppUser[]>([])

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGroups(readPermissionGroups())
  }, [])

  const persist = React.useCallback((next: Group[]) => {
    const normalized = ensureDefaultPermissionGroups(next)
    setGroups(normalized)
    savePermissionGroups(normalized)
  }, [])

  const activeCount = groups.filter(
    (group) => getGroupStatus(group) === "active"
  ).length
  const inactiveCount = groups.filter(
    (group) => getGroupStatus(group) === "inactive"
  ).length

  const visibleGroups = React.useMemo(
    () => groups.filter((group) => getGroupStatus(group) === statusTab),
    [groups, statusTab]
  )

  function openCreate() {
    setDialogMode("create")
    setEditingGroup(null)
    setDialogOpen(true)
  }

  function openEdit(group: Group) {
    if (isProtectedRole(group)) return
    setDialogMode("edit")
    setEditingGroup(group)
    setDialogOpen(true)
  }

  function handleFormSubmit(
    values: PermissionGroupFormValues & { companyNames: string[] }
  ) {
    if (dialogMode === "create") {
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
      persist([nextGroup, ...groups])
      return
    }

    if (!editingGroup || isProtectedRole(editingGroup)) return

    persist(
      groups.map((group) =>
        group.id === editingGroup.id
          ? normalizeGroupCompanies({
              ...group,
              name: values.name,
              companyIds: values.companyIds,
              companyNames: values.companyNames,
              branchIds: values.branchIds,
            })
          : group
      )
    )
  }

  function requestDeactivate(group: Group) {
    if (isProtectedRole(group) || getGroupStatus(group) !== "active") return
    setPendingDeactivate(group)
    setAssignedUsers(getUsersAssignedToRole(group.id))
    setDeactivateOpen(true)
  }

  function confirmDeactivate() {
    if (!pendingDeactivate || isProtectedRole(pendingDeactivate)) return
    if (getUsersAssignedToRole(pendingDeactivate.id).length > 0) return

    persist(
      groups.map((group) =>
        group.id === pendingDeactivate.id
          ? { ...group, status: "inactive" }
          : group
      )
    )
    setDeactivateOpen(false)
    setPendingDeactivate(null)
    setAssignedUsers([])
  }

  function activateGroup(group: Group) {
    if (isProtectedRole(group)) return
    persist(
      groups.map((item) =>
        item.id === group.id ? { ...item, status: "active" } : item
      )
    )
  }

  const columns = React.useMemo(
    () =>
      createPermissionGroupColumns({
        onEdit: openEdit,
        onDeactivate: requestDeactivate,
        onActivate: activateGroup,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [groups]
  )

  const table = useDataTable({
    data: visibleGroups,
    columns,
    pageSize: 10,
    globalFilterFn: (row, _columnId, filterValue) => {
      const query = filterValue.toLowerCase()
      const item = normalizeGroupCompanies(row.original)

      const accessMatches = groupedBranchAccessSearchText(
        item.branchIds ?? []
      )
        .toLowerCase()
        .includes(query)

      return (
        item.name.toLowerCase().includes(query) ||
        (item.entryBy ?? "").toLowerCase().includes(query) ||
        accessMatches
      )
    },
  })

  const statusTabItems = [
    { value: "active", label: "Active", count: activeCount },
    { value: "inactive", label: "Inactive", count: inactiveCount },
  ]

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="User Roles"
        count={`${groups.length} roles`}
        actions={
          <Button size="32" onClick={openCreate}>
            <PlusIcon />
            Add User Role
          </Button>
        }
      />

      <DataTableCard
        table={table}
        columnCount={columns.length}
        searchPlaceholder="Search roles..."
        rowSize={rowSize}
        onRowSizeChange={setRowSize}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        showFilter={false}
        emptyMessage={
          statusTab === "active"
            ? "No active user roles."
            : "No inactive user roles."
        }
        onRowClick={openEdit}
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

      <PermissionGroupFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        group={editingGroup}
        existingNames={groups.map((group) => group.name)}
        onSubmit={handleFormSubmit}
      />

      <DeactivateRoleDialog
        open={deactivateOpen}
        onOpenChange={(open) => {
          setDeactivateOpen(open)
          if (!open) {
            setPendingDeactivate(null)
            setAssignedUsers([])
          }
        }}
        role={pendingDeactivate}
        assignedUsers={assignedUsers}
        onConfirm={confirmDeactivate}
      />
    </div>
  )
}
