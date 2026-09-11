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
import {
  getPurchasableProducts,
  type PurchasableProduct,
} from "@/lib/mock/purchase-orders"
import { mockSuppliers } from "@/lib/mock/suppliers"
import { createPurchaseOrderItemId } from "@/lib/purchase-orders/storage"
import {
  PURCHASE_ORDER_STATUSES,
  purchaseOrderStatusLabels,
  type PurchaseOrder,
  type PurchaseOrderItem,
} from "@/types/purchase-order"

const purchaseOrderFormSchema = z.object({
  supplierId: z.string().min(1, { message: "Supplier is required" }),
  orderDate: z.string().min(1, { message: "Order date is required" }),
  status: z.enum(PURCHASE_ORDER_STATUSES),
  remarks: z
    .string()
    .trim()
    .max(250, { message: "Notes are too long" })
    .optional(),
})

type PurchaseOrderFormInput = z.infer<typeof purchaseOrderFormSchema>

type ItemRow = {
  key: string
  productId: string
  name: string
  quantity: string
  unitCost: string
  unit: string
}

type PurchaseOrderFormProps = {
  initialOrder?: PurchaseOrder
  nextId: string
  submitLabel?: string
  onSubmitOrder: (order: PurchaseOrder) => void
  onCancel: () => void
}

let nextRowKey = 0

function makeRow(): ItemRow {
  nextRowKey += 1
  return {
    key: `row-${nextRowKey}`,
    productId: "",
    name: "",
    quantity: "",
    unitCost: "",
    unit: "Unit",
  }
}

function rowTotal(row: ItemRow) {
  const quantity = Number(row.quantity) || 0
  const unitCost = Number(row.unitCost) || 0
  return quantity * unitCost
}

export function PurchaseOrderForm({
  initialOrder,
  nextId,
  submitLabel = "Create Purchase Order",
  onSubmitOrder,
  onCancel,
}: PurchaseOrderFormProps) {
  const products = React.useMemo(() => getPurchasableProducts(), [])
  const suppliers = React.useMemo(() => {
    const active = mockSuppliers.filter((supplier) => supplier.status === "active")
    if (
      initialOrder?.supplierId &&
      !active.some((supplier) => supplier.id === initialOrder.supplierId)
    ) {
      const extra = mockSuppliers.find(
        (supplier) => supplier.id === initialOrder.supplierId
      )
      if (extra) return [extra, ...active]
    }
    return active
  }, [initialOrder])

  const [rows, setRows] = React.useState<ItemRow[]>(() => {
    if (!initialOrder?.items.length) return [makeRow()]
    return initialOrder.items.map((item) => {
      const product = products.find((entry) => entry.id === item.productId)
      return {
        key: `row-${item.id}`,
        productId: item.productId,
        name: item.name,
        quantity: String(item.quantity),
        unitCost: String(item.unitCost),
        unit: product?.unit ?? "Unit",
      }
    })
  })

  const form = useForm<PurchaseOrderFormInput>({
    resolver: zodResolver(purchaseOrderFormSchema),
    defaultValues: {
      supplierId: initialOrder?.supplierId ?? "",
      orderDate: initialOrder?.orderDate ?? todayIsoDate(),
      status: initialOrder?.status ?? "draft",
      remarks: initialOrder?.remarks ?? "",
    },
  })

  const selectedProductIds = rows.map((row) => row.productId)

  function updateRow(key: string, patch: Partial<ItemRow>) {
    setRows((current) =>
      current.map((row) => (row.key === key ? { ...row, ...patch } : row))
    )
  }

  function selectProduct(key: string, product: PurchasableProduct) {
    updateRow(key, {
      productId: product.id,
      name: product.name,
      unitCost: String(product.rate),
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

  const grandTotal = rows.reduce((sum, row) => sum + rowTotal(row), 0)

  function handleSubmit(values: PurchaseOrderFormInput) {
    const validRows = rows.filter(
      (row) =>
        row.productId &&
        row.name.trim() &&
        Number(row.quantity) > 0 &&
        Number(row.unitCost) >= 0
    )

    if (validRows.length === 0) {
      toast.error("Add at least one item with a quantity.")
      return
    }

    const supplier = suppliers.find((entry) => entry.id === values.supplierId)
    if (!supplier) {
      toast.error("Select a supplier.")
      return
    }

    const items: PurchaseOrderItem[] = validRows.map((row, index) => {
      const quantity = Number(row.quantity) || 0
      const unitCost = Number(row.unitCost) || 0
      return {
        id: initialOrder?.items[index]?.id ?? createPurchaseOrderItemId(index),
        productId: row.productId,
        name: row.name.trim(),
        quantity,
        unitCost,
        totalPrice: quantity * unitCost,
      }
    })

    onSubmitOrder({
      id: initialOrder?.id ?? nextId,
      supplierId: supplier.id,
      supplier: supplier.name,
      orderDate: values.orderDate,
      status: values.status,
      remarks: values.remarks?.trim() ?? "",
      items,
      totalAmount: items.reduce((sum, item) => sum + item.totalPrice, 0),
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
                name="supplierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Supplier <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <NativeSelect
                          aria-label="Supplier"
                          className="pr-8"
                          {...field}
                        >
                          <option value="">Select supplier…</option>
                          {suppliers.map((supplier) => (
                            <option key={supplier.id} value={supplier.id}>
                              {supplier.name}
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
                name="orderDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Order date <span className="text-destructive">*</span>
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <NativeSelect
                          aria-label="Status"
                          className="pr-8"
                          {...field}
                        >
                          {PURCHASE_ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {purchaseOrderStatusLabels[status]}
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
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Items</p>
                  <p className="text-xs text-muted-foreground">
                    Product, quantity, and unit cost. Totals update as you type.
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addRow}>
                  <PlusIcon className="size-4" />
                  Add
                </Button>
              </div>

              <div className="hidden grid-cols-[minmax(0,1fr)_7rem_7rem_7rem_2.25rem] gap-2 px-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase md:grid">
                <span>Product</span>
                <span className="text-right">Qty</span>
                <span className="text-right">Unit Cost</span>
                <span className="text-right">Total</span>
                <span />
              </div>

              {rows.map((row, index) => (
                <div
                  key={row.key}
                  className="grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1fr)_7rem_7rem_7rem_2.25rem] md:items-center"
                >
                  <ProductItemSelect
                    value={row.productId}
                    products={products}
                    excludeIds={selectedProductIds}
                    onChange={(product) => selectProduct(row.key, product)}
                    placeholder="Select product…"
                    emptyMessage="No product found."
                  />
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
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    inputMode="decimal"
                    placeholder="0"
                    value={row.unitCost}
                    onChange={(event) =>
                      updateRow(row.key, { unitCost: event.target.value })
                    }
                    className="h-9 text-right tabular-nums"
                    aria-label={`Unit cost for line ${index + 1}`}
                  />
                  <div className="flex h-9 items-center justify-end font-medium tabular-nums">
                    {formatCurrency(rowTotal(row))}
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

              <div className="flex justify-end text-sm">
                <span className="text-muted-foreground">
                  Total{" "}
                  <span className="font-medium text-foreground tabular-nums">
                    {formatCurrency(grandTotal)}
                  </span>
                </span>
              </div>
            </div>

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional"
                      rows={2}
                      className="min-h-16"
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
