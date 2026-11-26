"use client"

import { AppNavbar } from "@/components/layout/app-navbar"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { KeyboardShortcutsDialog } from "@/components/layout/keyboard-shortcuts-dialog"
import { KeyboardShortcutsProvider } from "@/components/layout/keyboard-shortcuts-provider"
import { SettingsModal } from "@/components/settings/settings-modal"
import { SettingsModalProvider } from "@/components/settings/settings-modal-provider"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import type * as React from "react"

type AdminShellProps = {
  children: React.ReactNode
}

export function AdminShell({ children }: AdminShellProps) {
  return (
    <KeyboardShortcutsProvider>
      <SettingsModalProvider>
        <SidebarProvider
          className="h-svh overflow-hidden"
          style={
            {
              "--sidebar-width": "15rem",
            } as React.CSSProperties
          }
        >
          <AdminSidebar />
          <SidebarInset className="h-svh overflow-y-auto">
            <AppNavbar />
            <div className="flex flex-1 flex-col gap-3 px-3 py-3 md:px-4 md:py-4">
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
        <KeyboardShortcutsDialog />
        <SettingsModal />
      </SettingsModalProvider>
    </KeyboardShortcutsProvider>
  )
}
