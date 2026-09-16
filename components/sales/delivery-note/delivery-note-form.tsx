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
import { todayIsoDate } from "@/lib/branches/storage"
import { mockCustomers } from "@/lib/mock/customers"
import {
  DELIVERY_NOTE_INVOICE_STATUSES,
  deliveryNoteInvoiceStatusLabels,
  type DeliveryNote,
} from "@/types/delivery-note"

const deliveryNoteFormSchema = z.object({
  customerId: z.string().min(1, { message: "Customer is required" }),
  entryDate: z.string().min(1, { message: "Entry date is required" }),
  totalAmount: z
    .string()
    .min(1, { message: "Total amount is required" })
    .refine((value) => Number(value) > 0, {
      message: "Enter a valid amount",
    }),
  invoiceStatus: z.enum(DELIVERY_NOTE_INVOICE_STATUSES),
})

type DeliveryNoteFormInput = z.infer<typeof deliveryNoteFormSchema>

type DeliveryNoteFormProps = {
  initialNote?: DeliveryNote
  nextId: string
  submitLabel?: string
  onSubmitNote: (note: DeliveryNote) => void
  onCancel: () => void
}

export function DeliveryNoteForm({
  initialNote,
  nextId,
  submitLabel = "Create Delivery Note",
  onSubmitNote,
  onCancel,
}: DeliveryNoteFormProps) {
  const customers = React.useMemo(() => {
    const active = mockCustomers.filter((customer) => customer.status === "active")
    if (
      initialNote?.customerId &&
      !active.some((customer) => customer.id === initialNote.customerId)
    ) {
      const extra = mockCustomers.find(
        (customer) => customer.id === initialNote.customerId
      )
      if (extra) return [extra, ...active]
    }
    return active
  }, [initialNote])

  const form = useForm<DeliveryNoteFormInput>({
    resolver: zodResolver(deliveryNoteFormSchema),
    defaultValues: {
      customerId: initialNote?.customerId ?? "",
      entryDate: initialNote?.entryDate ?? todayIsoDate(),
      totalAmount: initialNote != null ? String(initialNote.totalAmount) : "",
      invoiceStatus: initialNote?.invoiceStatus ?? "not-invoiced",
    },
  })

  function handleSubmit(values: DeliveryNoteFormInput) {
    const customer = customers.find((entry) => entry.id === values.customerId)
    if (!customer) {
      toast.error("Select a customer.")
      return
    }

    onSubmitNote({
      id: initialNote?.id ?? nextId,
      customerId: customer.id,
      customer: customer.name,
      entryDate: values.entryDate,
      totalAmount: Number(values.totalAmount) || 0,
      invoiceStatus: values.invoiceStatus,
      status: initialNote?.status ?? "draft",
      entryBy: initialNote?.entryBy ?? "admin",
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
            <div className="grid gap-3 sm:grid-cols-2 sm:items-end lg:grid-cols-4">
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
                name="totalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Total amount <span className="text-destructive">*</span>
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
                name="invoiceStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Invoice status <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <NativeSelect
                          aria-label="Invoice status"
                          className="pr-8"
                          {...field}
                        >
                          {DELIVERY_NOTE_INVOICE_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {deliveryNoteInvoiceStatusLabels[status]}
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
