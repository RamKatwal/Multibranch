"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Building2Icon, PlusIcon, SearchIcon, Settings2Icon } from "lucide-react"

import { CompanyAvatar } from "@/components/company-logo"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import type { Subscription } from "@/types/subscription"

type QuickActionsProps = {
  organizations: Subscription[]
}

export function QuickActions({ organizations }: QuickActionsProps) {
  const router = useRouter()
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return organizations
    return organizations.filter(
      (org) =>
        org.companyName.toLowerCase().includes(q) ||
        org.id.toLowerCase().includes(q) ||
        org.companyId.toLowerCase().includes(q)
    )
  }, [organizations, query])

  function handleSearchOpenChange(next: boolean) {
    setSearchOpen(next)
    if (!next) setQuery("")
  }

  function selectOrganization(subscriptionId: string) {
    handleSearchOpenChange(false)
    router.push(`/admin/subscriptions/${subscriptionId}`)
  }

  return (
    <>
      <section className="rounded-xl border bg-card px-4 py-3 shadow-xs">
        <div className="mb-2.5">
          <h2 className="text-sm font-semibold tracking-tight">Quick Actions</h2>
          <p className="text-xs text-fg-secondary">
            Jump into common platform tasks
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="32" asChild
          ><Link href="/onboarding/plan">
            <PlusIcon data-icon="inline-start" />
            New Organization
          </Link></Button>
          <Button size="32" variant="outline" color="neutral"
            onClick={() => setSearchOpen(true)}
          >
            <SearchIcon data-icon="inline-start" />
            Search Organizations
          </Button>
          <Button size="32" variant="outline" color="neutral" asChild
          ><Link href="/admin/configurations">
            <Settings2Icon data-icon="inline-start" />
            Manage Global Settings
          </Link></Button>
        </div>
      </section>

      <Dialog open={searchOpen} onOpenChange={handleSearchOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Search Organizations</DialogTitle>
            <DialogDescription>
              Find a tenant and open its subscription details.
            </DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            placeholder="Search by company name or ID…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search organizations"
          />
          <ul className="max-h-64 overflow-y-auto rounded-lg border">
            {filtered.length === 0 ? (
              <li className="px-3 py-6 text-center text-xs text-fg-secondary">
                No organizations match “{query.trim()}”.
              </li>
            ) : (
              filtered.map((org) => (
                <li key={org.id} className="border-b last:border-b-0">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-fill2/50"
                    onClick={() => selectOrganization(org.id)}
                  >
                    <CompanyAvatar
                      name={org.companyName}
                      domain={org.companyDomain}
                      showTooltip={false}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {org.companyName}
                      </p>
                      <p className="truncate text-xs text-fg-secondary">
                        {org.id} · {org.planName}
                      </p>
                    </div>
                    <Building2Icon
                      className="size-3.5 shrink-0 text-fg-secondary"
                      aria-hidden
                    />
                  </button>
                </li>
              ))
            )}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  )
}
