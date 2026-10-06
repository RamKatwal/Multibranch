"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LayoutGrid, List, LogOut } from "lucide-react"

import { AppBrand } from "@/components/app-brand"
import {
  formatLastLoggedIn,
  getBranchAccessColumns,
} from "@/components/branch-selector/branch-access-columns"
import { CompanyLogo } from "@/components/company-logo"
import {
  type DataTableRowSize,
  DataTableCard,
  useDataTable,
  useDataTableFullscreen,
} from "@/components/data-table/data-table"
import { Button, IconButton } from "@/components/ui/button"
import { enterCompanyPortal } from "@/lib/companies/portal-context"
import {
  getDemoUserBranchAccess,
  type UserBranchAccess,
} from "@/lib/demo/user-branches"
import { cn } from "@/lib/utils"

type ViewMode = "grid" | "list"

function BranchAccessGridCard({
  item,
  onAccessPortal,
}: {
  item: UserBranchAccess
  onAccessPortal: (row: UserBranchAccess) => void
}) {
  return (
    <article className="flex flex-col rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <div className="flex flex-col gap-1">
        <CompanyLogo
          name={item.companyName}
          domain={item.companyDomain}
          logoUrl={item.companyLogoUrl}
          size={36}
          className="size-9 rounded-md"
        />
        <h2 className="mt-2 text-base font-semibold tracking-tight">
          {item.companyName}
        </h2>
        <p className="text-sm text-muted-foreground">
          {item.branchName}
          <span className="text-muted-foreground/70"> · {item.branchCode}</span>
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="min-w-0 space-y-1">
          <p className="text-[11px] text-muted-foreground">Role</p>
          <p className="truncate text-sm font-medium">{item.role}</p>
        </div>
        <div className="min-w-0 space-y-1">
          <p className="text-[11px] text-muted-foreground">Last logged in</p>
          <p className="truncate text-sm font-medium tabular-nums">
            {formatLastLoggedIn(item.lastLoggedIn)}
          </p>
        </div>
      </div>

      <div className="mt-4 border-t pt-4">
        <Button
          size="32"
          variant="outline"
          color="neutral"
          className="w-full"
          onClick={() => onAccessPortal(item)}
        >
          Access portal
        </Button>
      </div>
    </article>
  )
}

export function BranchSelectorPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = React.useState<ViewMode>("grid")
  const [rowSize, setRowSize] = React.useState<DataTableRowSize>("md")
  const branches = React.useMemo(() => getDemoUserBranchAccess(), [])
  const { isFullscreen, toggleFullscreen } = useDataTableFullscreen()

  const accessPortal = React.useCallback(
    (row: UserBranchAccess) => {
      const entered = enterCompanyPortal(row.companyId, row.branchId)
      if (!entered) return
      router.push("/")
    },
    [router]
  )

  const columns = React.useMemo(
    () => getBranchAccessColumns({ onAccessPortal: accessPortal }),
    [accessPortal]
  )

  const table = useDataTable({
    data: branches,
    columns,
    pageSize: Math.max(branches.length, 1),
    globalFilterFn: (row, _columnId, filterValue) => {
      const query = String(filterValue).toLowerCase()
      const item = row.original
      return (
        item.companyName.toLowerCase().includes(query) ||
        item.branchName.toLowerCase().includes(query) ||
        item.branchCode.toLowerCase().includes(query) ||
        item.role.toLowerCase().includes(query)
      )
    },
  })

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-8">
          <AppBrand href="/branch-selector" size={28} />
          <Button
            variant="ghost"
            color="neutral"
            size="32"
            asChild
          >
            <Link href="/signin">
              <LogOut data-icon="inline-start" className="size-3.5" />
              Sign out
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-6 md:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-semibold tracking-tight">
              Select a branch ({branches.length})
            </h1>
            <div className="flex items-center rounded-md border bg-background p-0.5">
              <IconButton
                type="button"
                variant="ghost"
                color="neutral"
                size="32"
                aria-label="Grid view"
                aria-pressed={viewMode === "grid"}
                onClick={() => setViewMode("grid")}
                className={cn(
                  "size-7",
                  viewMode === "grid" &&
                    "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
                )}
              >
                <LayoutGrid className="size-3.5" />
              </IconButton>
              <IconButton
                type="button"
                variant="ghost"
                color="neutral"
                size="32"
                aria-label="List view"
                aria-pressed={viewMode === "list"}
                onClick={() => setViewMode("list")}
                className={cn(
                  "size-7",
                  viewMode === "list" &&
                    "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
                )}
              >
                <List className="size-3.5" />
              </IconButton>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Choose a company branch to open the portal.
          </p>
        </div>

        {viewMode === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {branches.map((item) => (
              <BranchAccessGridCard
                key={item.id}
                item={item}
                onAccessPortal={accessPortal}
              />
            ))}
          </div>
        ) : (
          <DataTableCard
            table={table}
            columnCount={columns.length}
            searchPlaceholder="Search company, branch, or role..."
            rowSize={rowSize}
            onRowSizeChange={setRowSize}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
            emptyMessage="No branches available."
            showFilter={false}
            showPagination={false}
          />
        )}
      </main>
    </div>
  )
}
