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
import { mockChartOfAccounts } from "@/lib/mock/chart-of-accounts"
import {
  BANK_ACCOUNT_TYPES,
  bankAccountTypeLabels,
  type BankAccount,
} from "@/types/bank-account"

const bankAccountFormSchema = z.object({
  bankName: z
    .string()
    .trim()
    .min(1, { message: "Bank name is required" })
    .max(100, { message: "Bank name is too long" }),
  accountName: z
    .string()
    .trim()
    .min(1, { message: "Account name is required" })
    .max(100, { message: "Account name is too long" }),
  accountNumber: z
    .string()
    .trim()
    .min(1, { message: "Account number is required" })
    .max(30, { message: "Account number is too long" }),
  branchName: z.string().trim().max(80, { message: "Branch is too long" }),
  accountType: z.enum(BANK_ACCOUNT_TYPES),
  glCode: z.string().min(1, { message: "Linked account is required" }),
  openingBalance: z.coerce
    .number()
    .min(0, { message: "Opening balance can't be negative" }),
})

type BankAccountFormInput = z.input<typeof bankAccountFormSchema>
export type BankAccountFormValues = z.output<typeof bankAccountFormSchema>

type BankAccountFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  account?: BankAccount | null
  onSubmit: (values: BankAccountFormValues) => void
}

const bankGlOptions = mockChartOfAccounts.filter(
  (account) => account.category === "Current Assets"
)

const emptyValues: BankAccountFormValues = {
  bankName: "",
  accountName: "",
  accountNumber: "",
  branchName: "",
  accountType: "current",
  glCode: bankGlOptions[0]?.code ?? "COA3",
  openingBalance: 0,
}

export function BankAccountFormDialog({
  open,
  onOpenChange,
  mode,
  account,
  onSubmit,
}: BankAccountFormDialogProps) {
  const isEdit = mode === "edit"

  const form = useForm<BankAccountFormInput, unknown, BankAccountFormValues>({
    resolver: zodResolver(bankAccountFormSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: emptyValues,
  })

  React.useEffect(() => {
    if (!open) return

    if (isEdit && account) {
      form.reset({
        bankName: account.bankName,
        accountName: account.accountName,
        accountNumber: account.accountNumber,
        branchName: account.branchName,
        accountType: account.accountType,
        glCode: account.glCode,
        openingBalance: account.openingBalance,
      })
      return
    }

    form.reset(emptyValues)
  }, [open, isEdit, account, form])

  function handleSubmit(values: BankAccountFormValues) {
    onSubmit(values)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FormDialogContent size="md">
        <FormDialogHeader>
          <FormDialogTitle>
            {isEdit ? "Edit Bank Account" : "Create Bank Account"}
          </FormDialogTitle>
          <FormDialogDescription>
            {isEdit
              ? "Update this bank account's details."
              : "Add a new bank account to track deposits and payments."}
          </FormDialogDescription>
        </FormDialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <FormDialogBody className="grid min-h-0 flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>
                      Bank Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Nabil Bank"
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
                name="accountName"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>
                      Account Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Omniverse Trading Pvt. Ltd."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Account Number{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. 0123456789012"
                        className="font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="branchName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Durbar Marg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Type</FormLabel>
                    <FormControl>
                      <NativeSelect {...field}>
                        {BANK_ACCOUNT_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {bankAccountTypeLabels[type]}
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
                name="glCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Linked Ledger Account</FormLabel>
                    <FormControl>
                      <NativeSelect {...field}>
                        {bankGlOptions.map((option) => (
                          <option key={option.code} value={option.code}>
                            {option.name}
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
