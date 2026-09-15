"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { ProductItemSelect } from "@/components/stock-transfer/product-item-select"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Tabs } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { todayIsoDate } from "@/lib/branches/storage"
import {
  getTransferableProducts,
  type TransferableProduct,
} from "@/lib/mock/stock-transfers"
import {
  createStockAdjustmentId,
  createStockAdjustmentItemId,
  readStockAdjustments,
} from "@/lib/stock-adjustment/storage"
import type {
  StockAdjustment,
  StockAdjustmentItem,
  StockAdjustmentType,
} from "@/types/stock-adjustment"

const stockAdjustmentFormSchema = z.object({
  type: z.enum(["addition", "deduction"]),
  date: z.string().min(1, { message: "Entry date is required" }),
  billReference: z
    .string()
    .trim()
    .max(60, { message: "Bill reference is too long" })
    .optional(),
  remarks: z
    .string()
    .trim()
    .max(100, { message: "Remarks are too long" })
    .optional(),
})

type StockAdjustmentFormInput = z.infer<typeof stockAdjustmentFormSchema>

type ItemRow = {
  key: string
  productId: string
  name: string
  batch: string
  quantity: string
  unit: string
  rate: string
}

type StockAdjustmentFormProps = {
  submitLabel?: string
  onSubmitAdjustment: (adjustment: StockAdjustment) => void
  onCancel: () => void
}

let nextRowKey = 0

function makeRow(): ItemRow {
  nextRowKey += 1
  return {
    key: `row-${nextRowKey}`,
    productId: "",
    name: "",
    batch: "",
    quantity: "",
    unit: "",
    rate: "",
  }
}

function formatMoney(value: number) {
  return value.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })
}

export function StockAdjustmentForm({
  submitLabel = "Save",
  onSubmitAdjustment,
  onCancel,
}: StockAdjustmentFormProps) {
  const products = React.useMemo(() => getTransferableProducts(), [])
  const [rows, setRows] = React.useState<ItemRow[]>(() => [makeRow()])

  const form = useForm<StockAdjustmentFormInput>({
    resolver: zodResolver(stockAdjustmentFormSchema),
    defaultValues: {
      type: "addition",
      date: todayIsoDate(),
      billReference: "",
      remarks: "",
    },
  })

  const remarks = form.watch("remarks") ?? ""
  const adjustmentType = form.watch("type")
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
      unit: product.unit,
      rate: String(product.rate || ""),
    })
  }

  function addRow() {
    setRows((current) => [...current, makeRow()])
  }

  function removeRow(key: string) {
    setRows((current) =>
      current.length <= 1 ? current : current.filter((row) => row.key !== key)
    )
  }

  function handleSubmit(values: StockAdjustmentFormInput) {
    const parsedItems: StockAdjustmentItem[] = []

    for (const [index, row] of rows.entries()) {
      if (!row.productId) {
        toast.error(`Select an item for line ${index + 1}.`)
        return
      }

      const quantity = Number(row.quantity)
      const rate = Number(row.rate)

      if (!Number.isFinite(quantity) || quantity <= 0) {
        toast.error(`Enter a valid quantity for line ${index + 1}.`)
        return
      }

      if (!Number.isFinite(rate) || rate < 0) {
        toast.error(`Enter a valid rate for line ${index + 1}.`)
        return
      }

      parsedItems.push({
        id: createStockAdjustmentItemId(index),
        productId: row.productId,
        name: row.name,
        batch: row.batch.trim(),
        quantity,
        unit: row.unit || "Unit",
        rate,
        itemTotal: quantity * rate,
      })
    }

    const existing = readStockAdjustments()
    const adjustment: StockAdjustment = {
      id: createStockAdjustmentId(existing),
      date: values.date,
      type: values.type as StockAdjustmentType,
      billReference: values.billReference?.trim() ?? "",
      remarks: values.remarks?.trim() ?? "",
      entryBy: "ram",
      status: "approved",
      items: parsedItems,
    }

    onSubmitAdjustment(adjustment)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-4"
      >
        <Card size="sm">
          <CardContent className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Type <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Tabs
                      items={[
                        { value: "addition", label: "(+) Addition" },
                        { value: "deduction", label: "(-) Deduction" },
                      ]}
                      value={field.value}
                      onValueChange={(value) => {
                        if (typeof value !== "string") return
                        field.onChange(value)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entry Date</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="date"
                          className="pr-9 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-y-0 [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-9 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
                          {...field}
                        />
                        <CalendarIcon className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="billReference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bill Reference</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Bill Reference" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Adjustment Items</p>
                <p className="text-xs text-muted-foreground">
                  {adjustmentType === "addition"
                    ? "Items to add into stock."
                    : "Items to deduct from stock."}
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addRow}>
                <PlusIcon className="size-4" />
                Add
              </Button>
            </div>

            <div className="-mx-1 overflow-x-auto px-1 pb-1">
              <div className="flex min-w-[48rem] flex-col gap-2">
                <div className="grid grid-cols-[minmax(0,1.4fr)_7rem_8rem_7rem_7rem_2.25rem] gap-2 px-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  <span>Item</span>
                  <span>Batch</span>
                  <span className="text-right">Quantity</span>
                  <span className="text-right">Rate</span>
                  <span className="text-right">Item Total</span>
                  <span />
                </div>

                {rows.map((row, index) => {
                  const quantity = Number(row.quantity)
                  const rate = Number(row.rate)
                  const itemTotal =
                    Number.isFinite(quantity) && Number.isFinite(rate)
                      ? quantity * rate
                      : 0

                  return (
                    <div
                      key={row.key}
                      className="grid grid-cols-[minmax(0,1.4fr)_7rem_8rem_7rem_7rem_2.25rem] items-center gap-2"
                    >
                      <ProductItemSelect
                        value={row.productId}
                        products={products}
                        excludeIds={selectedProductIds}
                        onChange={(product) => selectProduct(row.key, product)}
                        placeholder="Select item…"
                      />
                      <Input
                        value={row.batch}
                        onChange={(event) =>
                          updateRow(row.key, { batch: event.target.value })
                        }
                        placeholder="Batch"
                        className="h-9"
                        aria-label={`Batch for line ${index + 1}`}
                      />
                      <div className="flex h-9 overflow-hidden rounded-md border">
                        <Input
                          type="number"
                          min={0}
                          step="any"
                          inputMode="decimal"
                          placeholder="0"
                          value={row.quantity}
                          onChange={(event) =>
                            updateRow(row.key, {
                              quantity: event.target.value,
                            })
                          }
                          className="h-9 rounded-none border-0 text-right tabular-nums shadow-none focus-visible:ring-0"
                          aria-label={`Quantity for line ${index + 1}`}
                        />
                        <div className="flex min-w-10 items-center justify-center border-l bg-muted/40 px-2 text-[11px] text-muted-foreground">
                          {row.unit || "—"}
                        </div>
                      </div>
                      <Input
                        type="number"
                        min={0}
                        step="any"
                        inputMode="decimal"
                        placeholder="0"
                        value={row.rate}
                        onChange={(event) =>
                          updateRow(row.key, { rate: event.target.value })
                        }
                        className="h-9 text-right tabular-nums"
                        aria-label={`Rate for line ${index + 1}`}
                      />
                      <div className="flex h-9 items-center justify-end text-sm tabular-nums text-muted-foreground">
                        {formatMoney(itemTotal)}
                      </div>
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
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardContent>
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional remarks"
                      className="min-h-24"
                      maxLength={100}
                      {...field}
                    />
                  </FormControl>
                  <div className="flex items-center justify-between gap-3">
                    <FormMessage />
                    <span className="ml-auto text-[11px] tabular-nums text-muted-foreground">
                      {remarks.length} / 100
                    </span>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{submitLabel}</Button>
        </div>
      </form>
    </Form>
  )
}
