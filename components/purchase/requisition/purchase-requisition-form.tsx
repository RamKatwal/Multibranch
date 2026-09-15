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
import { Textarea } from "@/components/ui/textarea"
import { todayIsoDate } from "@/lib/branches/storage"
import { getPurchasableProducts } from "@/lib/mock/purchase-orders"
import { createPurchaseRequisitionItemId } from "@/lib/purchase-requisitions/storage"
import type {
  PurchaseRequisition,
  PurchaseRequisitionItem,
} from "@/types/purchase-requisition"

const purchaseRequisitionFormSchema = z.object({
  entryDate: z.string().min(1, { message: "Entry date is required" }),
  dueDate: z.string().optional(),
  remarks: z
    .string()
    .trim()
    .max(100, { message: "Remarks are too long" })
    .optional(),
})

type PurchaseRequisitionFormInput = z.infer<typeof purchaseRequisitionFormSchema>

type ItemRow = {
  key: string
  productId: string
  name: string
  unit: string
  quantityInStock: number
  requestedQuantity: string
}

type PurchaseRequisitionFormProps = {
  initialRequisition?: PurchaseRequisition
  nextId: string
  submitLabel?: string
  onSubmitRequisition: (requisition: PurchaseRequisition) => void
  onCancel: () => void
}

let nextRowKey = 0

function makeRow(): ItemRow {
  nextRowKey += 1
  return {
    key: `row-${nextRowKey}`,
    productId: "",
    name: "",
    unit: "",
    quantityInStock: 0,
    requestedQuantity: "",
  }
}

export function PurchaseRequisitionForm({
  initialRequisition,
  nextId,
  submitLabel = "Create Purchase Requisition",
  onSubmitRequisition,
  onCancel,
}: PurchaseRequisitionFormProps) {
  const products = React.useMemo(() => getPurchasableProducts(), [])

  const [rows, setRows] = React.useState<ItemRow[]>(() => {
    if (!initialRequisition?.items.length) return [makeRow()]
    return initialRequisition.items.map((item) => ({
      key: `row-${item.id}`,
      productId: item.productId,
      name: item.name,
      unit: item.unit,
      quantityInStock: item.quantityInStock,
      requestedQuantity: String(item.requestedQuantity),
    }))
  })

  const form = useForm<PurchaseRequisitionFormInput>({
    resolver: zodResolver(purchaseRequisitionFormSchema),
    defaultValues: {
      entryDate: initialRequisition?.entryDate ?? todayIsoDate(),
      dueDate: initialRequisition?.dueDate ?? "",
      remarks: initialRequisition?.remarks ?? "",
    },
  })

  const selectedProductIds = rows.map((row) => row.productId)

  function updateRow(key: string, patch: Partial<ItemRow>) {
    setRows((current) =>
      current.map((row) => (row.key === key ? { ...row, ...patch } : row))
    )
  }

  function selectProduct(
    key: string,
    product: ReturnType<typeof getPurchasableProducts>[number]
  ) {
    updateRow(key, {
      productId: product.id,
      name: product.name,
      unit: product.unit,
      quantityInStock: product.availableQuantity,
      requestedQuantity: "1",
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

  const totalRequestedQuantity = rows.reduce(
    (sum, row) => sum + (Number(row.requestedQuantity) || 0),
    0
  )

  function handleSubmit(values: PurchaseRequisitionFormInput) {
    const validRows = rows.filter(
      (row) => row.productId && row.name.trim() && Number(row.requestedQuantity) > 0
    )

    if (validRows.length === 0) {
      toast.error("Add at least one item with a requested quantity.")
      return
    }

    const items: PurchaseRequisitionItem[] = validRows.map((row, index) => ({
      id: initialRequisition?.items[index]?.id ?? createPurchaseRequisitionItemId(index),
      productId: row.productId,
      name: row.name.trim(),
      unit: row.unit,
      quantityInStock: row.quantityInStock,
      requestedQuantity: Number(row.requestedQuantity) || 0,
    }))

    onSubmitRequisition({
      id: initialRequisition?.id ?? nextId,
      entryDate: values.entryDate,
      dueDate: values.dueDate ?? "",
      status: initialRequisition?.status ?? "draft",
      remarks: values.remarks?.trim() ?? "",
      items,
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-4"
      >
        <Card size="sm" className="ring-foreground/10">
          <CardContent className="flex flex-col gap-5 pt-(--card-spacing)">
            <div className="grid gap-3 sm:grid-cols-2 sm:items-end">
              <FormField
                control={form.control}
                name="entryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Entry Date <span className="text-destructive">*</span>
                    </FormLabel>
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
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
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
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Requisition Items</p>
                  <p className="text-xs text-muted-foreground">
                    Quantity in stock prefills from the item and requested
                    quantity can be edited per line.
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addRow}>
                  <PlusIcon className="size-4" />
                  Add
                </Button>
              </div>

              <div className="-mx-1 overflow-x-auto px-1 pb-1">
                <div className="flex min-w-[36rem] flex-col gap-2">
                  <div className="grid grid-cols-[minmax(0,1.6fr)_8rem_9rem_2.25rem] gap-2 px-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                    <span>Item</span>
                    <span className="text-right">Qty in Stock</span>
                    <span className="text-right">Requested Qty</span>
                    <span />
                  </div>

                  {rows.map((row, index) => (
                    <div
                      key={row.key}
                      className="grid grid-cols-[minmax(0,1.6fr)_8rem_9rem_2.25rem] items-center gap-2"
                    >
                      <ProductItemSelect
                        value={row.productId}
                        products={products}
                        excludeIds={selectedProductIds}
                        onChange={(product) => selectProduct(row.key, product)}
                        placeholder="Select item…"
                        emptyMessage="No item found."
                      />
                      <div className="flex h-9 items-center justify-end text-sm text-muted-foreground tabular-nums">
                        {row.productId ? `${row.quantityInStock} ${row.unit}` : "--"}
                      </div>
                      <div className="flex flex-col gap-1">
                        <Input
                          type="number"
                          min={0}
                          step="any"
                          inputMode="decimal"
                          placeholder="0"
                          value={row.requestedQuantity}
                          onChange={(event) =>
                            updateRow(row.key, {
                              requestedQuantity: event.target.value,
                            })
                          }
                          className="h-9 text-right tabular-nums"
                          aria-label={`Requested quantity for line ${index + 1}`}
                        />
                        {row.unit ? (
                          <span className="text-right text-[11px] text-muted-foreground">
                            {row.unit}
                          </span>
                        ) : null}
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
                  ))}
                </div>
              </div>

              <div className="flex justify-end text-sm">
                <span className="text-muted-foreground">
                  Total requested qty{" "}
                  <span className="font-medium text-foreground tabular-nums">
                    {totalRequestedQuantity}
                  </span>
                </span>
              </div>
            </div>

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please enter references if any or any remarks"
                      rows={4}
                      className="min-h-24"
                      maxLength={100}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{submitLabel}</Button>
        </div>
      </form>
    </Form>
  )
}
