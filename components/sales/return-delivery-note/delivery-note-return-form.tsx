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
import { mockDeliveryNotes } from "@/lib/mock/delivery-notes"
import type { DeliveryNoteReturn } from "@/types/delivery-note-return"

const deliveryNoteReturnFormSchema = z.object({
  customerId: z.string().min(1, { message: "Customer is required" }),
  entryDate: z.string().min(1, { message: "Entry date is required" }),
  deliveryNoteId: z
    .string()
    .min(1, { message: "Delivery note is required" }),
  totalAmount: z
    .string()
    .min(1, { message: "Total amount is required" })
    .refine((value) => Number(value) > 0, {
      message: "Enter a valid amount",
    }),
})

type DeliveryNoteReturnFormInput = z.infer<typeof deliveryNoteReturnFormSchema>

type DeliveryNoteReturnFormProps = {
  initialReturn?: DeliveryNoteReturn
  nextId: string
  submitLabel?: string
  onSubmitReturn: (entry: DeliveryNoteReturn) => void
  onCancel: () => void
}

export function DeliveryNoteReturnForm({
  initialReturn,
  nextId,
  submitLabel = "Create Return Delivery Note",
  onSubmitReturn,
  onCancel,
}: DeliveryNoteReturnFormProps) {
  const customers = React.useMemo(() => {
    const active = mockCustomers.filter((customer) => customer.status === "active")
    if (
      initialReturn?.customerId &&
      !active.some((customer) => customer.id === initialReturn.customerId)
    ) {
      const extra = mockCustomers.find(
        (customer) => customer.id === initialReturn.customerId
      )
      if (extra) return [extra, ...active]
    }
    return active
  }, [initialReturn])

  const deliveryNoteOptions = React.useMemo(() => {
    const ids = mockDeliveryNotes.map((note) => note.id)
    if (
      initialReturn?.deliveryNoteId &&
      !ids.includes(initialReturn.deliveryNoteId)
    ) {
      return [initialReturn.deliveryNoteId, ...ids]
    }
    return ids
  }, [initialReturn])

  const form = useForm<DeliveryNoteReturnFormInput>({
    resolver: zodResolver(deliveryNoteReturnFormSchema),
    defaultValues: {
      customerId: initialReturn?.customerId ?? "",
      entryDate: initialReturn?.entryDate ?? todayIsoDate(),
      deliveryNoteId: initialReturn?.deliveryNoteId ?? "",
      totalAmount:
        initialReturn != null ? String(initialReturn.totalAmount) : "",
    },
  })

  function handleSubmit(values: DeliveryNoteReturnFormInput) {
    const customer = customers.find((entry) => entry.id === values.customerId)
    if (!customer) {
      toast.error("Select a customer.")
      return
    }

    onSubmitReturn({
      id: initialReturn?.id ?? nextId,
      customerId: customer.id,
      customer: customer.name,
      entryDate: values.entryDate,
      deliveryNoteId: values.deliveryNoteId,
      totalAmount: Number(values.totalAmount) || 0,
      status: initialReturn?.status ?? "draft",
      entryBy: initialReturn?.entryBy ?? "admin",
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
                name="deliveryNoteId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Delivery note <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <NativeSelect
                          aria-label="Delivery note"
                          className="pr-8"
                          {...field}
                        >
                          <option value="">Select delivery note…</option>
                          {deliveryNoteOptions.map((id) => (
                            <option key={id} value={id}>
                              {id}
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
