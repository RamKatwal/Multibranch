"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, ChevronDownIcon } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { todayIsoDate } from "@/lib/branches/storage"
import { mockCustomers } from "@/lib/mock/customers"
import {
  SALES_PAYMENT_MODES,
  salesPaymentModeLabels,
  type SalesPayment,
} from "@/types/sales-payment"

const salesPaymentFormSchema = z.object({
  customerId: z.string().min(1, { message: "Customer is required" }),
  entryDate: z.string().min(1, { message: "Entry date is required" }),
  refInvoice: z.string().optional(),
  amount: z
    .string()
    .min(1, { message: "Amount is required" })
    .refine((value) => Number(value) > 0, {
      message: "Enter a valid amount",
    }),
  mode: z.enum(SALES_PAYMENT_MODES),
  remarks: z
    .string()
    .trim()
    .max(100, { message: "Remarks are too long" })
    .optional(),
})

type SalesPaymentFormInput = z.infer<typeof salesPaymentFormSchema>

type SalesPaymentFormProps = {
  initialPayment?: SalesPayment
  nextId: string
  submitLabel?: string
  onSubmitPayment: (payment: SalesPayment) => void
  onCancel: () => void
}

export function SalesPaymentForm({
  initialPayment,
  nextId,
  submitLabel = "Record Payment",
  onSubmitPayment,
  onCancel,
}: SalesPaymentFormProps) {
  const customers = React.useMemo(() => {
    const active = mockCustomers.filter((customer) => customer.status === "active")
    if (
      initialPayment?.customerId &&
      !active.some((customer) => customer.id === initialPayment.customerId)
    ) {
      const extra = mockCustomers.find(
        (customer) => customer.id === initialPayment.customerId
      )
      if (extra) return [extra, ...active]
    }
    return active
  }, [initialPayment])

  const form = useForm<SalesPaymentFormInput>({
    resolver: zodResolver(salesPaymentFormSchema),
    defaultValues: {
      customerId: initialPayment?.customerId ?? "",
      entryDate: initialPayment?.entryDate ?? todayIsoDate(),
      refInvoice: initialPayment?.refInvoice ?? "",
      amount: initialPayment != null ? String(initialPayment.amount) : "",
      mode: initialPayment?.mode ?? "cash",
      remarks: initialPayment?.remarks ?? "",
    },
  })

  function handleSubmit(values: SalesPaymentFormInput) {
    const customer = customers.find((entry) => entry.id === values.customerId)
    if (!customer) {
      toast.error("Select a customer.")
      return
    }

    onSubmitPayment({
      id: initialPayment?.id ?? nextId,
      customerId: customer.id,
      customer: customer.name,
      entryDate: values.entryDate,
      refInvoice: values.refInvoice?.trim() ?? "",
      amount: Number(values.amount) || 0,
      mode: values.mode,
      status: initialPayment?.status ?? "draft",
      remarks: values.remarks?.trim() ?? "",
      entryBy: initialPayment?.entryBy ?? "admin",
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
            <div className="grid gap-3 sm:grid-cols-2 sm:items-end lg:grid-cols-3">
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
                name="refInvoice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ref. Invoice</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. SNV-000001-2082/83"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Amount <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="any"
                        inputMode="decimal"
                        className="tabular-nums"
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Mode <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <NativeSelect
                          aria-label="Payment mode"
                          className="pr-8"
                          {...field}
                        >
                          {SALES_PAYMENT_MODES.map((mode) => (
                            <option key={mode} value={mode}>
                              {salesPaymentModeLabels[mode]}
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

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      maxLength={100}
                      placeholder="Optional notes…"
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
