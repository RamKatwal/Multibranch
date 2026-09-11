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
  FormDescription,
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
import { documentTypeLabels } from "@/types/document-type"
import {
  formatTransactionNumber,
  type TransactionNumberingRule,
} from "@/types/transaction-numbering"

const transactionNumberingFormSchema = z.object({
  prefix: z.string().trim().max(15, { message: "Prefix is too long" }),
  nextNumber: z.coerce
    .number({ message: "Enter the next number" })
    .int({ message: "Next number must be a whole number" })
    .min(1, { message: "Next number must be at least 1" })
    .max(999999999, { message: "Next number is too large" }),
  padding: z.coerce
    .number({ message: "Enter the number of digits" })
    .int({ message: "Digits must be a whole number" })
    .min(1, { message: "Use at least 1 digit" })
    .max(10, { message: "Use at most 10 digits" }),
})

type TransactionNumberingFormInput = z.input<
  typeof transactionNumberingFormSchema
>
export type TransactionNumberingFormValues = z.output<
  typeof transactionNumberingFormSchema
>

type TransactionNumberingFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  rule: TransactionNumberingRule | null
  onSubmit: (values: TransactionNumberingFormValues) => void
}

export function TransactionNumberingFormDialog({
  open,
  onOpenChange,
  rule,
  onSubmit,
}: TransactionNumberingFormDialogProps) {
  const form = useForm<
    TransactionNumberingFormInput,
    unknown,
    TransactionNumberingFormValues
  >({
    resolver: zodResolver(transactionNumberingFormSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: { prefix: "", nextNumber: 1, padding: 6 },
  })

  React.useEffect(() => {
    if (!open || !rule) return

    form.reset({
      prefix: rule.prefix,
      nextNumber: rule.nextNumber,
      padding: rule.padding,
    })
  }, [open, rule, form])

  const watched = form.watch()
  const preview = formatTransactionNumber({
    prefix: watched.prefix ?? "",
    nextNumber: Number(watched.nextNumber) || 0,
    padding: Number(watched.padding) || 1,
  })

  function handleSubmit(values: TransactionNumberingFormValues) {
    onSubmit(values)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FormDialogContent size="md">
        <FormDialogHeader>
          <FormDialogTitle>
            {rule ? `Edit Numbering — ${documentTypeLabels[rule.documentType]}` : "Edit Numbering"}
          </FormDialogTitle>
          <FormDialogDescription>
            Set the prefix, next number, and digit padding used when a new
            document of this type is created.
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
                name="prefix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prefix</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. SO-" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="nextNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Next Number</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
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
                  name="padding"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Digits</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={10}
                          {...field}
                          value={field.value as number}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="rounded-lg border bg-muted/30 px-3 py-2">
                <span className="text-xs text-muted-foreground">Preview</span>
                <p className="font-mono text-sm font-medium">{preview}</p>
              </div>
              <FormDescription>
                This is the number the next document of this type will use.
              </FormDescription>
            </FormDialogBody>

            <FormDialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save changes</Button>
            </FormDialogFooter>
          </form>
        </Form>
      </FormDialogContent>
    </Dialog>
  )
}
