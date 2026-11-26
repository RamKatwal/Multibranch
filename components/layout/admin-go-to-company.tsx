"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

import { CompanyLogo } from "@/components/company-logo"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuDivider,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useIsMac } from "@/hooks/use-is-mac"
import { readActiveBranchId } from "@/lib/branches/storage"
import {
  getCompanyOptions,
  type CompanyBranchOption,
} from "@/lib/companies/options"
import {
  enterCompanyPortal,
  getActiveBranches,
  readActiveCompanyId,
} from "@/lib/companies/portal-context"
import { formatShortcutParts } from "@/lib/keyboard/utils"
import { cn } from "@/lib/utils"

const HEAD_OFFICE_HREF = "/"

function branchLabel(branch: CompanyBranchOption) {
  return branch.isHeadOffice ? "Head office" : branch.name
}

export function AdminGoToCompany() {
  const router = useRouter()
  const isMac = useIsMac()
  const [open, setOpen] = React.useState(false)
  const [lastCompanyId, setLastCompanyId] = React.useState<string | null>(() =>
    typeof window === "undefined" ? null : readActiveCompanyId()
  )
  const [lastBranchId, setLastBranchId] = React.useState<string | null>(() =>
    typeof window === "undefined" ? null : readActiveBranchId()
  )

  const companies = React.useMemo(() => getCompanyOptions(), [])
  const reachableCompanies = React.useMemo(
    () => companies.filter((company) => getActiveBranches(company).length > 0),
    [companies]
  )

  const switchPortalShortcut = formatShortcutParts(
    ["Mod", "Shift", "A"],
    isMac
  )


  function goToPortal(companyId: string, branchId: string) {
    const entered = enterCompanyPortal(companyId, branchId)
    if (!entered) return

    setLastCompanyId(entered.company.id)
    setLastBranchId(entered.branch.id)
    setOpen(false)
    router.push(HEAD_OFFICE_HREF)
  }

  return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button size="32" type="button" aria-label={`Go to Company (${switchPortalShortcut})`}>
                Go to Company
                <ChevronDownIcon data-icon="inline-end" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="flex items-center gap-1.5">
            <span>Go to Company</span>
            <kbd
              data-slot="kbd"
              className="pointer-events-none inline-flex h-5 items-center rounded-sm border border-fg-inverse/20 bg-fg-inverse/15 px-1.5 font-mono text-xs font-medium text-fg-inverse"
            >
              {switchPortalShortcut}
            </kbd>
          </TooltipContent>
        </Tooltip>

        <DropdownMenuContent
          align="end"
          className="thin-scrollbar min-w-64 max-w-72 max-h-80 overflow-y-auto"
        >
          {reachableCompanies.length === 0 ? (
            <DropdownMenuItem disabled>No companies available</DropdownMenuItem>
          ) : (
            reachableCompanies.map((company, index) => {
              const branches = getActiveBranches(company)
              const isActiveCompany = company.id === lastCompanyId

              return (
                <React.Fragment key={company.id}>
                  {index > 0 ? <DropdownMenuDivider /> : null}
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="flex items-center gap-2 text-fg">
                      <CompanyLogo
                        name={company.name}
                        domain={company.domain}
                        size={14}
                        className="size-3.5 rounded-xs"
                      />
                      <span className="min-w-0 flex-1 truncate font-medium">
                        {company.name}
                      </span>
                      <span className="shrink-0 font-normal text-fg-secondary">
                        {branches.length} branch
                        {branches.length === 1 ? "" : "es"}
                      </span>
                    </DropdownMenuLabel>
                    {branches.map((branch) => {
                      const isActive =
                        isActiveCompany && branch.id === lastBranchId

                      return (
                        <DropdownMenuItem
                          key={branch.id}
                          onClick={() => goToPortal(company.id, branch.id)}
                          className={cn(
                            "gap-2 pl-7",
                            isActive && "bg-primary/10 focus:bg-primary/10"
                          )}
                        >
                          <span className="min-w-0 flex-1 truncate">
                            {branchLabel(branch)}
                          </span>
                          {isActive ? (
                            <CheckIcon className="shrink-0 text-primary-text" />
                          ) : null}
                        </DropdownMenuItem>
                      )
                    })}
                  </DropdownMenuGroup>
                </React.Fragment>
              )
            })
          )}
        </DropdownMenuContent>
      </DropdownMenu>
  )
}
