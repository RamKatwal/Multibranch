"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, ChevronDownIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

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
import { Switch } from "@/components/ui/switch"
import { Tabs } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { todayIsoDate } from "@/lib/branches/storage"
import { formatCurrency } from "@/lib/format"
import {
  mockExpenseAccounts,
  mockExpensePaymentPeriods,
  mockPaidFromAccounts,
} from "@/lib/mock/purchase-expenses"
import { mockSuppliers } from "@/lib/mock/suppliers"
import { calculatePurchaseExpenseTotals } from "@/lib/purchase-expenses/calculations"
import { createPurchaseExpenseItemId } from "@/lib/purchase-expenses/storage"
import {
  PURCHASE_EXPENSE_VAT_OPTIONS,
  purchaseExpenseModeLabels,
  purchaseExpenseVatLabels,
  type PurchaseExpense,
  type PurchaseExpenseItem,
  type PurchaseExpenseMode,
  type PurchaseExpenseVatOption,
} from "@/types/purchase-expense"

const purchaseExpenseFormSchema = z.object({
  supplierId: z.string().optional(),
  invoiceNumber: z.string().optional(),
  entryDate: z.string().min(1, { message: "Entry date is required" }),
  invoiceDate: z.string().optional(),
  paymentPeriodId: z.string().optional(),
  paidFromId: z.string().optional(),
  remarks: z
    .string()
    .trim()
    .max(100, { message: "Remarks are too long" })
    .optional(),
})

type PurchaseExpenseFormInput = z.infer<typeof purchaseExpenseFormSchema>

type ItemRow = {
  key: string
  accountId: string
  account: string
  vat: PurchaseExpenseVatOption
  amount: string
  description: string
}

type PurchaseExpenseFormProps = {
  initialExpense?: PurchaseExpense
  nextId: string
  submitLabel?: string
  onSubmitExpense: (expense: PurchaseExpense) => void
  onCancel: () => void
}

let nextRowKey = 0

function makeRow(): ItemRow {
  nextRowKey += 1
  return {
    key: `row-${nextRowKey}`,
    accountId: "",
    account: "",
    vat: "no-vat",
    amount: "",
    description: "",
  }
}

export function PurchaseExpenseForm({
  initialExpense,
  nextId,
  submitLabel = "Create Expense",
  onSubmitExpense,
  onCancel,
}: PurchaseExpenseFormProps) {
  const [mode, setMode] = React.useState<PurchaseExpenseMode>(
    initialExpense?.mode ?? "with-bill"
  )
  const isWithBill = mode === "with-bill"

  const suppliers = React.useMemo(() => {
    const active = mockSuppliers.filter((supplier) => supplier.status === "active")
    if (
      initialExpense?.supplierId &&
      !active.some((supplier) => supplier.id === initialExpense.supplierId)
    ) {
      const extra = mockSuppliers.find(
        (supplier) => supplier.id === initialExpense.supplierId
      )
      if (extra) return [extra, ...active]
    }
    return active
  }, [initialExpense])

  const [rows, setRows] = React.useState<ItemRow[]>(() => {
    if (!initialExpense?.items.length) return [makeRow()]
    return initialExpense.items.map((item) => ({
      key: `row-${item.id}`,
      accountId: item.accountId,
      account: item.account,
      vat: item.vat,
      amount: String(item.amount),
      description: item.description,
    }))
  })

  const [tds, setTds] = React.useState(initialExpense?.tds ?? false)
  const [quickPayment, setQuickPayment] = React.useState(
    initialExpense?.quickPayment ?? false
  )

  const form = useForm<PurchaseExpenseFormInput>({
    resolver: zodResolver(purchaseExpenseFormSchema),
    defaultValues: {
      supplierId: initialExpense?.supplierId ?? "",
      invoiceNumber: initialExpense?.invoiceNumber ?? "",
      entryDate: initialExpense?.entryDate ?? todayIsoDate(),
      invoiceDate: initialExpense?.invoiceDate ?? "",
      paymentPeriodId: initialExpense?.paymentPeriodId ?? "",
      paidFromId: initialExpense?.paidFromId ?? "",
      remarks: initialExpense?.remarks ?? "",
    },
  })

  function updateRow(key: string, patch: Partial<ItemRow>) {
    setRows((current) =>
      current.map((row) => (row.key === key ? { ...row, ...patch } : row))
    )
  }

  function selectAccount(key: string, accountId: string) {
    const account = mockExpenseAccounts.find((entry) => entry.id === accountId)
    updateRow(key, { accountId, account: account?.name ?? "" })
  }

  function addRow() {
    setRows((current) => [...current, makeRow()])
  }

  function removeRow(key: string) {
    setRows((current) =>
      current.length === 1 ? current : current.filter((row) => row.key !== key)
    )
  }

  const items: PurchaseExpenseItem[] = rows.map((row, index) => ({
    id: initialExpense?.items[index]?.id ?? createPurchaseExpenseItemId(index),
    accountId: row.accountId,
    account: row.account,
    vat: isWithBill ? row.vat : "no-vat",
    amount: Number(row.amount) || 0,
    description: row.description.trim(),
  }))

  const totals = calculatePurchaseExpenseTotals(items)

  function handleSubmit(values: PurchaseExpenseFormInput) {
    const validRows = rows.filter(
      (row) => row.accountId && Number(row.amount) > 0
    )

    if (validRows.length === 0) {
      toast.error("Add at least one expense line with an amount.")
      return
    }

    let supplier: (typeof suppliers)[number] | undefined
    let paymentPeriod: (typeof mockExpensePaymentPeriods)[number] | undefined
    let paidFrom: (typeof mockPaidFromAccounts)[number] | undefined

    if (isWithBill) {
      supplier = suppliers.find((entry) => entry.id === values.supplierId)
      if (!supplier) {
        toast.error("Select a supplier.")
        return
      }
      if (!values.invoiceNumber?.trim()) {
        toast.error("Enter the invoice number.")
        return
      }
      paymentPeriod = mockExpensePaymentPeriods.find(
        (term) => term.id === values.paymentPeriodId
      )
      if (!paymentPeriod) {
        toast.error("Select a payment period.")
        return
      }
    } else {
      paidFrom = mockPaidFromAccounts.find(
        (account) => account.id === values.paidFromId
      )
      if (!paidFrom) {
        toast.error("Select an account to pay from.")
        return
      }
    }

    const finalItems: PurchaseExpenseItem[] = validRows.map((row, index) => ({
      id: initialExpense?.items[index]?.id ?? createPurchaseExpenseItemId(index),
      accountId: row.accountId,
      account: row.account,
      vat: isWithBill ? row.vat : "no-vat",
      amount: Number(row.amount) || 0,
      description: row.description.trim(),
    }))

    const finalTotals = calculatePurchaseExpenseTotals(finalItems)

    onSubmitExpense({
      id: initialExpense?.id ?? nextId,
      mode,
      supplierId: supplier?.id ?? "",
      supplier: supplier?.name ?? "",
      invoiceNumber: isWithBill ? (values.invoiceNumber?.trim() ?? "") : "",
      entryDate: values.entryDate,
      invoiceDate: isWithBill ? (values.invoiceDate ?? "") : "",
      paymentPeriodId: paymentPeriod?.id ?? "",
      paymentPeriod: paymentPeriod?.name ?? "",
      paidFromId: paidFrom?.id ?? "",
      paidFrom: paidFrom?.name ?? "",
      status: initialExpense?.status ?? "draft",
      paymentStatus: initialExpense?.paymentStatus ?? "unpaid",
      tds: isWithBill && tds,
      quickPayment: !isWithBill && quickPayment,
      remarks: values.remarks?.trim() ?? "",
      items: finalItems,
      ...finalTotals,
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-4"
      >
        <Tabs
          items={[
            { value: "with-bill", label: purchaseExpenseModeLabels["with-bill"] },
            { value: "without-bill", label: purchaseExpenseModeLabels["without-bill"] },
          ]}
          value={mode}
          onValueChange={(value) => {
            if (typeof value !== "string") return
            setMode(value as PurchaseExpenseMode)
          }}
        />

        <Card size="sm" className="ring-foreground/10">
          <CardContent className="flex flex-col gap-5 pt-(--card-spacing)">
            {isWithBill ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2 sm:items-end">
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
                    name="invoiceNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Invoice Number <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter invoice number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-3 sm:items-end">
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
                    name="invoiceDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Invoice date</FormLabel>
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
                    name="paymentPeriodId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Payment Period <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <NativeSelect
                              aria-label="Payment Period"
                              className="pr-8"
                              {...field}
                            >
                              <option value="">Select…</option>
                              {mockExpensePaymentPeriods.map((term) => (
                                <option key={term.id} value={term.id}>
                                  {term.name}
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
              </>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 sm:items-end">
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
                  name="paidFromId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Paid From <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <NativeSelect
                            aria-label="Paid From"
                            className="pr-8"
                            {...field}
                          >
                            <option value="">Select…</option>
                            {mockPaidFromAccounts.map((account) => (
                              <option key={account.id} value={account.id}>
                                {account.name}
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
            )}

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">Expense lines</p>
                <Button type="button" variant="outline" size="sm" onClick={addRow}>
                  <PlusIcon className="size-4" />
                  Add
                </Button>
              </div>

              <div className="-mx-1 overflow-x-auto px-1 pb-1">
                <div
                  className={`flex flex-col gap-2 ${isWithBill ? "min-w-[44rem]" : "min-w-[38rem]"}`}
                >
                  <div
                    className={`grid gap-2 px-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase ${
                      isWithBill
                        ? "grid-cols-[minmax(0,1.2fr)_5.5rem_7rem_minmax(0,1.2fr)_2.25rem]"
                        : "grid-cols-[minmax(0,1.2fr)_7rem_minmax(0,1.2fr)_2.25rem]"
                    }`}
                  >
                    <span>Account</span>
                    {isWithBill ? <span>VAT</span> : null}
                    <span className="text-right">Amount</span>
                    <span>Description</span>
                    <span />
                  </div>

                  {rows.map((row, index) => (
                    <div
                      key={row.key}
                      className={`grid items-center gap-2 ${
                        isWithBill
                          ? "grid-cols-[minmax(0,1.2fr)_5.5rem_7rem_minmax(0,1.2fr)_2.25rem]"
                          : "grid-cols-[minmax(0,1.2fr)_7rem_minmax(0,1.2fr)_2.25rem]"
                      }`}
                    >
                      <div className="relative">
                        <NativeSelect
                          aria-label={`Account for line ${index + 1}`}
                          className="h-9 pr-7 text-sm"
                          value={row.accountId}
                          onChange={(event) =>
                            selectAccount(row.key, event.target.value)
                          }
                        >
                          <option value="">Select account…</option>
                          {mockExpenseAccounts.map((account) => (
                            <option key={account.id} value={account.id}>
                              {account.name}
                            </option>
                          ))}
                        </NativeSelect>
                        <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2 text-muted-foreground opacity-50" />
                      </div>

                      {isWithBill ? (
                        <div className="relative">
                          <NativeSelect
                            aria-label={`VAT for line ${index + 1}`}
                            className="h-9 pr-7 text-sm"
                            value={row.vat}
                            onChange={(event) =>
                              updateRow(row.key, {
                                vat: event.target.value as PurchaseExpenseVatOption,
                              })
                            }
                          >
                            {PURCHASE_EXPENSE_VAT_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {purchaseExpenseVatLabels[option]}
                              </option>
                            ))}
                          </NativeSelect>
                          <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2 text-muted-foreground opacity-50" />
                        </div>
                      ) : null}

                      <Input
                        type="number"
                        min={0}
                        step="any"
                        inputMode="decimal"
                        placeholder="0"
                        value={row.amount}
                        onChange={(event) =>
                          updateRow(row.key, { amount: event.target.value })
                        }
                        className="h-9 text-right tabular-nums"
                        aria-label={`Amount for line ${index + 1}`}
                      />

                      <Input
                        placeholder="Description"
                        value={row.description}
                        onChange={(event) =>
                          updateRow(row.key, { description: event.target.value })
                        }
                        className="h-9"
                        aria-label={`Description for line ${index + 1}`}
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => removeRow(row.key)}
                        disabled={rows.length === 1}
                        aria-label="Remove line"
                      >
                        <Trash2Icon className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remarks</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter references if any or any remarks"
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

                {isWithBill ? (
                  <label className="flex items-center gap-2 text-sm">
                    <Switch checked={tds} onCheckedChange={setTds} />
                    Tax Deducted at Source (TDS)
                  </label>
                ) : (
                  <label className="flex items-center gap-2 text-sm">
                    <Switch checked={quickPayment} onCheckedChange={setQuickPayment} />
                    Quick Payment
                  </label>
                )}
              </div>

              <div className="flex flex-col gap-2 rounded-md border p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Sub Total</span>
                  <span className="font-medium tabular-nums">
                    {formatCurrency(totals.subTotal)}
                  </span>
                </div>
                {isWithBill ? (
                  <>
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
                  </>
                ) : null}
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
