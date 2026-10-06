"use client"

import * as React from "react"

import { AppearanceSettingsPanel } from "@/components/settings/appearance-settings-panel"
import { KeyboardShortcutsSettingsPanel } from "@/components/settings/keyboard-shortcuts-settings-panel"
import { NotificationsSettingsPanel } from "@/components/settings/notifications-settings-panel"
import { ProfileSettingsPanel } from "@/components/settings/profile-settings-panel"
import { useSettingsModal } from "@/components/settings/settings-modal-provider"
import { UserActivitiesSettingsPanel } from "@/components/settings/user-activities-settings-panel"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  getSettingsModalItem,
  settingsModalNavigation,
  type SettingsModalSection,
} from "@/config/settings-modal-navigation"
import { cn } from "@/lib/utils"

function SettingsModalPanel({ section }: { section: SettingsModalSection }) {
  switch (section) {
    case "profile":
      return <ProfileSettingsPanel />
    case "notifications":
      return <NotificationsSettingsPanel />
    case "appearance":
      return <AppearanceSettingsPanel />
    case "keyboard-shortcuts":
      return <KeyboardShortcutsSettingsPanel />
    case "user-activities":
      return <UserActivitiesSettingsPanel />
    default:
      return null
  }
}

export function SettingsModal() {
  const { open, section, setOpen, setSection, closeSettings } =
    useSettingsModal()
  const activeItem = getSettingsModalItem(section)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton
        className="flex h-[min(720px,calc(100svh-2rem))] w-full max-w-4xl flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl"
      >
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <DialogDescription className="sr-only">
          Manage your profile, notifications, appearance, and preferences.
        </DialogDescription>

        <div className="flex min-h-0 flex-1">
          <aside className="hidden w-52 shrink-0 flex-col border-r bg-muted/20 p-3 sm:flex">
            <nav className="flex flex-col gap-0.5" aria-label="Settings sections">
              {settingsModalNavigation.map((item) => {
                const Icon = item.icon
                const active = section === item.id

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSection(item.id)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      active
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    {item.title}
                  </button>
                )
              })}
            </nav>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="border-b px-5 py-4 sm:hidden">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  Section
                </span>
                <select
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                  value={section}
                  onChange={(event) =>
                    setSection(event.target.value as SettingsModalSection)
                  }
                >
                  {settingsModalNavigation.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="border-b px-5 py-5">
              <h2 className="text-lg font-semibold tracking-tight">
                {activeItem?.title}
              </h2>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
              <SettingsModalPanel section={section} />
            </div>

            <div className="flex items-center justify-end gap-2 border-t px-5 py-4">
              <Button type="button" variant="outline" color="neutral" onClick={closeSettings}>
                Cancel
              </Button>
              <Button type="button" onClick={closeSettings}>
                Save changes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
