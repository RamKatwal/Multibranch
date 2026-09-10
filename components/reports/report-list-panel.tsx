"use client"

import * as React from "react"
import Link from "next/link"
import {
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  SearchIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { reportCatalog, type ReportCategory } from "@/lib/reports/catalog"
import { cn } from "@/lib/utils"

const MIN_WIDTH = 224
const MAX_WIDTH = 480
const DEFAULT_WIDTH = 288
const COLLAPSED_WIDTH = 52

const WIDTH_KEY = "reports-panel-width"
const COLLAPSED_KEY = "reports-panel-collapsed"

function readStoredWidth() {
  try {
    const value = Number(window.localStorage.getItem(WIDTH_KEY))
    if (Number.isFinite(value) && value >= MIN_WIDTH && value <= MAX_WIDTH) {
      return value
    }
  } catch {
    // ignore
  }
  return DEFAULT_WIDTH
}

function readStoredCollapsed() {
  try {
    return window.localStorage.getItem(COLLAPSED_KEY) === "1"
  } catch {
    return false
  }
}

function persist(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // ignore
  }
}

type ReportListPanelProps = {
  /** Href of the report currently being viewed, highlighted in the list. */
  activeHref: string
  className?: string
}

export function ReportListPanel({ activeHref, className }: ReportListPanelProps) {
  const [query, setQuery] = React.useState("")
  const [collapsed, setCollapsed] = React.useState(false)
  const [width, setWidth] = React.useState(DEFAULT_WIDTH)
  const [resizing, setResizing] = React.useState(false)
  const asideRef = React.useRef<HTMLElement | null>(null)

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCollapsed(readStoredCollapsed())
    setWidth(readStoredWidth())
  }, [])

  const needle = query.trim().toLowerCase()

  const categories = React.useMemo(() => {
    if (!needle) return reportCatalog

    return reportCatalog
      .map((category) => ({
        ...category,
        reports: category.reports.filter(
          (report) =>
            report.title.toLowerCase().includes(needle) ||
            category.title.toLowerCase().includes(needle)
        ),
      }))
      .filter((category) => category.reports.length > 0)
  }, [needle])

  const total = reportCatalog.reduce(
    (sum, category) => sum + category.reports.length,
    0
  )
  const shown = categories.reduce(
    (sum, category) => sum + category.reports.length,
    0
  )

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current
      persist(COLLAPSED_KEY, next ? "1" : "0")
      return next
    })
  }

  function startResize(event: React.PointerEvent) {
    event.preventDefault()
    setResizing(true)
  }

  React.useEffect(() => {
    if (!resizing) return

    function onMove(event: PointerEvent) {
      const left = asideRef.current?.getBoundingClientRect().left ?? 0
      setWidth(
        Math.min(
          MAX_WIDTH,
          Math.max(MIN_WIDTH, Math.round(event.clientX - left))
        )
      )
    }

    function onUp() {
      setResizing(false)
      const measured = asideRef.current?.offsetWidth
      if (measured) persist(WIDTH_KEY, String(measured))
    }

    document.addEventListener("pointermove", onMove)
    document.addEventListener("pointerup", onUp)
    const previousUserSelect = document.body.style.userSelect
    document.body.style.userSelect = "none"

    return () => {
      document.removeEventListener("pointermove", onMove)
      document.removeEventListener("pointerup", onUp)
      document.body.style.userSelect = previousUserSelect
    }
  }, [resizing])

  return (
    <aside
      ref={asideRef}
      style={{ width: collapsed ? COLLAPSED_WIDTH : width }}
      className={cn(
        "relative sticky top-14 flex h-[calc(100svh-3.5rem)] shrink-0 flex-col overflow-hidden border-r bg-card",
        !resizing && "transition-[width] duration-150",
        className
      )}
    >
      {collapsed ? (
        <CollapsedRail
          categories={reportCatalog}
          activeHref={activeHref}
          onExpand={toggleCollapsed}
        />
      ) : (
        <>
          <div className="flex shrink-0 flex-col gap-2 border-b px-3 py-2.5">
            <div className="flex items-center justify-between gap-1 pl-1">
              <p className="text-xs font-semibold">All Reports</p>
              <Button
                variant="ghost"
                size="icon-sm"
                className="size-7 text-muted-foreground"
                aria-label="Collapse reports list"
                onClick={toggleCollapsed}
              >
                <PanelLeftCloseIcon className="size-4" />
              </Button>
            </div>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search reports…"
                className="h-8 bg-background pl-8 text-xs"
                aria-label="Search reports"
              />
            </div>
          </div>

          <nav className="thin-scrollbar min-h-0 flex-1 overflow-y-auto py-1">
            {categories.length ? (
              categories.map((category) => (
                <div key={category.id} className="py-1">
                  <p className="px-4 pt-1 pb-1 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                    {category.title}
                  </p>
                  <ul>
                    {category.reports.map((report) => (
                      <li key={report.title}>
                        <ReportLink
                          title={report.title}
                          href={report.href}
                          active={report.href === activeHref}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <div className="px-4 py-10 text-center text-xs text-muted-foreground">
                No reports match &ldquo;{query}&rdquo;.
              </div>
            )}
          </nav>

          <div className="shrink-0 border-t px-3 py-2 text-[11px] tabular-nums text-muted-foreground">
            {shown} of {total} reports
          </div>

          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize reports list"
            onPointerDown={startResize}
            className={cn(
              "absolute inset-y-0 right-0 z-10 w-1.5 cursor-col-resize touch-none",
              "hover:bg-primary/30",
              resizing && "bg-primary/40"
            )}
          />
        </>
      )}
    </aside>
  )
}

function ReportLink({
  title,
  href,
  active,
}: {
  title: string
  href?: string
  active: boolean
}) {
  if (!href) {
    return (
      <span
        className="block cursor-default px-4 py-1.5 text-xs text-muted-foreground/50"
        title="Coming soon"
      >
        {title}
      </span>
    )
  }

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "block border-l-2 border-transparent px-4 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-l-primary bg-primary/5 text-foreground"
          : "text-foreground hover:bg-muted/50"
      )}
    >
      {title}
    </Link>
  )
}

function CollapsedRail({
  categories,
  activeHref,
  onExpand,
}: {
  categories: ReportCategory[]
  activeHref: string
  onExpand: () => void
}) {
  return (
    <>
      <div className="flex h-[3.25rem] shrink-0 items-center justify-center border-b">
        <Button
          variant="ghost"
          size="icon-sm"
          className="size-8 text-muted-foreground"
          aria-label="Expand reports list"
          onClick={onExpand}
        >
          <PanelLeftOpenIcon className="size-4" />
        </Button>
      </div>

      <div className="thin-scrollbar flex min-h-0 flex-1 flex-col items-center gap-1 overflow-y-auto py-2">
        {categories.map((category) => {
          const Icon = category.icon
          const hasActive = category.reports.some(
            (report) => report.href === activeHref
          )

          return (
            <Popover key={category.id}>
              <PopoverTrigger
                openOnHover
                delay={80}
                closeDelay={120}
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={category.title}
                    className={cn(
                      "size-9",
                      hasActive && "bg-primary/10 text-primary"
                    )}
                  />
                }
              >
                <Icon className="size-4" />
              </PopoverTrigger>
              <PopoverContent
                side="right"
                align="start"
                sideOffset={8}
                className="w-64 min-w-64 p-1"
              >
                <p className="px-3 pt-1.5 pb-1 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                  {category.title}
                </p>
                <ul>
                  {category.reports.map((report) => (
                    <li key={report.title}>
                      <ReportLink
                        title={report.title}
                        href={report.href}
                        active={report.href === activeHref}
                      />
                    </li>
                  ))}
                </ul>
              </PopoverContent>
            </Popover>
          )
        })}
      </div>
    </>
  )
}
