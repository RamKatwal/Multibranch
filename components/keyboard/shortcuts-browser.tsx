"use client"

import * as React from "react"
import { SearchIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useIsMac } from "@/hooks/use-is-mac"
import {
  keyboardShortcuts,
  shortcutCategories,
  type KeyboardShortcutDef,
  type ShortcutCategory,
} from "@/lib/keyboard/shortcuts"
import { formatShortcutParts } from "@/lib/keyboard/utils"
import { cn } from "@/lib/utils"

export function ShortcutKbd({
  parts,
  isMac,
}: {
  parts: string[]
  isMac: boolean
}) {
  const isSequence = parts.every(
    (part) => part.length === 1 && !["+", "−"].includes(part)
  )

  const labels = parts.map((part) => {
    if (part === "Mod" || part === "Ctrl" || part === "Cmd") {
      return isMac ? "⌘" : "Ctrl"
    }
    if (part === "Shift") return isMac ? "⇧" : "Shift"
    if (part === "Alt") return isMac ? "⌥" : "Alt"
    if (part === "Enter") return "↵"
    if (part === "Backspace") return isMac ? "⌫" : "Backspace"
    if (part === "Up") return "↑"
    if (part === "Down") return "↓"
    if (part === "Plus") return "+"
    if (part === "Minus") return "−"
    return part
  })

  return (
    <span className="inline-flex shrink-0 items-center gap-1">
      {labels.map((label, index) => (
        <React.Fragment key={`${label}-${index}`}>
          {index > 0 ? (
            <span className="text-[10px] text-muted-foreground">
              {isSequence ? "then" : isMac ? "" : "+"}
            </span>
          ) : null}
          <kbd className="pointer-events-none inline-flex h-5 min-w-5 items-center justify-center rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            {label}
          </kbd>
        </React.Fragment>
      ))}
    </span>
  )
}

function matchesQuery(
  shortcut: KeyboardShortcutDef,
  query: string,
  isMac: boolean
) {
  if (!query) return true

  const haystack = [
    shortcut.description,
    shortcut.category,
    formatShortcutParts(shortcut.keys, isMac),
    shortcut.keys.join(" "),
  ]
    .join(" ")
    .toLowerCase()

  return haystack.includes(query)
}

type ShortcutsBrowserProps = {
  className?: string
  listClassName?: string
  autoFocusSearch?: boolean
  /** Scroll the list inside the component instead of growing with the page. */
  scrollable?: boolean
}

export function ShortcutsBrowser({
  className,
  listClassName,
  autoFocusSearch = false,
  scrollable = false,
}: ShortcutsBrowserProps) {
  const isMac = useIsMac()
  const [query, setQuery] = React.useState("")
  const normalized = query.trim().toLowerCase()

  const grouped = React.useMemo(() => {
    const result: Partial<Record<ShortcutCategory, KeyboardShortcutDef[]>> = {}

    for (const category of shortcutCategories) {
      const items = keyboardShortcuts.filter(
        (shortcut) =>
          shortcut.category === category &&
          matchesQuery(shortcut, normalized, isMac)
      )

      if (items.length) result[category] = items
    }

    return result
  }, [normalized, isMac])

  const hasResults = Object.keys(grouped).length > 0

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div className="shrink-0 border-b px-5 py-3">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search shortcuts..."
            className="pl-9"
            autoFocus={autoFocusSearch}
          />
        </div>
      </div>

      <div
        className={cn(
          "px-5 py-4",
          scrollable && "thin-scrollbar min-h-0 flex-1 overflow-y-auto",
          listClassName
        )}
      >
        {!hasResults ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No shortcuts match “{query}”.
          </p>
        ) : (
          <div className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {shortcutCategories.map((category) => {
              const items = grouped[category]
              if (!items?.length) return null

              return (
                <section key={category} className="space-y-2">
                  <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    {category}
                  </h3>
                  <ul className="divide-y rounded-lg border">
                    {items.map((shortcut) => (
                      <li
                        key={shortcut.id}
                        className="flex items-center justify-between gap-3 px-3 py-2"
                      >
                        <div className="flex min-w-0 items-center gap-1.5">
                          <span className="truncate text-xs">
                            {shortcut.description}
                          </span>
                          {shortcut.availability === "planned" ? (
                            <Badge
                              variant="soft"
                              size="20"
                              className="shrink-0 text-[10px]"
                            >
                              Soon
                            </Badge>
                          ) : null}
                        </div>
                        <ShortcutKbd parts={shortcut.keys} isMac={isMac} />
                      </li>
                    ))}
                  </ul>
                </section>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
