"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, LayoutGrid, Lock, Save, ShieldCheck } from "lucide-react"

import { DashboardGrid } from "@/components/dashboard/home/dashboard-grid"
import { PageHeader } from "@/components/layout/page-header"
import { PermissionMatrix } from "@/components/settings/group-management/permission-matrix"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TextArea } from "@/components/ui/text-area"
import {
  canCustomizeGroupDashboards,
  getCurrentUser,
} from "@/lib/auth/current-user"
import { mockGroups } from "@/lib/mock/groups"
import { createDefaultGroupPermissions } from "@/lib/groups/permissions"
import {
  getGroupDashboardLayoutStorageKey,
  readCustomGroups,
  readGroupConfiguration,
  saveGroupConfiguration,
} from "@/lib/groups/storage"
import { cn } from "@/lib/utils"
import type { StoredGroupConfiguration } from "@/types/group"

type DetailSection = "permissions" | "dashboard"

function createDraftConfiguration(): StoredGroupConfiguration {
  return {
    id: "new",
    name: "",
    description: "",
    permissions: createDefaultGroupPermissions("new"),
  }
}

export function GroupDetailPage({ groupId }: { groupId: string }) {
  const router = useRouter()
  const currentUser = getCurrentUser()
  const canCustomizeDashboard = canCustomizeGroupDashboards(currentUser)
  const isNewGroup = groupId === "new"
  const [activeSection, setActiveSection] =
    React.useState<DetailSection>("permissions")
  const [configuration, setConfiguration] =
    React.useState<StoredGroupConfiguration | null>(
      isNewGroup ? createDraftConfiguration() : null
    )
  const [isLoading, setIsLoading] = React.useState(!isNewGroup)
  const [saved, setSaved] = React.useState(false)

  React.useEffect(() => {
    if (isNewGroup) return

    const group = [...mockGroups, ...readCustomGroups()].find(
      (item) => item.id === groupId
    )
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConfiguration(group ? readGroupConfiguration(group) : null)
    setIsLoading(false)
  }, [groupId, isNewGroup])

  function updateConfiguration(
    values: Partial<StoredGroupConfiguration>
  ) {
    setSaved(false)
    setConfiguration((current) =>
      current ? { ...current, ...values } : current
    )
  }

  function handleSave() {
    if (!configuration || !configuration.name.trim()) return

    if (isNewGroup) {
      const nextId = `grp-${configuration.name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")}-${Date.now()}`
      const next = { ...configuration, id: nextId }
      saveGroupConfiguration(next, true)

      const draftLayoutKey = getGroupDashboardLayoutStorageKey("new")
      const nextLayoutKey = getGroupDashboardLayoutStorageKey(nextId)
      const savedDraftLayout = window.localStorage.getItem(draftLayoutKey)
      if (savedDraftLayout) {
        window.localStorage.setItem(nextLayoutKey, savedDraftLayout)
        const savedDraftVersion = window.localStorage.getItem(
          `${draftLayoutKey}-version`
        )
        if (savedDraftVersion) {
          window.localStorage.setItem(
            `${nextLayoutKey}-version`,
            savedDraftVersion
          )
        }
        window.localStorage.removeItem(draftLayoutKey)
        window.localStorage.removeItem(`${draftLayoutKey}-version`)
      }

      router.replace(`/configurations/users/group-management/${nextId}`)
      return
    }

    saveGroupConfiguration(configuration, false)
    setSaved(true)
  }

  if (isLoading) {
    return <div className="py-12 text-center text-sm text-muted-foreground">Loading group…</div>
  }

  if (!configuration) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <h1 className="text-xl font-semibold">Group not found</h1>
        <p className="text-sm text-muted-foreground">
          This group does not exist or has been removed.
        </p>
        <Button
          variant="outline"
          color="neutral"
          asChild
        >
          <Link href="/configurations/users/group-management">
            Back to groups
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={isNewGroup ? "New Group" : configuration.name}
        badge={
          canCustomizeDashboard ? (
            <Badge variant="soft" size="20">Main admin</Badge>
          ) : null
        }
        breadcrumb={
          <Button
            variant="link"
            size="32"
            className="mb-0.5 h-auto self-start px-0 text-muted-foreground"
            asChild
          >
            <Link href="/configurations/users/group-management">
              <ArrowLeft />
              Group Management
            </Link>
          </Button>
        }
        actions={
          <Button
            size="32"
            onClick={handleSave}
            disabled={!configuration.name.trim()}
          >
            <Save />
            {saved ? "Saved" : "Save group"}
          </Button>
        }
      />

      <section className="grid gap-4 rounded-xl border bg-card p-4 md:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-sm font-medium">
            Group name <span className="text-destructive">*</span>
          </span>
          <Input
            value={configuration.name}
            placeholder="e.g. Sales Manager"
            onChange={(event) =>
              updateConfiguration({ name: event.target.value })
            }
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-medium">Description</span>
          <TextArea
            className="min-h-20"
            value={configuration.description}
            placeholder="Describe who belongs to this group."
            onChange={(event) =>
              updateConfiguration({ description: event.target.value })
            }
          />
        </label>
      </section>

      <div className="flex w-fit rounded-lg bg-muted p-1">
        <button
          type="button"
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            activeSection === "permissions"
              ? "bg-background text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setActiveSection("permissions")}
        >
          <ShieldCheck className="size-4" />
          Permissions
        </button>
        <button
          type="button"
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            activeSection === "dashboard"
              ? "bg-background text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setActiveSection("dashboard")}
        >
          <LayoutGrid className="size-4" />
          Dashboard layout
        </button>
      </div>

      {activeSection === "permissions" ? (
        <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
          <PermissionMatrix
            permissions={configuration.permissions}
            onChange={(permissions) => updateConfiguration({ permissions })}
          />
        </div>
      ) : (
        <section className="space-y-4">
          <div className="flex gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <Lock className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <h2 className="text-sm font-semibold">Locked group dashboard</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {canCustomizeDashboard
                  ? "Members of this group receive this layout and cannot customize it themselves. Use Edit layout above the preview to arrange or hide widgets."
                  : "Members of this group receive this layout. Only the main admin can change it."}
              </p>
            </div>
          </div>
          <div className="rounded-xl border bg-background p-3">
            <DashboardGrid
              storageKey={getGroupDashboardLayoutStorageKey(configuration.id)}
              embedded
              readOnly={!canCustomizeDashboard}
            />
          </div>
        </section>
      )}
    </div>
  )
}
