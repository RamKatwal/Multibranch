"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  FormDialogBody,
  FormDialogContent,
  FormDialogDescription,
  FormDialogFooter,
  FormDialogHeader,
  FormDialogTitle,
} from "@/components/ui/form-dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { PaymentTerm } from "@/types/payment-term"

const paymentTermFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Term name is required" })
    .max(60, { message: "Term name is too long" }),
  days: z.coerce
    .number({ message: "Enter the number of days" })
    .int({ message: "Days must be a whole number" })
    .min(0, { message: "Days cannot be negative" })
    .max(365, { message: "Days is too large" }),
  description: z.string().trim().max(250, { message: "Description is too long" }),
})

type PaymentTermFormInput = z.input<typeof paymentTermFormSchema>
export type PaymentTermFormValues = z.output<typeof paymentTermFormSchema>

type PaymentTermFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  term?: PaymentTerm | null
  onSubmit: (values: PaymentTermFormValues) => void
}

const emptyValues: PaymentTermFormValues = {
  name: "",
  days: 0,
  description: "",
}

export function PaymentTermFormDialog({
  open,
  onOpenChange,
  mode,
  term,
  onSubmit,
}: PaymentTermFormDialogProps) {
  const isEdit = mode === "edit"

  const form = useForm<PaymentTermFormInput, unknown, PaymentTermFormValues>({
    resolver: zodResolver(paymentTermFormSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: emptyValues,
  })

  React.useEffect(() => {
    if (!open) return

    if (isEdit && term) {
      form.reset({
        name: term.name,
        days: term.days,
        description: term.description,
      })
      return
    }

    form.reset(emptyValues)
  }, [open, isEdit, term, form])

  function handleSubmit(values: PaymentTermFormValues) {
    onSubmit(values)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FormDialogContent size="md">
        <FormDialogHeader>
          <FormDialogTitle>
            {isEdit ? "Edit Payment Term" : "Add Payment Term"}
          </FormDialogTitle>
          <FormDialogDescription>
            Payment terms define the number of days customers or suppliers
            have to settle an invoice.
          </FormDialogDescription>
        </FormDialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <FormDialogBody>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Term Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Net 30" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due (days)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={365}
                        {...field}
                        value={field.value as number}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Optional description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormDialogBody>

            <FormDialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {isEdit ? "Save changes" : "Add Payment Term"}
              </Button>
            </FormDialogFooter>
          </form>
        </Form>
      </FormDialogContent>
    </Dialog>
  )
}
