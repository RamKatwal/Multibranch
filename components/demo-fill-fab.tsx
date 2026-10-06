"use client"

import * as React from "react"
import { MagicWand01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { IconButton } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useIsMac } from "@/hooks/use-is-mac"
import { formatShortcutParts } from "@/lib/keyboard/utils"
import { cn } from "@/lib/utils"

const DEFAULT_SHORTCUT_KEY = "d"

export type DemoFillAction = {
  label: string
  onFill: () => void
  /** Letter used with Mod+Shift (e.g. "d" → ⌘⇧D / Ctrl+Shift+D). */
  shortcutKey: string
}

type DemoFillFabProps = {
  label?: string
  onFill?: () => void
  /** Multiple fill options with their own shortcuts. Takes precedence over label/onFill. */
  actions?: DemoFillAction[]
  className?: string
}

function resolveActions({
  label,
  onFill,
  actions,
}: Pick<DemoFillFabProps, "label" | "onFill" | "actions">): DemoFillAction[] {
  if (actions && actions.length > 0) return actions
  if (onFill) {
    return [
      {
        label: label ?? "Fill demo data",
        onFill,
        shortcutKey: DEFAULT_SHORTCUT_KEY,
      },
    ]
  }
  return []
}

/** Fixed bottom-right control to autofill demo form data while prototyping. */
export function DemoFillFab({
  label = "Fill demo data",
  onFill,
  actions,
  className,
}: DemoFillFabProps) {
  const isMac = useIsMac()
  const resolved = React.useMemo(
    () => resolveActions({ label, onFill, actions }),
    [actions, label, onFill]
  )
  const actionsRef = React.useRef(resolved)

  React.useEffect(() => {
    actionsRef.current = resolved
  }, [resolved])

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const mod = event.metaKey || event.ctrlKey
      if (!mod || !event.shiftKey) return
      if (event.altKey || event.repeat) return

      const key = event.key.toLowerCase()
      const match = actionsRef.current.find(
        (action) => action.shortcutKey.toLowerCase() === key
      )
      if (!match) return

      event.preventDefault()
      match.onFill()
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  if (resolved.length === 0) return null

  const fabClassName = cn(
    "fixed right-5 bottom-5 z-50 rounded-full shadow-lg",
    "md:right-8 md:bottom-8",
    className
  )

  if (resolved.length === 1) {
    const action = resolved[0]
    const shortcutLabel = formatShortcutParts(
      ["Mod", "Shift", action.shortcutKey.toUpperCase()],
      isMac
    )

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <IconButton
            type="button"
            size="32"
            onClick={action.onFill}
            className={fabClassName}
            aria-label={`${action.label} (${shortcutLabel})`}
          >
            <HugeiconsIcon icon={MagicWand01Icon} className="size-4 shrink-0" />
          </IconButton>
        </TooltipTrigger>
        <TooltipContent side="left" className="flex items-center gap-1.5">
          <span>{action.label}</span>
          <kbd
            data-slot="kbd"
            className="pointer-events-none inline-flex h-5 items-center rounded border border-background/20 bg-background/15 px-1.5 font-mono text-[10px] font-medium text-background"
          >
            {shortcutLabel}
          </kbd>
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton
          type="button"
          size="32"
          className={fabClassName}
          aria-label="Fill demo login"
        >
          <HugeiconsIcon icon={MagicWand01Icon} className="size-4 shrink-0" />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" sideOffset={8} className="min-w-52">
        {resolved.map((action) => {
          const shortcutLabel = formatShortcutParts(
            ["Mod", "Shift", action.shortcutKey.toUpperCase()],
            isMac
          )
          return (
            <DropdownMenuItem
              key={action.shortcutKey}
              onClick={action.onFill}
              className="justify-between gap-3"
            >
              <span>{action.label}</span>
              <kbd
                data-slot="kbd"
                className="pointer-events-none inline-flex h-5 items-center rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground"
              >
                {shortcutLabel}
              </kbd>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
