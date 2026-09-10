"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRightIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { ProductItemSelect } from "@/components/stock-transfer-2/product-item-select"
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
import { Textarea } from "@/components/ui/textarea"
import { todayIsoDate } from "@/lib/branches/storage"
import { formatCurrency } from "@/lib/format"
import { getBranchProductStock } from "@/lib/inventory/branch-stock"
import {
  getTransferableProducts,
  type TransferableProduct,
} from "@/lib/mock/stock-transfers-2"
import type { StockTransfer, StockTransferItem } from "@/types/stock-transfer"

const createStockTransferSchema = z.object({
  date: z.string().min(1, { message: "Date is required" }),
  remarks: z
    .string()
    .trim()
    .max(250, { message: "Remarks are too long" })
    .optional(),
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
  fromBranch: string
  fromBranchId: string
  toBranch: string
  toBranchId: string
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

function rowTotal(row: ItemRow) {
  const quantity = Number(row.quantity) || 0
  const rate = Number(row.rate) || 0
  return quantity * rate
}

function makeTransferId() {
  return `TRF2-${Date.now().toString().slice(-4)}-2082-83`
}

function makeItemId(index: number) {
  return `ITM-${Date.now().toString().slice(-5)}-${index + 1}`
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <Card size="sm" className="ring-foreground/10">
      <CardHeader className="border-b pb-3">
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="pt-(--card-spacing)">{children}</CardContent>
    </Card>
  )
}

function BranchField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex h-9 items-center rounded-md border bg-muted/40 px-3 text-sm font-medium">
        {value}
      </div>
    </div>
  )
}

export function StockTransferForm({
  fromBranch,
  fromBranchId,
  toBranch,
  toBranchId,
  initialTransfer,
  submitLabel = "Submit Request",
  onSubmitTransfer,
  onCancel,
}: StockTransferFormProps) {
  const products = React.useMemo(() => getTransferableProducts(), [])

  const [rows, setRows] = React.useState<ItemRow[]>(() => {
    if (!initialTransfer?.items.length) return [makeRow()]
    return initialTransfer.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)
      return {
        key: `row-${item.id}`,
        productId: item.productId,
        name: item.name,
        quantity: String(item.quantity),
        rate: String(item.rate),
        availableQuantity: getBranchProductStock(fromBranchId, item.productId),
        unit: product?.unit ?? "Unit",
      }
    })
  })

  const form = useForm<CreateStockTransferFormInput>({
    resolver: zodResolver(createStockTransferSchema),
    defaultValues: {
      date: initialTransfer?.date ?? todayIsoDate(),
      remarks: initialTransfer?.remarks ?? "",
    },
  })

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
      availableQuantity: getBranchProductStock(fromBranchId, product.id),
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
        `${fromBranch} only has ${overstock.availableQuantity} ${overstock.unit} of "${overstock.name}" available.`
      )
      return
    }

    const items: StockTransferItem[] = validRows.map((row, index) => {
      const quantity = Number(row.quantity) || 0
      const rate = Number(row.rate) || 0
      return {
        id: initialTransfer?.items[index]?.id ?? makeItemId(index),
        productId: row.productId,
        name: row.name.trim(),
        quantity,
        rate,
        totalPrice: quantity * rate,
      }
    })

    const transfer: StockTransfer = {
      id: initialTransfer?.id ?? makeTransferId(),
      fromBranch,
      fromBranchId,
      toBranch,
      toBranchId,
      date: values.date,
      remarks: values.remarks?.trim() ?? "",
      items,
      totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
      totalAmount: items.reduce((sum, item) => sum + item.totalPrice, 0),
      entryBy: initialTransfer?.entryBy ?? toBranch,
      status: initialTransfer?.status ?? "requested",
    }

    onSubmitTransfer(transfer)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-4"
      >
        <FormSection
          title="Transfer details"
          description="Stock is requested from Head Office into your branch."
        >
          <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
            <BranchField label="From" value={fromBranch} />
            <div className="hidden h-9 items-center justify-center sm:flex">
              <span className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <ArrowRightIcon className="size-4" />
              </span>
            </div>
            <BranchField label="To" value={toBranch} />
          </div>

          <div className="mt-4 sm:max-w-xs">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Request date <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </FormSection>

        <FormSection
          title="Items"
          description="Pick products from the catalog. Rate fills from cost price."
        >
          <div className="mb-3 flex items-center justify-end">
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
                      {row.availableQuantity} {row.unit} available at {fromBranch}
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
                    onChange={(e) => updateRow(row.key, { rate: e.target.value })}
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

          <div className="mt-3 flex flex-col items-end gap-1 border-t pt-3 text-sm">
            <div className="flex w-full max-w-xs items-center justify-between">
              <span className="text-muted-foreground">Total quantity</span>
              <span className="font-medium tabular-nums">{totalQuantity}</span>
            </div>
            <div className="flex w-full max-w-xs items-center justify-between">
              <span className="font-medium">Grand total</span>
              <span className="text-base font-semibold tabular-nums">
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>
        </FormSection>

        <FormSection title="Remarks">
          <FormField
            control={form.control}
            name="remarks"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Reason or context for this request"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSection>

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
