"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowRightIcon,
  MapPinIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { ProductItemSelect } from "@/components/stock-transfer/product-item-select"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { NativeSelect } from "@/components/ui/native-select"
import { Textarea } from "@/components/ui/textarea"
import { todayIsoDate } from "@/lib/branches/storage"
import { formatCurrency } from "@/lib/format"
import {
  getTransferableProducts,
  stockTransferBranches,
  type TransferableProduct,
} from "@/lib/mock/stock-transfers"
import { cn } from "@/lib/utils"
import type {
  StockTransfer,
  StockTransferItem,
} from "@/types/stock-transfer"

const createStockTransferSchema = z
  .object({
    fromBranch: z.string().min(1, { message: "From branch is required" }),
    toBranch: z.string().min(1, { message: "To branch is required" }),
    date: z.string().min(1, { message: "Date is required" }),
    remarks: z
      .string()
      .trim()
      .max(250, { message: "Remarks are too long" })
      .optional(),
  })
  .refine((values) => values.fromBranch !== values.toBranch, {
    message: "From and To branch must be different",
    path: ["toBranch"],
  })

type CreateStockTransferFormInput = z.infer<typeof createStockTransferSchema>

type ItemRow = {
  key: string
  productId: string
  name: string
  quantity: string
  rate: string
  availableQuantity: number
  unit: string
}

type StockTransferFormProps = {
  initialTransfer?: StockTransfer
  submitLabel?: string
  onSubmitTransfer: (transfer: StockTransfer) => void
  onCancel: () => void
}

function makeRow(): ItemRow {
  return {
    key: `row-${Math.random().toString(36).slice(2, 9)}`,
    productId: "",
    name: "",
    quantity: "",
    rate: "",
    availableQuantity: 0,
    unit: "Unit",
  }
}

function rowFromItem(item: StockTransferItem): ItemRow {
  const product = item.productId
    ? getTransferableProducts().find((p) => p.id === item.productId)
    : getTransferableProducts().find((p) => p.name === item.name)

  return {
    key: `row-${item.id}`,
    productId: item.productId ?? product?.id ?? "",
    name: item.name,
    quantity: String(item.quantity),
    rate: String(item.rate),
    availableQuantity: product?.availableQuantity ?? 0,
    unit: product?.unit ?? "Unit",
  }
}

function rowTotal(row: ItemRow) {
  const quantity = Number(row.quantity) || 0
  const rate = Number(row.rate) || 0
  return quantity * rate
}

function SectionStep({
  step,
  title,
  description,
  children,
  className,
}: {
  step: number
  title: string
  description: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card size="sm" className={cn("ring-foreground/10", className)}>
      <CardHeader className="border-b pb-3">
        <div className="flex items-start gap-3">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-[11px] font-semibold text-primary-foreground tabular-nums">
            {step}
          </span>
          <div className="min-w-0">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-(--card-spacing)">{children}</CardContent>
    </Card>
  )
}

export function StockTransferForm({
  initialTransfer,
  submitLabel = "Create Stock Transfer",
  onSubmitTransfer,
  onCancel,
}: StockTransferFormProps) {
  const products = React.useMemo(() => getTransferableProducts(), [])
  const [rows, setRows] = React.useState<ItemRow[]>(() =>
    initialTransfer?.items.length
      ? initialTransfer.items.map(rowFromItem)
      : [makeRow()]
  )

  const form = useForm<CreateStockTransferFormInput>({
    resolver: zodResolver(createStockTransferSchema),
    defaultValues: {
      fromBranch: initialTransfer?.fromBranch ?? stockTransferBranches[0],
      toBranch: initialTransfer?.toBranch ?? stockTransferBranches[1],
      date: initialTransfer?.date ?? todayIsoDate(),
      remarks: initialTransfer?.remarks ?? "",
    },
  })

  const fromBranch = form.watch("fromBranch")
  const toBranch = form.watch("toBranch")
  const selectedProductIds = rows.map((row) => row.productId)

  function updateRow(key: string, patch: Partial<ItemRow>) {
    setRows((current) =>
      current.map((row) => (row.key === key ? { ...row, ...patch } : row))
    )
  }

  function selectProduct(key: string, product: TransferableProduct) {
    updateRow(key, {
      productId: product.id,
      name: product.name,
      rate: String(product.rate),
      availableQuantity: product.availableQuantity,
      unit: product.unit,
      quantity: "1",
    })
  }

  function addRow() {
    setRows((current) => [...current, makeRow()])
  }

  function removeRow(key: string) {
    setRows((current) =>
      current.length === 1 ? current : current.filter((row) => row.key !== key)
    )
  }

  const totalQuantity = rows.reduce(
    (sum, row) => sum + (Number(row.quantity) || 0),
    0
  )
  const grandTotal = rows.reduce((sum, row) => sum + rowTotal(row), 0)
  const filledItemCount = rows.filter((row) => row.productId).length

  function handleSubmit(values: CreateStockTransferFormInput) {
    const validRows = rows.filter(
      (row) => row.productId && row.name.trim() && Number(row.quantity) > 0
    )

    if (validRows.length === 0) {
      toast.error("Add at least one item with a quantity.")
      return
    }

    const overstock = validRows.find(
      (row) => Number(row.quantity) > row.availableQuantity
    )
    if (overstock) {
      toast.error(
        `"${overstock.name}" only has ${overstock.availableQuantity} ${overstock.unit} available.`
      )
      return
    }

    const items: StockTransferItem[] = validRows.map((row, index) => {
      const quantity = Number(row.quantity) || 0
      const rate = Number(row.rate) || 0
      return {
        id:
          initialTransfer?.items[index]?.id ??
          `ITM-${Date.now().toString().slice(-5)}-${index + 1}`,
        productId: row.productId,
        name: row.name.trim(),
        quantity,
        rate,
        totalPrice: quantity * rate,
      }
    })

    const transfer: StockTransfer = {
      id:
        initialTransfer?.id ??
        `TRF-${Date.now().toString().slice(-4)}-2082-83`,
      fromBranch: values.fromBranch,
      toBranch: values.toBranch,
      date: values.date,
      remarks: values.remarks?.trim() ?? "",
      items,
      totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
      totalAmount: items.reduce((sum, item) => sum + item.totalPrice, 0),
      entryBy: initialTransfer?.entryBy ?? "admin",
      status: initialTransfer?.status ?? "draft",
    }

    onSubmitTransfer(transfer)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-4 pb-24 lg:pb-8"
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="flex flex-col gap-4">
            <SectionStep
              step={1}
              title="Transfer route"
              description="Choose where stock leaves and where it arrives."
            >
              <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
                <FormField
                  control={form.control}
                  name="fromBranch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <MapPinIcon className="size-3.5 text-muted-foreground" />
                        From branch
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <NativeSelect {...field}>
                          {stockTransferBranches.map((branch) => (
                            <option key={branch} value={branch}>
                              {branch}
                            </option>
                          ))}
                        </NativeSelect>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="hidden h-9 items-center justify-center sm:flex">
                  <span className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <ArrowRightIcon className="size-4" />
                  </span>
                </div>

                <FormField
                  control={form.control}
                  name="toBranch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <MapPinIcon className="size-3.5 text-muted-foreground" />
                        To branch
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <NativeSelect {...field}>
                          {stockTransferBranches.map((branch) => (
                            <option key={branch} value={branch}>
                              {branch}
                            </option>
                          ))}
                        </NativeSelect>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Transfer date <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="rounded-lg border border-dashed bg-muted/30 px-3 py-2">
                  <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                    Route preview
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-1.5 text-sm font-medium">
                    <span>{fromBranch}</span>
                    <ArrowRightIcon className="size-3.5 text-muted-foreground" />
                    <span>{toBranch}</span>
                  </p>
                </div>
              </div>
            </SectionStep>

            <SectionStep
              step={2}
              title="Items to transfer"
              description="Pick products from the catalog. Rate fills from cost price."
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  {filledItemCount} of {rows.length} line
                  {rows.length === 1 ? "" : "s"} selected
                </p>
                <Button type="button" variant="outline" size="sm" onClick={addRow}>
                  <PlusIcon className="size-4" />
                  Add line
                </Button>
              </div>

              <div className="flex flex-col gap-2">
                <div className="hidden grid-cols-[minmax(0,1.6fr)_7rem_7rem_7rem_2.25rem] gap-2 px-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase md:grid">
                  <span>Item</span>
                  <span className="text-right">Qty</span>
                  <span className="text-right">Rate</span>
                  <span className="text-right">Total</span>
                  <span />
                </div>

                {rows.map((row, index) => (
                  <div
                    key={row.key}
                    className="group/row grid grid-cols-1 gap-2 rounded-lg border bg-card p-3 transition-[box-shadow,border-color] focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30 md:grid-cols-[minmax(0,1.6fr)_7rem_7rem_7rem_2.25rem] md:items-start md:p-2"
                  >
                    <div className="min-w-0 space-y-1">
                      <p className="text-[11px] font-medium text-muted-foreground md:hidden">
                        Item {index + 1}
                      </p>
                      <ProductItemSelect
                        value={row.productId}
                        products={products}
                        excludeIds={selectedProductIds}
                        onChange={(product) => selectProduct(row.key, product)}
                        placeholder="Select item…"
                      />
                      {row.productId ? (
                        <p className="px-0.5 text-[11px] text-muted-foreground tabular-nums">
                          {row.availableQuantity} {row.unit} available
                        </p>
                      ) : null}
                    </div>

                    <div>
                      <p className="mb-1 text-[11px] font-medium text-muted-foreground md:hidden">
                        Quantity
                      </p>
                      <Input
                        type="number"
                        min={0}
                        step="any"
                        inputMode="decimal"
                        placeholder="0"
                        value={row.quantity}
                        onChange={(e) =>
                          updateRow(row.key, { quantity: e.target.value })
                        }
                        className="h-9 text-right tabular-nums"
                        aria-label={`Quantity for line ${index + 1}`}
                      />
                    </div>

                    <div>
                      <p className="mb-1 text-[11px] font-medium text-muted-foreground md:hidden">
                        Rate
                      </p>
                      <Input
                        type="number"
                        min={0}
                        step="any"
                        inputMode="decimal"
                        placeholder="0"
                        value={row.rate}
                        onChange={(e) =>
                          updateRow(row.key, { rate: e.target.value })
                        }
                        className="h-9 text-right tabular-nums"
                        aria-label={`Rate for line ${index + 1}`}
                      />
                    </div>

                    <div className="flex h-9 items-center justify-between rounded-md bg-muted/40 px-3 md:justify-end md:bg-transparent md:px-0">
                      <span className="text-[11px] font-medium text-muted-foreground md:hidden">
                        Line total
                      </span>
                      <span className="font-medium tabular-nums">
                        {formatCurrency(rowTotal(row))}
                      </span>
                    </div>

                    <div className="flex justify-end md:pt-0.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => removeRow(row.key)}
                        disabled={rows.length === 1}
                        aria-label="Remove item"
                      >
                        <Trash2Icon className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </SectionStep>

            <SectionStep
              step={3}
              title="Notes"
              description="Optional context for receiving staff."
            >
              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remarks</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Reason or notes for this transfer"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </SectionStep>
          </div>

          <aside className="lg:sticky lg:top-4 lg:self-start">
            <Card
              size="sm"
              className="overflow-hidden ring-primary/15 bg-gradient-to-b from-primary/5 to-card"
            >
              <CardHeader className="border-b pb-3">
                <CardTitle>Transfer summary</CardTitle>
                <CardDescription>
                  Review totals before saving.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 pt-(--card-spacing)">
                <div className="rounded-lg border bg-background/80 p-3">
                  <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                    Moving
                  </p>
                  <p className="mt-1 text-sm font-medium leading-snug">
                    {fromBranch}
                  </p>
                  <div className="my-2 flex items-center gap-2 text-muted-foreground">
                    <span className="h-px flex-1 bg-border" />
                    <ArrowRightIcon className="size-3.5" />
                    <span className="h-px flex-1 bg-border" />
                  </div>
                  <p className="text-sm font-medium leading-snug">{toBranch}</p>
                </div>

                <dl className="flex flex-col gap-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Lines</dt>
                    <dd className="font-medium tabular-nums">{filledItemCount}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Total qty</dt>
                    <dd className="font-medium tabular-nums">{totalQuantity}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t pt-2">
                    <dt className="font-medium">Grand total</dt>
                    <dd className="text-base font-semibold tabular-nums">
                      {formatCurrency(grandTotal)}
                    </dd>
                  </div>
                </dl>

                <div className="hidden flex-col gap-2 border-t pt-3 lg:flex">
                  <Button type="submit" className="w-full">
                    {submitLabel}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={onCancel}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/80 lg:hidden">
          <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
            <div>
              <p className="text-[11px] text-muted-foreground">Grand total</p>
              <p className="font-semibold tabular-nums">
                {formatCurrency(grandTotal)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">{submitLabel}</Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  )
}
