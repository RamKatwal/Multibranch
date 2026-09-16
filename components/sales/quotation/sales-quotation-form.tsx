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
import { createSalesQuotationItemId } from "@/lib/sales-quotations/storage"
import type {
  SalesQuotation,
  SalesQuotationItem,
} from "@/types/sales-quotation"

const salesQuotationFormSchema = z.object({
  customerId: z.string().min(1, { message: "Customer is required" }),
  entryDate: z.string().min(1, { message: "Entry date is required" }),
  dueDate: z.string().optional(),
  remarks: z
    .string()
    .trim()
    .max(100, { message: "Remarks are too long" })
    .optional(),
})

type SalesQuotationFormInput = z.infer<typeof salesQuotationFormSchema>

type ItemRow = {
  key: string
  productId: string
  name: string
  unit: string
  quantity: string
  rate: string
}

type SalesQuotationFormProps = {
  initialQuotation?: SalesQuotation
  nextId: string
  submitLabel?: string
  onSubmitQuotation: (quotation: SalesQuotation) => void
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
  }
}

function rowAmount(row: ItemRow) {
  return Math.max((Number(row.quantity) || 0) * (Number(row.rate) || 0), 0)
}

export function SalesQuotationForm({
  initialQuotation,
  nextId,
  submitLabel = "Create Sales Quotation",
  onSubmitQuotation,
  onCancel,
}: SalesQuotationFormProps) {
  const products = React.useMemo(() => getSellableProducts(), [])
  const customers = React.useMemo(() => {
    const active = mockCustomers.filter((customer) => customer.status === "active")
    if (
      initialQuotation?.customerId &&
      !active.some((customer) => customer.id === initialQuotation.customerId)
    ) {
      const extra = mockCustomers.find(
        (customer) => customer.id === initialQuotation.customerId
      )
      if (extra) return [extra, ...active]
    }
    return active
  }, [initialQuotation])

  const [rows, setRows] = React.useState<ItemRow[]>(() => {
    if (!initialQuotation?.items.length) return [makeRow()]
    return initialQuotation.items.map((item) => ({
      key: `row-${item.id}`,
      productId: item.productId,
      name: item.name,
      unit: item.unit,
      quantity: String(item.quantity),
      rate: String(item.rate),
    }))
  })

  const form = useForm<SalesQuotationFormInput>({
    resolver: zodResolver(salesQuotationFormSchema),
    defaultValues: {
      customerId: initialQuotation?.customerId ?? "",
      entryDate: initialQuotation?.entryDate ?? todayIsoDate(),
      dueDate: initialQuotation?.dueDate ?? "",
      remarks: initialQuotation?.remarks ?? "",
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

  const totalAmount = rows.reduce((sum, row) => sum + rowAmount(row), 0)

  function handleSubmit(values: SalesQuotationFormInput) {
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

    const finalItems: SalesQuotationItem[] = validRows.map((row, index) => {
      const quantity = Number(row.quantity) || 0
      const rate = Number(row.rate) || 0
      return {
        id:
          initialQuotation?.items[index]?.id ??
          createSalesQuotationItemId(index),
        productId: row.productId,
        name: row.name.trim(),
        unit: row.unit,
        quantity,
        rate,
        amount: quantity * rate,
      }
    })

    onSubmitQuotation({
      id: initialQuotation?.id ?? nextId,
      customerId: customer.id,
      customer: customer.name,
      entryDate: values.entryDate,
      dueDate: values.dueDate ?? "",
      status: initialQuotation?.status ?? "draft",
      remarks: values.remarks?.trim() ?? "",
      entryBy: initialQuotation?.entryBy ?? "admin",
      items: finalItems,
      totalAmount: finalItems.reduce((sum, item) => sum + item.amount, 0),
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
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due date</FormLabel>
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
                    Rate prefills from the product and can be edited per line.
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addRow}>
                  <PlusIcon className="size-4" />
                  Add
                </Button>
              </div>

              <div className="-mx-1 overflow-x-auto px-1 pb-1">
                <div className="flex min-w-[36rem] flex-col gap-2">
                  <div className="grid grid-cols-[minmax(0,1.4fr)_5.5rem_5.5rem_6.5rem_2.25rem] gap-2 px-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                    <span>Item</span>
                    <span className="text-right">Qty</span>
                    <span className="text-right">Rate</span>
                    <span className="text-right">Amount</span>
                    <span />
                  </div>

                  {rows.map((row, index) => (
                    <div
                      key={row.key}
                      className="grid grid-cols-[minmax(0,1.4fr)_5.5rem_5.5rem_6.5rem_2.25rem] items-center gap-2"
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
                        placeholder="Validity notes or customer terms"
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

              <div className="flex flex-col justify-end gap-2 rounded-md border p-3 text-sm">
                <div className="flex items-center justify-between border-t-0 pt-0 text-base">
                  <span className="font-medium">Total Amount</span>
                  <span className="font-semibold tabular-nums">
                    {formatCurrency(totalAmount)}
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
