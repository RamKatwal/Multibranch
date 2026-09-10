"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  BookOpenIcon,
  FileTextIcon,
  GitBranchIcon,
  KeyboardIcon,
  LandmarkIcon,
  LayoutDashboardIcon,
  PackageIcon,
  PlusCircleIcon,
  ReceiptIcon,
  SearchIcon,
  SettingsIcon,
  ShoppingCartIcon,
  UsersIcon,
  WalletIcon,
} from "lucide-react"

import { useKeyboardShortcuts } from "@/components/layout/keyboard-shortcuts-provider"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { useIsMac } from "@/hooks/use-is-mac"
import { mainNavigation } from "@/config/navigation"
import { createMenuSections } from "@/lib/dashboard/mock-data"
import { formatShortcutParts, modKeyLabel } from "@/lib/keyboard/utils"
import { cn } from "@/lib/utils"

type PaletteItem = {
  id: string
  title: string
  href: string
  keywords: string
  group: "Pages" | "Quick Create" | "Reports & Configurations"
  shortcut?: string
  icon: React.ComponentType<{ className?: string }>
}

function iconForHref(href: string): React.ComponentType<{ className?: string }> {
  if (href.startsWith("/accounting")) return BookOpenIcon
  if (href.startsWith("/purchase")) return ShoppingCartIcon
  if (href.startsWith("/sales")) return ReceiptIcon
  if (href.startsWith("/inventory")) return PackageIcon
  if (href.startsWith("/configurations")) return SettingsIcon
  if (href.startsWith("/reports")) return FileTextIcon
  if (
    href === "/customers" ||
    href === "/sales/customers" ||
    href === "/suppliers" ||
    href === "/purchase/suppliers"
  )
    return UsersIcon
  if (href.includes("bank")) return LandmarkIcon
  if (href.includes("payment")) return WalletIcon
  if (href === "/") return LayoutDashboardIcon
  return FileTextIcon
}

function buildPaletteItems(): PaletteItem[] {
  const items: PaletteItem[] = []
  const seen = new Set<string>()

  function add(item: Omit<PaletteItem, "id"> & { id?: string }) {
    const id = item.id ?? item.href
    if (seen.has(id)) return
    seen.add(id)
    items.push({ ...item, id })
  }

  for (const nav of mainNavigation) {
    add({
      title: nav.title,
      href: nav.href,
      keywords: [nav.title, nav.description ?? "", "page", "go to"].join(" "),
      group: nav.href === "/reports" || nav.href === "/configurations"
        ? "Reports & Configurations"
        : "Pages",
      icon: iconForHref(nav.href),
      shortcut:
        nav.href === "/"
          ? "G H"
          : nav.href === "/reports"
            ? "G R"
            : nav.href === "/accounting"
              ? "G T"
              : undefined,
    })

    for (const child of nav.children ?? []) {
      const navShortcut =
        child.href === "/accounting/chart-of-accounts"
          ? "G A"
          : child.href === "/purchase/payments"
            ? "G P"
            : undefined

      add({
        title: child.title,
        href: child.href,
        keywords: [
          child.title,
          child.description ?? "",
          nav.title,
          "page",
          "go to",
        ].join(" "),
        group: "Pages",
        icon: iconForHref(child.href),
        shortcut: navShortcut,
      })
    }
  }

  // Extra destinations referenced by shortcuts / natural language
  const extras: Array<{
    title: string
    href: string
    keywords: string
    shortcut?: string
    group?: PaletteItem["group"]
  }> = [
    {
      title: "Customers",
      href: "/sales/customers",
      keywords: "customer clients party create customer",
      shortcut: "G C",
    },
    {
      title: "Vendors / Suppliers",
      href: "/purchase/suppliers",
      keywords: "vendor supplier party create vendor",
      shortcut: "G V",
    },
    {
      title: "Invoices",
      href: "/sales/invoice",
      keywords: "invoice sales invoice new invoice create invoice INV",
      shortcut: "G I",
    },
    {
      title: "Bills",
      href: "/purchase/invoice",
      keywords: "bill purchase invoice new bill create bill",
      shortcut: "G B",
    },
    {
      title: "Journal Entries",
      href: "/accounting/journal-voucher",
      keywords: "journal entry voucher journal",
      shortcut: "G J",
    },
    {
      title: "General Ledger",
      href: "/accounting/chart-of-accounts",
      keywords: "general ledger gl trial balance",
      shortcut: "G G",
    },
    {
      title: "Bank Accounts",
      href: "/accounting/bank-accounts",
      keywords: "bank account reconciliation fund transfer",
    },
    {
      title: "Trial Balance",
      href: "/reports",
      keywords: "trial balance report financial",
      group: "Reports & Configurations",
    },
    {
      title: "Profit and Loss",
      href: "/reports",
      keywords: "profit and loss p&l income statement report",
      group: "Reports & Configurations",
    },
    {
      title: "Balance Sheet",
      href: "/reports",
      keywords: "balance sheet report financial",
      group: "Reports & Configurations",
    },
    {
      title: "Bank Reconciliation",
      href: "/accounting/bank-accounts",
      keywords: "bank reconciliation reconcile",
    },
    {
      title: "Tax Return",
      href: "/accounting",
      keywords: "tax return tax center vat",
      shortcut: "G T",
    },
  ]

  for (const extra of extras) {
    add({
      ...extra,
      group: extra.group ?? "Pages",
      icon: iconForHref(extra.href),
    })
  }

  for (const section of createMenuSections) {
    for (const item of section.items) {
      add({
        id: `create:${item.href}:${item.label}`,
        title: `Create ${item.label}`,
        href: item.href,
        keywords: [
          item.label,
          section.title,
          "create",
          "new",
          "quick create",
          item.shortcut ?? "",
        ].join(" "),
        group: "Quick Create",
        icon: PlusCircleIcon,
        shortcut: item.shortcut,
      })
    }
  }

  return items
}

const paletteItems = buildPaletteItems()

export function CommandSearch({ className }: { className?: string }) {
  const router = useRouter()
  const isMac = useIsMac()
  const { commandOpen, setCommandOpen, openShortcutsHelp, openQuickCreate, openBranchSwitcher } =
    useKeyboardShortcuts()

  function runCommand(command: () => void) {
    setCommandOpen(false)
    command()
  }

  const pages = paletteItems.filter((i) => i.group === "Pages")
  const creates = paletteItems.filter((i) => i.group === "Quick Create")
  const reports = paletteItems.filter((i) => i.group === "Reports & Configurations")

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        aria-label="Search"
        className="sm:hidden"
        onClick={() => setCommandOpen(true)}
      >
        <SearchIcon />
      </Button>

      <button
        type="button"
        onClick={() => setCommandOpen(true)}
        className={cn(
          "hidden h-8 w-44 items-center gap-2 rounded-md border border-input bg-input/20 px-2 text-xs text-muted-foreground transition-colors outline-none sm:inline-flex",
          "hover:bg-input/40 hover:text-foreground",
          "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
          "dark:bg-input/30",
          className
        )}
        aria-label="Search"
      >
        <SearchIcon className="size-3.5 shrink-0 opacity-50" />
        <span className="flex-1 truncate text-left">Search...</span>
        <kbd className="pointer-events-none inline-flex h-5 items-center gap-0.5 rounded border bg-muted px-1 font-mono text-[10px] font-medium text-muted-foreground">
          {modKeyLabel(isMac)}
          <span className="text-[10px]">K</span>
        </kbd>
      </button>

      <CommandDialog
        open={commandOpen}
        onOpenChange={setCommandOpen}
        className="sm:max-w-lg"
        title="Command Palette"
        description="Search pages, create actions, and reports"
      >
        <Command>
          <CommandInput placeholder="Search pages, create actions, reports..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>

            <CommandGroup heading="Suggestions">
              <CommandItem
                value="open quick create new"
                onSelect={() => runCommand(() => openQuickCreate())}
              >
                <PlusCircleIcon />
                <span>Quick Create</span>
                <CommandShortcut>
                  {formatShortcutParts(["Alt", "N"], isMac)}
                </CommandShortcut>
              </CommandItem>
              <CommandItem
                value="switch branch location workspace"
                onSelect={() => runCommand(() => openBranchSwitcher())}
              >
                <GitBranchIcon />
                <span>Switch Branch</span>
                <CommandShortcut>
                  {formatShortcutParts(["Alt", "Shift", "B"], isMac)}
                </CommandShortcut>
              </CommandItem>
              <CommandItem
                value="keyboard shortcuts help"
                onSelect={() => runCommand(() => openShortcutsHelp())}
              >
                <KeyboardIcon />
                <span>Keyboard Shortcuts</span>
                <CommandShortcut>
                  {formatShortcutParts(["Mod", "/"], isMac)}
                </CommandShortcut>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Pages">
              {pages.map((page) => (
                <CommandItem
                  key={page.id}
                  value={`${page.title} ${page.keywords}`}
                  onSelect={() => runCommand(() => router.push(page.href))}
                >
                  <page.icon />
                  <span>{page.title}</span>
                  {page.shortcut ? (
                    <CommandShortcut>{page.shortcut}</CommandShortcut>
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Quick Create">
              {creates.map((action) => (
                <CommandItem
                  key={action.id}
                  value={`${action.title} ${action.keywords}`}
                  onSelect={() => runCommand(() => router.push(action.href))}
                >
                  <action.icon />
                  <span>{action.title}</span>
                  {action.shortcut ? (
                    <CommandShortcut>
                      {isMac
                        ? action.shortcut.replace(/^Alt\+/i, "⌥")
                        : action.shortcut}
                    </CommandShortcut>
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Reports & Configurations">
              {reports.map((page) => (
                <CommandItem
                  key={page.id}
                  value={`${page.title} ${page.keywords}`}
                  onSelect={() => runCommand(() => router.push(page.href))}
                >
                  <page.icon />
                  <span>{page.title}</span>
                  {page.shortcut ? (
                    <CommandShortcut>{page.shortcut}</CommandShortcut>
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
