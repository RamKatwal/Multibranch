"use client"

import { CheckSquareIcon, SquareIcon } from "lucide-react"

import { IconButton } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  GROUP_PERMISSION_MODULES,
  getPermissionItemActions,
  type PermissionModule,
} from "@/lib/groups/permissions"
import {
  GROUP_PERMISSION_ACTIONS,
  type GroupPermissionAction,
  type GroupPermissions,
} from "@/types/group"

const ACTION_LABELS: Record<GroupPermissionAction, string> = {
  view: "View",
  create: "Create",
  edit: "Edit",
  delete: "Delete",
  approve: "Approve",
}

function getModuleSelection(
  module: PermissionModule,
  permissions: GroupPermissions
) {
  const available = module.items.flatMap((item) =>
    getPermissionItemActions(item).map((action) => `${item.id}:${action}`)
  )
  const selected = module.items.flatMap((item) =>
    (permissions[item.id] ?? []).map((action) => `${item.id}:${action}`)
  )

  return {
    isSelected: available.length > 0 && selected.length === available.length,
    available,
  }
}

export function PermissionMatrix({
  permissions,
  onChange,
  readOnly = false,
}: {
  permissions: GroupPermissions
  onChange: (permissions: GroupPermissions) => void
  readOnly?: boolean
}) {
  function togglePermission(
    itemId: string,
    action: GroupPermissionAction,
    checked: boolean
  ) {
    if (readOnly) return
    const current = permissions[itemId] ?? []
    onChange({
      ...permissions,
      [itemId]: checked
        ? [...new Set([...current, action])]
        : current.filter((item) => item !== action),
    })
  }

  function toggleRow(
    itemId: string,
    actions: GroupPermissionAction[],
    checked: boolean
  ) {
    if (readOnly) return
    onChange({ ...permissions, [itemId]: checked ? [...actions] : [] })
  }

  function toggleModule(module: PermissionModule, checked: boolean) {
    if (readOnly) return
    const next = { ...permissions }
    for (const item of module.items) {
      next[item.id] = checked ? [...getPermissionItemActions(item)] : []
    }
    onChange(next)
  }

  return (
    <Tabs defaultValue={GROUP_PERMISSION_MODULES[0]?.id ?? "inventory"}>
      <div className="border-b px-3 py-2.5">
        <TabsList variant="button">
          {GROUP_PERMISSION_MODULES.map((module) => (
            <TabsTrigger key={module.id} value={module.id}>
              {module.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {GROUP_PERMISSION_MODULES.map((module) => (
        <TabsContent key={module.id} value={module.id}>
          <ModulePermissionTable
            module={module}
            permissions={permissions}
            readOnly={readOnly}
            onToggleModule={toggleModule}
            onToggleRow={toggleRow}
            onTogglePermission={togglePermission}
          />
        </TabsContent>
      ))}
    </Tabs>
  )
}

function ModulePermissionTable({
  module,
  permissions,
  readOnly,
  onToggleModule,
  onToggleRow,
  onTogglePermission,
}: {
  module: PermissionModule
  permissions: GroupPermissions
  readOnly: boolean
  onToggleModule: (module: PermissionModule, checked: boolean) => void
  onToggleRow: (
    itemId: string,
    actions: GroupPermissionAction[],
    checked: boolean
  ) => void
  onTogglePermission: (
    itemId: string,
    action: GroupPermissionAction,
    checked: boolean
  ) => void
}) {
  const moduleSelection = getModuleSelection(module, permissions)
  const selectAllLabel = moduleSelection.isSelected
    ? `Clear all ${module.label} permissions`
    : `Select all ${module.label} permissions`

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] border-collapse text-sm">
        <thead>
          <tr className="border-b bg-muted/35 text-xs text-muted-foreground">
            <th className="w-full px-4 py-2.5 text-left font-medium">
              Permission
            </th>
            <th className="px-2 py-1.5 text-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <IconButton
                    type="button"
                    variant="ghost"
                    color="neutral"
                    size="32"
                    className="mx-auto"
                    disabled={readOnly}
                    aria-label={selectAllLabel}
                    aria-pressed={moduleSelection.isSelected}
                    onClick={() =>
                      onToggleModule(module, !moduleSelection.isSelected)
                    }
                  >
                    {moduleSelection.isSelected ? (
                      <CheckSquareIcon />
                    ) : (
                      <SquareIcon />
                    )}
                  </IconButton>
                </TooltipTrigger>
                <TooltipContent>
                  {moduleSelection.isSelected ? "Clear all" : "Select all"}
                </TooltipContent>
              </Tooltip>
            </th>
            {GROUP_PERMISSION_ACTIONS.map((action) => (
              <th key={action} className="px-3 py-2.5 text-center font-medium">
                {ACTION_LABELS[action]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {module.items.map((item) => {
            const actions = getPermissionItemActions(item)
            const selected = permissions[item.id] ?? []
            const hasFullAccess =
              actions.length > 0 &&
              actions.every((action) => selected.includes(action))

            return (
              <tr
                key={item.id}
                className="border-b last:border-b-0 hover:bg-muted/20"
              >
                <td className="px-4 py-3 font-medium">{item.label}</td>
                <td className="px-3 py-3 text-center">
                  <Checkbox
                    size="sm"
                    className="mx-auto"
                    checked={hasFullAccess}
                    disabled={readOnly}
                    onCheckedChange={(checked) =>
                      onToggleRow(item.id, actions, checked === true)
                    }
                    aria-label={`Full access to ${item.label}`}
                  />
                </td>
                {GROUP_PERMISSION_ACTIONS.map((action) => (
                  <td key={action} className="px-3 py-3 text-center">
                    {actions.includes(action) ? (
                      <Checkbox
                        size="sm"
                        className="mx-auto"
                        checked={selected.includes(action)}
                        disabled={readOnly}
                        onCheckedChange={(checked) =>
                          onTogglePermission(
                            item.id,
                            action,
                            checked === true
                          )
                        }
                        aria-label={`${ACTION_LABELS[action]} ${item.label}`}
                      />
                    ) : (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
