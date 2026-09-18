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
import { NativeSelect } from "@/components/ui/native-select"
import {
  ACCOUNT_CATEGORIES,
  type ChartOfAccount,
} from "@/lib/mock/chart-of-accounts"

const chartOfAccountFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Account name is required" })
    .max(80, { message: "Account name is too long" }),
  category: z.enum(ACCOUNT_CATEGORIES),
  openingBalance: z.coerce
    .number()
    .min(0, { message: "Opening balance can't be negative" }),
})

type ChartOfAccountFormInput = z.input<typeof chartOfAccountFormSchema>
export type ChartOfAccountFormValues = z.output<
  typeof chartOfAccountFormSchema
>

type ChartOfAccountFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  account?: ChartOfAccount | null
  onSubmit: (values: ChartOfAccountFormValues) => void
}

const emptyValues: ChartOfAccountFormValues = {
  name: "",
  category: "Current Assets",
  openingBalance: 0,
}

export function ChartOfAccountFormDialog({
  open,
  onOpenChange,
  mode,
  account,
  onSubmit,
}: ChartOfAccountFormDialogProps) {
  const isEdit = mode === "edit"

  const form = useForm<
    ChartOfAccountFormInput,
    unknown,
    ChartOfAccountFormValues
  >({
    resolver: zodResolver(chartOfAccountFormSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: emptyValues,
  })

  React.useEffect(() => {
    if (!open) return

    if (isEdit && account) {
      form.reset({
        name: account.name,
        category: account.category,
        openingBalance: account.openingBalance,
      })
      return
    }

    form.reset(emptyValues)
  }, [open, isEdit, account, form])

  function handleSubmit(values: ChartOfAccountFormValues) {
    onSubmit(values)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FormDialogContent size="md">
        <FormDialogHeader>
          <FormDialogTitle>
            {isEdit ? "Edit Account" : "Create Account"}
          </FormDialogTitle>
          <FormDialogDescription>
            {isEdit
              ? "Update this ledger account's details."
              : "Add a new account to the chart of accounts."}
          </FormDialogDescription>
        </FormDialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <FormDialogBody className="grid min-h-0 flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
              {isEdit && account ? (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input value={account.code} disabled readOnly />
                  </FormControl>
                </FormItem>
              ) : null}

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>
                      Account Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Petty Cash"
                        autoFocus
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Category</FormLabel>
                    <FormControl>
                      <NativeSelect {...field}>
                        {ACCOUNT_CATEGORIES.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </NativeSelect>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="openingBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opening Balance</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        value={field.value as number | string}
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
              <Button type="submit">{isEdit ? "Save changes" : "Save"}</Button>
            </FormDialogFooter>
          </form>
        </Form>
      </FormDialogContent>
    </Dialog>
  )
}
