"use client"

import * as React from "react"
import {
  ArrowRight,
  Check,
  ChevronsUpDown,
} from "lucide-react"
import { AnimatePresence, m } from "framer-motion"
import { toast } from "sonner"

import { useKeyboardShortcutsOptional } from "@/components/layout/keyboard-shortcuts-provider"
import { IconStack } from "@/components/reui/icon-stack"
import { SetupProgressBar } from "@/components/shared/setup-progress-bar"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar"
import { useIsMac } from "@/hooks/use-is-mac"
import {
  readActiveBranchId,
  readBranches,
  resolveActiveBranch,
  saveActiveBranchId,
} from "@/lib/branches/storage"
import { getBranchLocation } from "@/lib/branches/location"
import { formatShortcutLabel } from "@/lib/keyboard/utils"
import { mockBranches } from "@/lib/mock/branches"
import { cn } from "@/lib/utils"
import type { Branch } from "@/types/branch"

function branchInitials(branch: Branch) {
  const parts = branch.name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return branch.code.slice(0, 2).toUpperCase()
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase()
}

function BranchMark({
  branch,
  className,
}: {
  branch: Branch
  className?: string
}) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-foreground",
        className
      )}
    >
      {branchInitials(branch)}
    </span>
  )
}

function BranchAvatar({
  branch,
  className,
}: {
  branch: Branch
  className?: string
}) {
  return (
    <div
      className={cn(
        "relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm shadow-xs border border-primary/20",
        className
      )}
    >
      {branchInitials(branch)}
    </div>
  )
}

export function BranchSwitcher({ className }: { className?: string }) {
  const { isMobile } = useSidebar()
  const isMac = useIsMac()
  const shortcuts = useKeyboardShortcutsOptional()
  const [branches, setBranches] = React.useState<Branch[]>(mockBranches)
  const [activeBranchId, setActiveBranchId] = React.useState(
    () => mockBranches[0]?.id ?? ""
  )
  const [localOpen, setLocalOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")

  const isDropdownOpen = shortcuts?.branchSwitcherOpen ?? localOpen
  const setIsDropdownOpen = shortcuts?.setBranchSwitcherOpen ?? setLocalOpen

  // Switching modal state
  const [isSwitching, setIsSwitching] = React.useState(false)
  const [switchingFrom, setSwitchingFrom] = React.useState<Branch | null>(null)
  const [switchingTo, setSwitchingTo] = React.useState<Branch | null>(null)
  const [switchProgress, setSwitchProgress] = React.useState(0)
  const [hasAvatarReplaced, setHasAvatarReplaced] = React.useState(false)

  React.useEffect(() => {
    const nextBranches = readBranches()
    setBranches(nextBranches)
    const active = resolveActiveBranch(nextBranches)
    if (active) {
      setActiveBranchId(active.id)
      if (readActiveBranchId() !== active.id) {
        saveActiveBranchId(active.id)
      }
    }
  }, [])

  const accessibleBranches = branches.filter(
    (branch) => branch.status === "active"
  )
  const activeBranch =
    accessibleBranches.find((branch) => branch.id === activeBranchId) ??
    accessibleBranches[0] ??
    null

  function handleBranchClick(targetBranch: Branch) {
    if (!activeBranch || targetBranch.id === activeBranch.id) {
      setIsDropdownOpen(false)
      return
    }

    setIsDropdownOpen(false)
    setSwitchingFrom(activeBranch)
    setSwitchingTo(targetBranch)
    setHasAvatarReplaced(false)
    setSwitchProgress(15)
    setIsSwitching(true)

    const step1 = setTimeout(() => {
      setSwitchProgress(45)
      setHasAvatarReplaced(true)
    }, 380)
    const step2 = setTimeout(() => setSwitchProgress(80), 650)
    const step3 = setTimeout(() => setSwitchProgress(100), 900)

    const finish = setTimeout(() => {
      setActiveBranchId(targetBranch.id)
      saveActiveBranchId(targetBranch.id)
      setIsSwitching(false)

      // Trigger sonner toast
      toast.success(`Switched to ${targetBranch.name}`, {
        duration: 4000,
      })
    }, 1050)

    return () => {
      clearTimeout(step1)
      clearTimeout(step2)
      clearTimeout(step3)
      clearTimeout(finish)
    }
  }

  if (!activeBranch) return null

  const displayedModalBranch = hasAvatarReplaced ? switchingTo : switchingFrom
  const switchShortcut = ["Alt", "Shift", "B"] as const

  function onDropdownOpenChange(open: boolean) {
    setIsDropdownOpen(open)
    if (!open) setQuery("")
  }

  function onPickerKeyDown(event: React.KeyboardEvent) {
    if (event.metaKey || event.ctrlKey || event.altKey || query.trim()) return
    if (!/^[1-9]$/.test(event.key)) return
    const branch = accessibleBranches[Number(event.key) - 1]
    if (!branch) return
    event.preventDefault()
    handleBranchClick(branch)
  }

  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={onDropdownOpenChange}>
        <DropdownMenuTrigger
          render={
            <SidebarMenuButton
              size="lg"
              tooltip={{
                children: (
                  <>
                    <span>{activeBranch.name}</span>
                    <kbd
                      data-slot="kbd"
                      className="pointer-events-none ml-1 inline-flex h-5 items-center rounded border border-background/20 bg-background/15 px-1.5 font-mono text-[10px] font-medium text-background"
                    >
                      {formatShortcutLabel([...switchShortcut], isMac)}
                    </kbd>
                  </>
                ),
              }}
              className={cn(
                "h-12 cursor-pointer gap-2.5 rounded-lg px-2 data-popup-open:bg-sidebar-accent",
                className
              )}
            />
          }
        >
          <BranchMark branch={activeBranch} />
          <div className="grid min-w-0 flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-medium text-sidebar-foreground">
              {activeBranch.name}
            </span>
            <span className="truncate text-[11px] text-sidebar-foreground/50">
              {getBranchLocation(activeBranch)}
            </span>
          </div>
          <ChevronsUpDown className="ml-auto size-3.5 shrink-0 text-sidebar-foreground/40 group-data-[collapsible=icon]:hidden" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side={isMobile ? "bottom" : "right"}
          align="end"
          className="w-72 p-0"
        >
          <Command onKeyDown={onPickerKeyDown}>
            <div className="flex items-center justify-between gap-2 px-3 pt-2.5 pb-1">
              <p className="text-xs font-medium text-muted-foreground">
                Branches
              </p>
              <kbd className="pointer-events-none inline-flex h-5 items-center rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                {formatShortcutLabel([...switchShortcut], isMac)}
              </kbd>
            </div>
            <CommandInput
              placeholder="Search branches..."
              value={query}
              onValueChange={setQuery}
              onKeyDown={(event) => {
                event.stopPropagation()
                onPickerKeyDown(event)
              }}
            />
            <CommandList>
              <CommandEmpty>No branch found.</CommandEmpty>
              <CommandGroup>
                {accessibleBranches.map((branch, index) => (
                  <CommandItem
                    key={branch.id}
                    value={`${branch.name} ${branch.code} ${getBranchLocation(branch)}`}
                    onSelect={() => handleBranchClick(branch)}
                    className="gap-2"
                  >
                    <BranchMark
                      branch={branch}
                      className="size-6 rounded-md text-[10px]"
                    />
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5 leading-none">
                      <span className="truncate font-medium">{branch.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {getBranchLocation(branch)}
                      </span>
                    </span>
                    {branch.id === activeBranch.id ? (
                      <Check className="size-4 shrink-0 text-foreground" />
                    ) : null}
                    {index < 9 ? (
                      <CommandShortcut>{index + 1}</CommandShortcut>
                    ) : null}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Branch Switching Modal */}
      <Dialog open={isSwitching}>
        <DialogContent
          showCloseButton={false}
          className="gap-0 overflow-hidden p-0 sm:max-w-sm"
        >
          <div className="flex flex-col items-center pt-8 text-center">
            <div className="flex flex-col items-center px-6">
              {/* Stack with animated avatar transition */}
              <IconStack aria-hidden="true" className="text-primary">
                <AnimatePresence mode="wait">
                  {displayedModalBranch ? (
                    <m.div
                      key={displayedModalBranch.id}
                      initial={{ opacity: 0, scale: 0.6, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.6, y: -8 }}
                      transition={{ duration: 0.28, ease: "easeOut" }}
                      className="flex items-center justify-center"
                    >
                      <BranchAvatar branch={displayedModalBranch} />
                    </m.div>
                  ) : null}
                </AnimatePresence>
              </IconStack>

              <DialogTitle className="mt-5 text-lg font-semibold tracking-tight text-foreground">
                Switching Branch
              </DialogTitle>
              <DialogDescription className="sr-only">
                Switching branch from {switchingFrom?.name} to {switchingTo?.name}
              </DialogDescription>

              {/* Source -> Destination transition tag */}
              <div className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-border/60 bg-muted/40 px-3 py-1.5 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  {switchingFrom ? (
                    <BranchMark branch={switchingFrom} className="size-5 rounded text-[9px]" />
                  ) : null}
                  <span className="max-w-24 truncate text-muted-foreground font-medium">
                    {switchingFrom?.name}
                  </span>
                </div>
                <ArrowRight className="size-3.5 text-muted-foreground/60 shrink-0" />
                <div className="flex items-center gap-1.5">
                  {switchingTo ? (
                    <BranchMark branch={switchingTo} className="size-5 rounded bg-primary/15 text-primary text-[9px]" />
                  ) : null}
                  <span className="max-w-24 truncate font-semibold text-foreground">
                    {switchingTo?.name}
                  </span>
                </div>
              </div>

             
            </div>

            <div className="mt-6 w-full space-y-1.5 border-t border-border px-6 py-4 text-left">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] text-muted-foreground">
                  Switching workspace…
                </p>
                <p className="truncate text-[11px] font-medium text-muted-foreground tabular-nums">
                  {switchProgress}%
                </p>
              </div>
              <SetupProgressBar percent={switchProgress} className="h-1" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
