"use client"

import { useMemo, useSyncExternalStore } from "react"

import type { HomeOrganization } from "@/lib/admin/home-organizations"
import {
  getOrganizationSetupProgress,
  getServerSetupOverridesSnapshot,
  getSetupOverridesSnapshot,
  parseAllSetupOverrides,
  subscribeSetupOverrides,
  type OrganizationSetupProgress,
} from "@/lib/admin/organization-setup"

export function useOrganizationSetupProgress(
  org: HomeOrganization
): OrganizationSetupProgress {
  const raw = useSyncExternalStore(
    subscribeSetupOverrides,
    getSetupOverridesSnapshot,
    getServerSetupOverridesSnapshot
  )

  return useMemo(() => {
    const all = parseAllSetupOverrides(raw)
    return getOrganizationSetupProgress(org, all[org.companyId] ?? {})
  }, [org, raw])
}
