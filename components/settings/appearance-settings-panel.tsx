"use client"

import * as React from "react"
import { CheckIcon, ChevronsUpDownIcon, SearchIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { useAppearance } from "@/components/appearance/appearance-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { fontOptions, getFontOption } from "@/lib/appearance/fonts"
import {
  getThemeColorOption,
  themeColorOptions,
} from "@/lib/appearance/theme-colors"
import type { FontId, ThemeColorId } from "@/lib/appearance/types"
import { cn } from "@/lib/utils"

type AppearanceSettingsPanelProps = {
  className?: string
}

export function AppearanceSettingsPanel({
  className,
}: AppearanceSettingsPanelProps) {
  const { colorId, fontId, setColorId, setFontId, resetAppearance } =
    useAppearance()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const selectedColor = getThemeColorOption(colorId)
  const selectedFont = getFontOption(fontId)

  return (
    <div className={cn("flex flex-col", className)}>
      <AppearanceSection
        title="Theme & typeface"
        action={
          <Button
            type="button"
            variant="ghost"
            color="neutral"
            size="32"
            className="h-7 text-xs text-muted-foreground"
            onClick={resetAppearance}
          >
            Reset
          </Button>
        }
      >
        <AppearanceRow
          label="Mode"
          description="Light, dark, or match the system."
        >
          <div className="inline-flex rounded-lg border bg-muted/40 p-0.5">
            {(
              [
                { value: "light", label: "Light" },
                { value: "dark", label: "Dark" },
                { value: "system", label: "System" },
              ] as const
            ).map((option) => {
              const active = mounted && theme === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={!mounted}
                  onClick={() => setTheme(option.value)}
                  className={cn(
                    "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                    active
                      ? "bg-background text-foreground shadow-sm ring-1 ring-foreground/10"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </AppearanceRow>

        <AppearanceRow
          label="Theme"
          description="Color accent for the whole app."
        >
          <ThemePicker value={colorId} onChange={setColorId} />
        </AppearanceRow>

        <AppearanceRow
          label="Font"
          description="UI typeface used across the workspace."
        >
          <FontPicker value={fontId} onChange={setFontId} />
        </AppearanceRow>
      </AppearanceSection>

      <AppearanceSection title="Live preview">
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="flex items-center justify-between gap-3 border-b bg-muted/30 px-4 py-2.5">
            <div className="flex items-center gap-2">
              {selectedColor ? (
                <ThemeSwatch
                  swatch={selectedColor.swatch}
                  surface={selectedColor.surface}
                  className="size-5"
                />
              ) : null}
              <span className="text-xs font-medium">
                {selectedColor?.label} · {selectedFont?.label}
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              {mounted
                ? resolvedTheme === "dark"
                  ? "Dark mode"
                  : "Light mode"
                : "…"}
            </span>
          </div>

          <div className="space-y-4 p-4">
            <div
              className="space-y-1"
              style={{ fontFamily: selectedFont?.previewFamily }}
            >
              <p className="text-lg font-semibold tracking-tight">
                The quick brown fox
              </p>
              <p className="text-sm text-muted-foreground">
                Pack my box with five dozen liquor jugs — 0123456789
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" size="32">
                Primary
              </Button>
              <Button type="button" size="32" variant="outline" color="neutral">
                Outline
              </Button>
              <Button type="button" size="32" variant="soft" color="neutral">
                Secondary
              </Button>
              <span className="inline-flex overflow-hidden rounded-md border text-xs">
                <span className="bg-primary px-2.5 py-1.5 font-medium text-primary-foreground">
                  Active
                </span>
                <span className="bg-card px-2.5 py-1.5 text-muted-foreground">
                  Inactive
                </span>
              </span>
            </div>
          </div>
        </div>
      </AppearanceSection>
    </div>
  )
}

function AppearanceSection({
  title,
  action,
  children,
}: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="border-b py-5 last:border-b-0 last:pb-0 first:pt-0">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          {title}
        </h3>
        {action}
      </div>
      <div className="flex flex-col divide-y">{children}</div>
    </section>
  )
}

function AppearanceRow({
  label,
  description,
  children,
}: {
  label: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0 sm:max-w-[14rem]">
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="w-full shrink-0 sm:w-[14rem]">{children}</div>
    </div>
  )
}

function ThemeSwatch({
  swatch,
  surface,
  className,
}: {
  swatch: string
  surface: string
  className?: string
}) {
  return (
    <span
      className={cn(
        "relative inline-flex size-5 shrink-0 overflow-hidden rounded-full border border-black/10 shadow-sm dark:border-white/15",
        className
      )}
      aria-hidden
    >
      <span className="absolute inset-0" style={{ backgroundColor: surface }} />
      <span
        className="absolute inset-0"
        style={{
          backgroundColor: swatch,
          clipPath: "polygon(50% 0, 100% 0, 100% 100%, 50% 100%)",
        }}
      />
    </span>
  )
}

function ThemePicker({
  value,
  onChange,
}: {
  value: ThemeColorId
  onChange: (id: ThemeColorId) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const selected = getThemeColorOption(value)

  const filtered = themeColorOptions.filter((option) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return (
      option.label.toLowerCase().includes(q) ||
      option.description.toLowerCase().includes(q)
    )
  })

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setQuery("")
      }}
    >
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-9 w-full items-center gap-2 rounded-lg border border-input bg-transparent px-2.5 text-left text-sm outline-none transition-colors",
            "hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
          )}
        >
          {selected ? (
            <ThemeSwatch swatch={selected.swatch} surface={selected.surface} />
          ) : null}
          <span className="min-w-0 flex-1 truncate">{selected?.label ?? "Theme"}</span>
          <ChevronsUpDownIcon className="size-3.5 shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 p-0" sideOffset={6}>
        <div className="border-b p-2" onPointerDown={(e) => e.preventDefault()}>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search themes..."
              className="h-8 pl-7"
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <p className="px-2 py-3 text-center text-xs text-muted-foreground">
              No themes found
            </p>
          ) : (
            filtered.map((option) => {
              const active = option.id === value
              return (
                <DropdownMenuItem
                  key={option.id}
                  className="gap-2.5"
                  onClick={() => onChange(option.id)}
                >
                  <ThemeSwatch
                    swatch={option.swatch}
                    surface={option.surface}
                    className="size-4 rounded-sm"
                  />
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {option.label}
                  </span>
                  {active ? (
                    <CheckIcon className="size-3.5 shrink-0 text-foreground" />
                  ) : (
                    <span className="size-3.5 shrink-0" />
                  )}
                </DropdownMenuItem>
              )
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function FontPicker({
  value,
  onChange,
}: {
  value: FontId
  onChange: (id: FontId) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const selected = getFontOption(value)

  const filtered = fontOptions.filter((option) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return (
      option.label.toLowerCase().includes(q) ||
      option.description.toLowerCase().includes(q)
    )
  })

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setQuery("")
      }}
    >
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-9 w-full items-center gap-2 rounded-lg border border-input bg-transparent px-2.5 text-left text-sm outline-none transition-colors",
            "hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
          )}
        >
          <span
            className="flex size-5 shrink-0 items-center justify-center rounded-md border bg-muted/50 text-[10px] font-semibold"
            style={{ fontFamily: selected?.previewFamily }}
            aria-hidden
          >
            Aa
          </span>
          <span className="min-w-0 flex-1 truncate">{selected?.label ?? "Font"}</span>
          <ChevronsUpDownIcon className="size-3.5 shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 p-0" sideOffset={6}>
        <div className="border-b p-2" onPointerDown={(e) => e.preventDefault()}>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search fonts..."
              className="h-8 pl-7"
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-64 overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <p className="px-2 py-3 text-center text-xs text-muted-foreground">
              No fonts found
            </p>
          ) : (
            filtered.map((option) => {
              const active = option.id === value
              return (
                <DropdownMenuItem
                  key={option.id}
                  className="gap-2.5 py-2"
                  onClick={() => onChange(option.id)}
                >
                  <span
                    className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted/40 text-sm font-semibold"
                    style={{ fontFamily: option.previewFamily }}
                    aria-hidden
                  >
                    Aa
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className="block truncate text-sm font-medium"
                      style={{ fontFamily: option.previewFamily }}
                    >
                      {option.label}
                    </span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {option.description}
                    </span>
                  </span>
                  {active ? (
                    <CheckIcon className="size-3.5 shrink-0 text-primary" />
                  ) : (
                    <span className="size-3.5 shrink-0" />
                  )}
                </DropdownMenuItem>
              )
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
