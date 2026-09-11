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
import type { TdsType } from "@/types/tds-type"

const tdsTypeFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "TDS type name is required" })
    .max(60, { message: "TDS type name is too long" }),
  rate: z.coerce
    .number({ message: "Enter a deduction rate" })
    .min(0, { message: "Rate cannot be negative" })
    .max(100, { message: "Rate cannot exceed 100%" }),
})

type TdsTypeFormInput = z.input<typeof tdsTypeFormSchema>
export type TdsTypeFormValues = z.output<typeof tdsTypeFormSchema>

type TdsTypeFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  type?: TdsType | null
  onSubmit: (values: TdsTypeFormValues) => void
}

const emptyValues: TdsTypeFormValues = {
  name: "",
  rate: 0,
}

export function TdsTypeFormDialog({
  open,
  onOpenChange,
  mode,
  type,
  onSubmit,
}: TdsTypeFormDialogProps) {
  const isEdit = mode === "edit"

  const form = useForm<TdsTypeFormInput, unknown, TdsTypeFormValues>({
    resolver: zodResolver(tdsTypeFormSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: emptyValues,
  })

  React.useEffect(() => {
    if (!open) return

    if (isEdit && type) {
      form.reset({
        name: type.name,
        rate: type.rate,
      })
      return
    }

    form.reset(emptyValues)
  }, [open, isEdit, type, form])

  function handleSubmit(values: TdsTypeFormValues) {
    onSubmit(values)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FormDialogContent size="md">
        <FormDialogHeader>
          <FormDialogTitle>
            {isEdit ? "Edit TDS Type" : "Add TDS Type"}
          </FormDialogTitle>
          <FormDialogDescription>
            TDS types are the tax-deducted-at-source categories available for
            purchase and sales payments.
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
                    <FormLabel>TDS Type Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Rent" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step="0.1"
                        {...field}
                        value={field.value as number}
                      />
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
                {isEdit ? "Save changes" : "Add TDS Type"}
              </Button>
            </FormDialogFooter>
          </form>
        </Form>
      </FormDialogContent>
    </Dialog>
  )
}
