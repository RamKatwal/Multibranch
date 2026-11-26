"use client"

import { useEffect, useSyncExternalStore } from "react"

import {
  getHomeOrganizationsSnapshot,
  getServerHomeOrganizationsSnapshot,
  subscribeHomeOrganizations,
  syncWorkspaceOrgIntoHomeOrganizations,
} from "@/lib/admin/home-organizations"

/** Seeded plus locally added organizations, kept in sync with localStorage. */
export function useHomeOrganizations() {
  useEffect(() => {
    syncWorkspaceOrgIntoHomeOrganizations()
  }, [])

  return useSyncExternalStore(
    subscribeHomeOrganizations,
    getHomeOrganizationsSnapshot,
    getServerHomeOrganizationsSnapshot
  )
}
