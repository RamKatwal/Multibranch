"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, ChevronDownIcon, PlusIcon, Trash2Icon } from "lucide-react"
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
import { NativeSelect } from "@/components/ui/native-select"
import { Textarea } from "@/components/ui/textarea"
import { todayIsoDate } from "@/lib/branches/storage"
import { formatCurrency } from "@/lib/format"
import { mockCustomers } from "@/lib/mock/customers"
import {
  getSellableProducts,
  type SellableProduct,
} from "@/lib/mock/sales-orders"
import {
  calculateItemAmount,
  calculateSalesOrderTotals,
} from "@/lib/sales-orders/calculations"
import { createSalesOrderItemId } from "@/lib/sales-orders/storage"
import {
  SALES_ORDER_VAT_OPTIONS,
  salesOrderVatLabels,
  type SalesOrder,
  type SalesOrderItem,
  type SalesOrderVatOption,
} from "@/types/sales-order"

const salesOrderFormSchema = z.object({
  customerId: z.string().min(1, { message: "Customer is required" }),
  entryDate: z.string().min(1, { message: "Entry date is required" }),
  deliveryDate: z.string().optional(),
  remarks: z
    .string()
    .trim()
    .max(100, { message: "Remarks are too long" })
    .optional(),
})

type SalesOrderFormInput = z.infer<typeof salesOrderFormSchema>

type ItemRow = {
  key: string
  productId: string
  name: string
  unit: string
  quantity: string
  rate: string
  discountPercent: string
  vat: SalesOrderVatOption
}

type SalesOrderFormProps = {
  initialOrder?: SalesOrder
  nextId: string
  submitLabel?: string
  onSubmitOrder: (order: SalesOrder) => void
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
    quantity: "",
    rate: "",
    discountPercent: "",
    vat: "no-vat",
  }
}

function rowAmount(row: ItemRow) {
  return calculateItemAmount({
    quantity: Number(row.quantity) || 0,
    rate: Number(row.rate) || 0,
    discountPercent: Number(row.discountPercent) || 0,
  })
}

export function SalesOrderForm({
  initialOrder,
  nextId,
  submitLabel = "Create Sales Order",
  onSubmitOrder,
  onCancel,
}: SalesOrderFormProps) {
  const products = React.useMemo(() => getSellableProducts(), [])
  const customers = React.useMemo(() => {
    const active = mockCustomers.filter((customer) => customer.status === "active")
    if (
      initialOrder?.customerId &&
      !active.some((customer) => customer.id === initialOrder.customerId)
    ) {
      const extra = mockCustomers.find(
        (customer) => customer.id === initialOrder.customerId
      )
      if (extra) return [extra, ...active]
    }
    return active
  }, [initialOrder])

  const [rows, setRows] = React.useState<ItemRow[]>(() => {
    if (!initialOrder?.items.length) return [makeRow()]
    return initialOrder.items.map((item) => ({
      key: `row-${item.id}`,
      productId: item.productId,
      name: item.name,
      unit: item.unit,
      quantity: String(item.quantity),
      rate: String(item.rate),
      discountPercent: String(item.discountPercent),
      vat: item.vat,
    }))
  })

  const form = useForm<SalesOrderFormInput>({
    resolver: zodResolver(salesOrderFormSchema),
    defaultValues: {
      customerId: initialOrder?.customerId ?? "",
      entryDate: initialOrder?.entryDate ?? todayIsoDate(),
      deliveryDate: initialOrder?.deliveryDate ?? "",
      remarks: initialOrder?.remarks ?? "",
    },
  })

  const selectedProductIds = rows.map((row) => row.productId)

  function updateRow(key: string, patch: Partial<ItemRow>) {
    setRows((current) =>
      current.map((row) => (row.key === key ? { ...row, ...patch } : row))
    )
  }

  function selectProduct(key: string, product: SellableProduct) {
    updateRow(key, {
      productId: product.id,
      name: product.name,
      unit: product.unit,
      rate: String(product.rate),
      discountPercent: "0",
      vat: product.vat,
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

  const [additionalDiscount, setAdditionalDiscount] = React.useState(
    () => initialOrder?.additionalDiscount ?? 0
  )

  const items: SalesOrderItem[] = rows.map((row, index) => {
    const quantity = Number(row.quantity) || 0
    const rate = Number(row.rate) || 0
    const discountPercent = Number(row.discountPercent) || 0
    return {
      id: initialOrder?.items[index]?.id ?? createSalesOrderItemId(index),
      productId: row.productId,
      name: row.name,
      unit: row.unit,
      quantity,
      rate,
      discountPercent,
      vat: row.vat,
      amount: calculateItemAmount({ quantity, rate, discountPercent }),
    }
  })

  const totals = calculateSalesOrderTotals(items, additionalDiscount)

  function handleSubmit(values: SalesOrderFormInput) {
    const validRows = rows.filter(
      (row) => row.productId && row.name.trim() && Number(row.quantity) > 0
    )

    if (validRows.length === 0) {
      toast.error("Add at least one item with a quantity.")
      return
    }

    const customer = customers.find((entry) => entry.id === values.customerId)
    if (!customer) {
      toast.error("Select a customer.")
      return
    }

    const finalItems: SalesOrderItem[] = validRows.map((row, index) => {
      const quantity = Number(row.quantity) || 0
      const rate = Number(row.rate) || 0
      const discountPercent = Number(row.discountPercent) || 0
      return {
        id: initialOrder?.items[index]?.id ?? createSalesOrderItemId(index),
        productId: row.productId,
        name: row.name.trim(),
        unit: row.unit,
        quantity,
        rate,
        discountPercent,
        vat: row.vat,
        amount: calculateItemAmount({ quantity, rate, discountPercent }),
      }
    })

    const finalTotals = calculateSalesOrderTotals(finalItems, additionalDiscount)

    onSubmitOrder({
      id: initialOrder?.id ?? nextId,
      customerId: customer.id,
      customer: customer.name,
      entryDate: values.entryDate,
      deliveryDate: values.deliveryDate ?? "",
      status: initialOrder?.status ?? "draft",
      remarks: values.remarks?.trim() ?? "",
      entryBy: initialOrder?.entryBy ?? "admin",
      items: finalItems,
      additionalDiscount,
      ...finalTotals,
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
            <div className="grid gap-3 sm:grid-cols-3 sm:items-end">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Customer <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <NativeSelect
                          aria-label="Customer"
                          className="pr-8"
                          {...field}
                        >
                          <option value="">Select customer…</option>
                          {customers.map((customer) => (
                            <option key={customer.id} value={customer.id}>
                              {customer.name}
                            </option>
                          ))}
                        </NativeSelect>
                        <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground opacity-50" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="entryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Entry date <span className="text-destructive">*</span>
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
                name="deliveryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery date</FormLabel>
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
                  <p className="text-sm font-medium">Items</p>
                  <p className="text-xs text-muted-foreground">
                    Rate and VAT prefill from the product and can be edited per
                    line.
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addRow}>
                  <PlusIcon className="size-4" />
                  Add
                </Button>
              </div>

              <div className="-mx-1 overflow-x-auto px-1 pb-1">
                <div className="flex min-w-[52rem] flex-col gap-2">
                  <div className="grid grid-cols-[minmax(0,1.4fr)_5.5rem_5.5rem_5.5rem_7rem_6.5rem_2.25rem] gap-2 px-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                    <span>Item</span>
                    <span className="text-right">Qty</span>
                    <span className="text-right">Rate</span>
                    <span className="text-right">Discount</span>
                    <span>VAT</span>
                    <span className="text-right">Amount</span>
                    <span />
                  </div>

                  {rows.map((row, index) => (
                    <div
                      key={row.key}
                      className="grid grid-cols-[minmax(0,1.4fr)_5.5rem_5.5rem_5.5rem_7rem_6.5rem_2.25rem] items-center gap-2"
                    >
                      <ProductItemSelect
                        value={row.productId}
                        products={products}
                        excludeIds={selectedProductIds}
                        onChange={(product) => selectProduct(row.key, product)}
                        placeholder="Select item…"
                        emptyMessage="No item found."
                      />
                      <div className="flex flex-col gap-1">
                        <Input
                          type="number"
                          min={0}
                          step="any"
                          inputMode="decimal"
                          placeholder="0"
                          value={row.quantity}
                          onChange={(event) =>
                            updateRow(row.key, { quantity: event.target.value })
                          }
                          className="h-9 text-right tabular-nums"
                          aria-label={`Quantity for line ${index + 1}`}
                        />
                        {row.unit ? (
                          <span className="text-right text-[11px] text-muted-foreground">
                            {row.unit}
                          </span>
                        ) : null}
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
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step="any"
                        inputMode="decimal"
                        placeholder="0%"
                        value={row.discountPercent}
                        onChange={(event) =>
                          updateRow(row.key, {
                            discountPercent: event.target.value,
                          })
                        }
                        className="h-9 text-right tabular-nums"
                        aria-label={`Discount for line ${index + 1}`}
                      />
                      <div className="relative">
                        <NativeSelect
                          aria-label={`VAT for line ${index + 1}`}
                          className="h-9 pr-7 text-sm"
                          value={row.vat}
                          onChange={(event) =>
                            updateRow(row.key, {
                              vat: event.target.value as SalesOrderVatOption,
                            })
                          }
                        >
                          {SALES_ORDER_VAT_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {salesOrderVatLabels[option]}
                            </option>
                          ))}
                        </NativeSelect>
                        <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2 text-muted-foreground opacity-50" />
                      </div>
                      <div className="flex h-9 items-center justify-end font-medium tabular-nums">
                        {formatCurrency(rowAmount(row))}
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
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remarks</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Visible on the printed order"
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

              <div className="flex flex-col gap-2 rounded-md border p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Sub Total</span>
                  <span className="font-medium tabular-nums">
                    {formatCurrency(totals.subTotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">
                    Additional Discount
                  </span>
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    inputMode="decimal"
                    value={additionalDiscount}
                    onChange={(event) =>
                      setAdditionalDiscount(Number(event.target.value) || 0)
                    }
                    className="h-8 w-28 text-right tabular-nums"
                    aria-label="Additional discount"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Taxable Total</span>
                  <span className="font-medium tabular-nums">
                    {formatCurrency(totals.taxableTotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Non Taxable Total
                  </span>
                  <span className="font-medium tabular-nums">
                    {formatCurrency(totals.nonTaxableTotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">VAT</span>
                  <span className="font-medium tabular-nums">
                    {formatCurrency(totals.vatAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t pt-2 text-base">
                  <span className="font-medium">Grand Total</span>
                  <span className="font-semibold tabular-nums">
                    {formatCurrency(totals.grandTotal)}
                  </span>
                </div>
              </div>
            </div>
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
