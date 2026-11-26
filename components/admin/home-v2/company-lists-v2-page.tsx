"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Building2,
  EllipsisVertical,
  LayoutGrid,
  List,
  Pencil,
  Plus,
} from "lucide-react"

import {
  organizationStatusBadgeClassName,
  getOrganizationColumns,
} from "@/components/admin/organization-columns"
import { OrganizationSetupDialog } from "@/components/admin/setup/organization-setup-dialog"
import { CompanyLogo } from "@/components/company-logo"
import {
  type DataTableRowSize,
  DataTableCard,
  useDataTable,
  useDataTableFullscreen,
} from "@/components/data-table/data-table"
import { Badge } from "@/components/ui/badge"
import { Button, IconButton } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs } from "@/components/ui/tabs"
import { useHomeOrganizations } from "@/hooks/use-home-organizations"
import { type HomeOrganization } from "@/lib/admin/home-organizations"
import { cn } from "@/lib/utils"
import { subscriptionStatusLabels } from "@/types/subscription"

type ViewMode = "grid" | "list"

const SETUP_QUERY = "setup"
const ROUTE = "/admin/home-v2"
const ADD_COMPANY_HREF = "/onboarding/company"

const VIEW_ITEMS = [
  {
    value: "grid",
    label: (
      <>
        <LayoutGrid aria-hidden />
        <span className="sr-only">Grid view</span>
      </>
    ),
  },
  {
    value: "list",
    label: (
      <>
        <List aria-hidden />
        <span className="sr-only">List view</span>
      </>
    ),
  },
] as const

function formatCount(value: number): string {
  return value > 0 ? String(value) : "—"
}

function CompanyGridCard({ org }: { org: HomeOrganization }) {
  return (
    <article className="flex flex-col rounded-xl border bg-card p-4">
      <div className="flex items-start gap-3">
        <CompanyLogo
          name={org.companyName}
          domain={org.companyDomain}
          logoUrl={org.companyLogoUrl}
          size={36}
          className="size-9 shrink-0 rounded-md"
        />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold">{org.companyName}</h2>
          <p className="truncate text-xs text-fg-secondary">{org.location}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <IconButton
              size="28"
              variant="ghost"
              color="neutral"
              aria-label={`More actions for ${org.companyName}`}
            >
              <EllipsisVertical />
            </IconButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/companies/${org.companyId}/configuration`}>
                <Pencil />
                Edit
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="min-w-0 space-y-1">
          <p className="text-xs text-fg-secondary">Status</p>
          <Badge
            variant="outline"
            size="20"
            className={cn(
              "max-w-full truncate",
              organizationStatusBadgeClassName(org.status)
            )}
          >
            {subscriptionStatusLabels[org.status]}
          </Badge>
        </div>
        <div className="min-w-0 space-y-1">
          <p className="text-xs text-fg-secondary">Users</p>
          <p className="text-sm font-medium tabular-nums">
            {formatCount(org.usersUsed)}
          </p>
        </div>
        <div className="min-w-0 space-y-1">
          <p className="text-xs text-fg-secondary">Branches</p>
          <p className="text-sm font-medium tabular-nums">
            {formatCount(org.branchesUsed)}
          </p>
        </div>
      </div>

      <div className="mt-auto pt-4">
        <Button size="32" variant="outline" color="neutral" className="w-full" asChild>
          <Link href="/">Go to company</Link>
        </Button>
      </div>
    </article>
  )
}

function CompaniesEmptyState() {
  return (
    <Card className="items-center px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-xl bg-fill2 text-fg-secondary">
        <Building2 aria-hidden />
      </div>
      <div className="flex max-w-md flex-col gap-1">
        <h2 className="text-base font-semibold">Add your first company</h2>
        <p className="text-sm text-fg-secondary">
          Each company keeps its own books, inventory and team. Add one to
          start managing it from this console.
        </p>
      </div>
      <Button asChild>
        <Link href={ADD_COMPANY_HREF}>
          <Plus data-icon="inline-start" />
          Add company
        </Link>
      </Button>
    </Card>
  )
}

export function CompanyListsV2Page() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [viewMode, setViewMode] = React.useState<ViewMode>("grid")
  const [rowSize, setRowSize] = React.useState<DataTableRowSize>("md")
  const organizations = useHomeOrganizations()
  const [setupCompanyId, setSetupCompanyId] = React.useState<string | null>(
    null
  )
  const { isFullscreen, toggleFullscreen } = useDataTableFullscreen()

  const setupParam = searchParams.get(SETUP_QUERY)
  if (setupParam && setupParam !== setupCompanyId) {
    setSetupCompanyId(setupParam)
  }

  React.useEffect(() => {
    if (!setupParam) return
    const params = new URLSearchParams(searchParams.toString())
    params.delete(SETUP_QUERY)
    const next = params.toString()
    router.replace(next ? `${ROUTE}?${next}` : ROUTE)
  }, [router, searchParams, setupParam])

  const openSetup = React.useCallback((companyId: string) => {
    setSetupCompanyId(companyId)
  }, [])

  const columns = React.useMemo(
    () => getOrganizationColumns({ onContinueSetup: openSetup }),
    [openSetup]
  )

  const table = useDataTable({
    data: organizations,
    columns,
    pageSize: Math.max(organizations.length, 1),
    globalFilterFn: (row, _columnId, filterValue) => {
      const query = String(filterValue).toLowerCase()
      const org = row.original
      return (
        org.companyName.toLowerCase().includes(query) ||
        org.location.toLowerCase().includes(query) ||
        org.planName.toLowerCase().includes(query) ||
        org.status.toLowerCase().includes(query) ||
        org.id.toLowerCase().includes(query)
      )
    },
  })

  if (organizations.length === 0) {
    return <CompaniesEmptyState />
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-semibold tracking-tight">
            Your companies ({organizations.length})
          </h1>
          <Tabs
            items={VIEW_ITEMS}
            value={viewMode}
            onValueChange={(value) => setViewMode(value as ViewMode)}
            aria-label="View"
          />
        </div>

        <Button asChild>
          <Link href={ADD_COMPANY_HREF}>
            <Plus data-icon="inline-start" />
            Add company
          </Link>
        </Button>
      </div>

      {viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {organizations.map((org) => (
            <CompanyGridCard key={org.id} org={org} />
          ))}
        </div>
      ) : (
        <DataTableCard
          table={table}
          columnCount={columns.length}
          searchPlaceholder="Search companies..."
          rowSize={rowSize}
          onRowSizeChange={setRowSize}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          emptyMessage="No companies found."
          showFilter={false}
          showPagination={false}
        />
      )}

      <OrganizationSetupDialog
        companyId={setupCompanyId}
        open={Boolean(setupCompanyId)}
        onOpenChange={(open) => {
          if (!open) setSetupCompanyId(null)
        }}
      />
    </div>
  )
}
