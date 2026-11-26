"use client"

import * as React from "react"
import Link from "next/link"
import { PlusIcon } from "lucide-react"

import { BranchDialog } from "@/components/admin/branches/branch-dialog"
import { PageHeader } from "@/components/layout/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { organizations } from "@/config/organizations"
import {
  getCompanyBranches,
  useAllBranches,
  useBranchLimit,
} from "@/lib/branches/company-branches"
import { isHeadOfficeBranch } from "@/lib/branches/head-office"
import { branchStatusLabels } from "@/types/branch"

export function BranchesOverviewPage() {
  const allBranches = useAllBranches()
  const branchLimit = useBranchLimit()
  const [dialogCompanyId, setDialogCompanyId] = React.useState<
    string | undefined
  >(undefined)
  const [dialogOpen, setDialogOpen] = React.useState(false)

  function openCreate(companyId?: string) {
    setDialogCompanyId(companyId)
    setDialogOpen(true)
  }

  const used = allBranches.length

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Branch Management"
        badge={
          <Badge
            variant="soft"
            color={used >= branchLimit ? "warning" : "neutral"}
            size="20"
            className="tabular-nums"
          >
            {used} of {branchLimit} branches used
          </Badge>
        }
        actions={
          <Button size="32" onClick={() => openCreate()}>
            <PlusIcon />
            Add branch
          </Button>
        }
      />

      {organizations.map((org) => {
        const branches = getCompanyBranches(allBranches, org.id)
        const href = `/admin/branches/${org.id}`

        return (
          <Card key={org.id} size="sm">
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-2">
                <Link
                  href={href}
                  className="rounded-sm hover:underline focus-visible:ring-2 focus-visible:ring-primary-focus focus-visible:outline-none"
                >
                  {org.name}
                </Link>
                <Badge variant="soft" size="20" className="tabular-nums">
                  {branches.length}
                </Badge>
              </CardTitle>
              <CardAction>
                <Button
                  size="28"
                  variant="outline"
                  color="neutral"
                  onClick={() => openCreate(org.id)}
                >
                  <PlusIcon />
                  Add branch
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="px-0">
              {branches.length === 0 ? (
                <p className="px-3 py-2 text-sm text-fg-secondary">
                  No branches yet.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {branches.map((branch) => (
                    <li
                      key={branch.id}
                      className="grid grid-cols-3 items-center gap-3 px-3 py-2 text-sm sm:grid-cols-4"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="truncate font-medium text-fg">
                          {branch.name}
                        </span>
                        {isHeadOfficeBranch(branch) ? (
                          <Badge variant="soft" size="20" className="shrink-0">
                            Head Office
                          </Badge>
                        ) : null}
                      </span>
                      <span className="font-mono text-fg-secondary">
                        {branch.code}
                      </span>
                      <span className="hidden truncate text-fg-secondary sm:block">
                        {branch.address}
                      </span>
                      <span className="justify-self-end">
                        <Badge
                          variant={
                            branch.status === "active" ? "soft" : "outline"
                          }
                          color={
                            branch.status === "active" ? "success" : "neutral"
                          }
                          size="20"
                        >
                          {branchStatusLabels[branch.status]}
                        </Badge>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )
      })}

      <BranchDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        companyId={dialogCompanyId}
      />
    </div>
  )
}
