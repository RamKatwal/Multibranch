"use client"

import * as React from "react"
import { CheckIcon, PlusIcon, SearchIcon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  FormDialogBody,
  FormDialogContent,
  FormDialogHeader,
  FormDialogTitle,
} from "@/components/ui/form-dialog"
import { Input } from "@/components/ui/input"
import type { Supplier } from "@/types/supplier"

type SearchAddSupplierDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentBranchId?: string
  allSuppliers: Supplier[]
  onAddSupplierToBranch: (supplierId: string, branchId: string) => void
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0 || !parts[0]) return "S"
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function SearchAddSupplierDialog({
  open,
  onOpenChange,
  currentBranchId = "br_ht_01",
  allSuppliers,
  onAddSupplierToBranch,
}: SearchAddSupplierDialogProps) {
  const [query, setQuery] = React.useState("")
  const [confirmSupplier, setConfirmSupplier] = React.useState<Supplier | null>(null)

  // Reset query when dialog opens/closes
  React.useEffect(() => {
    if (!open) {
      setQuery("")
      setConfirmSupplier(null)
    }
  }, [open])

  // Suppliers eligible for adding (from other branches)
  const availableSuppliers = React.useMemo(() => {
    return allSuppliers.filter((s) => s.createdBranchId !== currentBranchId)
  }, [allSuppliers, currentBranchId])

  // Filter suppliers by Name or PAN only
  const filteredSuppliers = React.useMemo(() => {
    const trimmed = query.trim().toLowerCase()
    if (!trimmed) return []

    return availableSuppliers.filter((supplier) => {
      const nameMatch = supplier.name.toLowerCase().includes(trimmed)
      const panMatch = (supplier.panNumber ?? "").toLowerCase().includes(trimmed)

      return nameMatch || panMatch
    })
  }, [availableSuppliers, query])

  function handleConfirmAdd(supplier: Supplier) {
    onAddSupplierToBranch(supplier.id, currentBranchId)
    toast.success(`Supplier "${supplier.name}" added to current branch`)
    setConfirmSupplier(null)
  }

  const isQueryEmpty = !query.trim()

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <FormDialogContent size="md">
          <FormDialogHeader>
            <FormDialogTitle>Search and Add</FormDialogTitle>
          </FormDialogHeader>

          <FormDialogBody className="gap-2.5 px-5 py-3.5">
            {/* Search Input Bar */}
            <div className="relative flex items-center">
              <SearchIcon className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search supplier by name or PAN..."
                className="h-8.5 pr-9 pl-9 text-xs"
                autoFocus
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2.5 rounded p-0.5 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <XIcon className="size-3.5" />
                </button>
              ) : null}
            </div>

            {/* Results Container with vertical scroll */}
            <div className="thin-scrollbar flex max-h-[300px] flex-col gap-1.5 overflow-y-auto pr-0.5">
              {isQueryEmpty ? (
                <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
                  <div className="mb-2 flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <SearchIcon className="size-4" />
                  </div>
                  <p className="text-xs font-medium text-foreground">
                    Search Suppliers
                  </p>
                  <p className="mt-0.5 max-w-xs text-xs text-muted-foreground">
                    Enter a supplier name or PAN to find and add them to this branch.
                  </p>
                </div>
              ) : filteredSuppliers.length === 0 ? (
                <div className="py-7 text-center text-xs text-muted-foreground">
                  No suppliers found matching &ldquo;{query}&rdquo;.
                </div>
              ) : (
                filteredSuppliers.map((supplier) => {
                  const isAlreadyAdded = supplier.addedBranchIds?.includes(
                    currentBranchId
                  )

                  return (
                    <div
                      key={supplier.id}
                      className="flex items-center justify-between gap-2.5 rounded-lg border border-border/70 bg-card px-3 py-1.5 transition-colors hover:bg-muted/30"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-2.5">
                        <Avatar className="size-9 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                            {getInitials(supplier.name)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex min-w-0 flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate text-xs font-medium text-foreground">
                              {supplier.name}
                            </span>
                            {supplier.type ? (
                              <span className="text-[10px] text-muted-foreground capitalize">
                                • {supplier.type}
                              </span>
                            ) : null}
                          </div>
                          {supplier.address ? (
                            <span className="truncate text-xs text-muted-foreground">
                              {supplier.address}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isAlreadyAdded ? (
                          <Button
                            size="32"
                            variant="outline"
                            color="neutral"
                            className="h-7 cursor-default gap-1 border-emerald-500/30 bg-emerald-500/10 px-2.5 text-xs font-medium text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-600 dark:border-emerald-400/30 dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/20 dark:hover:text-emerald-400"
                          >
                            <CheckIcon className="size-3.5" />
                            Added
                          </Button>
                        ) : (
                          <Button
                            size="32"
                            className="h-7 gap-1 px-2.5 text-xs font-medium"
                            onClick={() => setConfirmSupplier(supplier)}
                          >
                            <PlusIcon className="size-3.5" />
                            Add
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </FormDialogBody>
        </FormDialogContent>
      </Dialog>

      {/* Add Confirmation Dialog */}
      <Dialog
        open={Boolean(confirmSupplier)}
        onOpenChange={(isOpen) => {
          if (!isOpen) setConfirmSupplier(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Supplier</DialogTitle>
            <DialogDescription>
              Are you sure you want to add{" "}
              <span className="font-semibold text-foreground">
                {confirmSupplier?.name}
              </span>{" "}
              to this branch?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              color="neutral"
              onClick={() => setConfirmSupplier(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (confirmSupplier) {
                  handleConfirmAdd(confirmSupplier)
                }
              }}
            >
              Add Supplier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
