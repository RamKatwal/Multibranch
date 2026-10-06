"use client"

import * as React from "react"
import Link from "next/link"
import { Plus } from "lucide-react"

import {
  DuoAccountingIcon,
  DuoBankAccountsIcon,
  DuoChartOfAccountsIcon,
  DuoExpenseIcon,
  DuoOrderIcon,
  DuoPaymentsIcon,
  DuoProductsIcon,
  DuoPurchaseIcon,
  DuoReturnIcon,
  DuoSalesIcon,
} from "@/components/icons/duo"
import { useKeyboardShortcuts } from "@/components/layout/keyboard-shortcuts-provider"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useIsMac } from "@/hooks/use-is-mac"
import { createMenuSections } from "@/lib/dashboard/mock-data"
import { cn } from "@/lib/utils"
import type { NavIcon } from "@/types/navigation"

const createActionIcons: Record<string, NavIcon> = {
  "/customers": DuoSalesIcon,
  "/sales/customers": DuoSalesIcon,
  "/suppliers": DuoPurchaseIcon,
  "/purchase/suppliers": DuoPurchaseIcon,
  "/inventory/products": DuoProductsIcon,
  "/accounting/contra": DuoAccountingIcon,
  "/purchase/invoice": DuoPurchaseIcon,
  "/purchase/order": DuoOrderIcon,
  "/purchase/return": DuoReturnIcon,
  "/purchase/expense": DuoExpenseIcon,
  "/purchase/payments": DuoPaymentsIcon,
  "/sales/invoice": DuoSalesIcon,
  "/sales/order": DuoOrderIcon,
  "/sales/payments": DuoPaymentsIcon,
  "/sales/return": DuoReturnIcon,
  "/accounting/chart-of-accounts": DuoChartOfAccountsIcon,
  "/accounting/bank-accounts": DuoBankAccountsIcon,
  "/accounting/journal-voucher": DuoAccountingIcon,
  "/accounting/payment-voucher": DuoPaymentsIcon,
  "/accounting/receipt-voucher": DuoPaymentsIcon,
}

function displayShortcut(shortcut: string, isMac: boolean) {
  if (!isMac) return shortcut
  return shortcut.replace(/^Alt\+/i, "⌥")
}

export function CreateDialog() {
  const { createOpen, setCreateOpen } = useKeyboardShortcuts()
  const isMac = useIsMac()

  return (
    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
      <DialogTrigger asChild>
        <Button size="32" className="gap-1.5 px-2.5">
          <Plus className="size-3.5" />
          Create
          <kbd className="pointer-events-none ml-0.5 hidden h-5 items-center gap-0.5 rounded border border-primary-foreground/20 bg-primary-foreground/15 px-1 font-mono text-[10px] font-medium text-primary-foreground sm:inline-flex">
            {isMac ? "⌥" : "Alt"}
            <span>N</span>
          </kbd>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="overflow-hidden sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create</DialogTitle>
          <DialogDescription className="sr-only">
            Quick access to create common records.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="thin-scrollbar max-h-[min(32rem,70vh)] space-y-5 overflow-y-auto">
          {createMenuSections.map((section) => (
            <section key={section.title} className="space-y-2">
              <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {section.title}
              </h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {section.items.map((item) => {
                  const Icon =
                    createActionIcons[item.href] ??
                    createActionIcons[item.href.split("?")[0]]

                  return (
                    <Button
                      key={item.label}
                      variant="outline"
                      color="neutral"
                      className="h-auto w-full justify-start gap-2.5 px-3 py-2.5 text-sm font-normal"
                      asChild
                    >
                      <Link
                          href={item.href}
                          onClick={() => setCreateOpen(false)}>
                        {Icon ? (
                          <Icon className="size-4 shrink-0 text-foreground" />
                        ) : null}
                        <span className="min-w-0 flex-1 truncate text-left">
                          {item.label}
                        </span>
                        {item.shortcut ? (
                          <kbd
                            className={cn(
                              "pointer-events-none ml-auto shrink-0 rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground"
                            )}
                          >
                            {displayShortcut(item.shortcut, isMac)}
                          </kbd>
                        ) : null}
                      </Link>
                    </Button>
                  )
                })}
              </div>
            </section>
          ))}
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
