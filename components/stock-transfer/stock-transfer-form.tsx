"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRightIcon, CalendarIcon, ChevronDownIcon, PlusIcon, Trash2Icon } from "lucide-react"
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
import { getBranchStockMap } from "@/lib/inventory/branch-stock"
import {
  getTransferableProducts,
  type TransferableProduct,
} from "@/lib/mock/stock-transfers"
import type { StockTransfer, StockTransferItem } from "@/types/stock-transfer"

const createStockTransferSchema = z.object({
  date: z.string().min(1, { message: "Date is required" }),
  remarks: z
    .string()
    .trim()
    .max(250, { message: "Notes are too long" })
    .optional(),
})

type CreateStockTransferFormInput = z.infer<typeof createStockTransferSchema>

type ItemRow = {
  key: string
  productId: string
  name: string
  quantity: string
  availableQuantity: number
  unit: string
}

type TransferBranchOption = {
  id: string
  name: string
}

type StockTransferFormProps = {
  fromBranch: string
  fromBranchId: string
  toBranch: string
  toBranchId: string
  counterpartSelect?: {
    label: "From" | "To"
    options: TransferBranchOption[]
    value: string
    onChange: (branch: TransferBranchOption) => void
  }
  requestedByBranchId?: string
  entryByName?: string
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
    availableQuantity: 0,
    unit: "Unit",
  }
}

function makeTransferId() {
  return `TRF-${Date.now().toString().slice(-4)}-2082-83`
}

function makeItemId(index: number) {
  return `ITM-${Date.now().toString().slice(-5)}-${index + 1}`
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

function BranchSelectField({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: TransferBranchOption[]
  value: string
  onChange: (branch: TransferBranchOption) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">
        {label} <span className="text-destructive">*</span>
      </span>
      <div className="relative">
        <NativeSelect
          value={value}
          onChange={(event) => {
            const next = options.find((option) => option.id === event.target.value)
            if (next) onChange(next)
          }}
          aria-label={label}
          className="pr-8"
        >
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </NativeSelect>
        <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground opacity-50" />
      </div>
    </div>
  )
}

export function StockTransferForm({
  fromBranch,
  fromBranchId,
  toBranch,
  toBranchId,
  counterpartSelect,
  requestedByBranchId,
  entryByName,
  initialTransfer,
  submitLabel = "Submit Request",
  onSubmitTransfer,
  onCancel,
}: StockTransferFormProps) {
  const products = React.useMemo(() => {
    const stock = getBranchStockMap(fromBranchId)
    return getTransferableProducts()
      .map((product) => ({
        ...product,
        availableQuantity: stock[product.id] ?? 0,
      }))
      .filter((product) => product.availableQuantity > 0)
  }, [fromBranchId])

  const [rows, setRows] = React.useState<ItemRow[]>(() => {
    if (!initialTransfer?.items.length) return [makeRow()]
    const stock = getBranchStockMap(fromBranchId)
    return initialTransfer.items.map((item) => {
      const product = getTransferableProducts().find((p) => p.id === item.productId)
      return {
        key: `row-${item.id}`,
        productId: item.productId,
        name: item.name,
        quantity: String(item.quantity),
        availableQuantity: stock[item.productId] ?? 0,
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
  const availableIds = React.useMemo(
    () => new Set(products.map((product) => product.id)),
    [products]
  )

  const isFirstFromBranch = React.useRef(true)

  React.useEffect(() => {
    if (isFirstFromBranch.current) {
      isFirstFromBranch.current = false
      return
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRows([makeRow()])
  }, [fromBranchId])

  function updateRow(key: string, patch: Partial<ItemRow>) {
    setRows((current) =>
      current.map((row) => (row.key === key ? { ...row, ...patch } : row))
    )
  }

  function selectProduct(key: string, product: TransferableProduct) {
    updateRow(key, {
      productId: product.id,
      name: product.name,
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
      return {
        id: initialTransfer?.items[index]?.id ?? makeItemId(index),
        productId: row.productId,
        name: row.name.trim(),
        quantity,
        rate: 0,
        totalPrice: 0,
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
      totalAmount: 0,
      entryBy: initialTransfer?.entryBy ?? entryByName ?? toBranch,
      status: initialTransfer?.status ?? "requested",
      requestedByBranchId:
        initialTransfer?.requestedByBranchId ??
        requestedByBranchId ??
        toBranchId,
    }

    onSubmitTransfer(transfer)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-4"
      >
        <Card size="sm" className="ring-foreground/10">
          <CardContent className="flex flex-col gap-5 pt-(--card-spacing)">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr_12rem] sm:items-end">
              {counterpartSelect?.label === "From" ? (
                <BranchSelectField
                  label="From"
                  options={counterpartSelect.options}
                  value={counterpartSelect.value}
                  onChange={counterpartSelect.onChange}
                />
              ) : (
                <BranchField label="From" value={fromBranch} />
              )}
              <div className="hidden h-9 items-center justify-center sm:flex">
                <ArrowRightIcon className="size-4 text-muted-foreground" />
              </div>
              {counterpartSelect?.label === "To" ? (
                <BranchSelectField
                  label="To"
                  options={counterpartSelect.options}
                  value={counterpartSelect.value}
                  onChange={counterpartSelect.onChange}
                />
              ) : (
                <BranchField label="To" value={toBranch} />
              )}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Request date <span className="text-destructive">*</span>
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
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Items</p>
                  <p className="text-xs text-muted-foreground">
                    Items listed are available at {fromBranch}.
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addRow}>
                  <PlusIcon className="size-4" />
                  Add
                </Button>
              </div>

              <div className="hidden grid-cols-[minmax(0,1fr)_7rem_2.25rem] gap-2 px-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase md:grid">
                <span>Item</span>
                <span className="text-right">Qty</span>
                <span />
              </div>

              {rows.map((row, index) => (
                <div
                  key={row.key}
                  className="grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1fr)_7rem_2.25rem] md:items-center"
                >
                  <ProductItemSelect
                    value={row.productId}
                    products={products}
                    excludeIds={selectedProductIds}
                    onChange={(product) => selectProduct(row.key, product)}
                    placeholder="Select item…"
                    emptyMessage={
                      availableIds.size === 0
                        ? `No items available at ${fromBranch}.`
                        : "No item found."
                    }
                  />
                  <Input
                    type="number"
                    min={0}
                    max={row.availableQuantity || undefined}
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
                  Total qty{" "}
                  <span className="font-medium text-foreground tabular-nums">
                    {totalQuantity}
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
