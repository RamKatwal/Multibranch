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
import { Textarea } from "@/components/ui/textarea"
import type { BankAccount } from "@/types/bank-account"
import {
  CHEQUE_DIRECTIONS,
  chequeDirectionLabels,
  type Cheque,
} from "@/types/cheque"

const chequeFormSchema = z.object({
  chequeNumber: z
    .string()
    .trim()
    .min(1, { message: "Cheque number is required" })
    .max(20, { message: "Cheque number is too long" }),
  direction: z.enum(CHEQUE_DIRECTIONS),
  bankAccountId: z.string().min(1, { message: "Bank account is required" }),
  partyName: z
    .string()
    .trim()
    .min(1, { message: "Party name is required" })
    .max(100, { message: "Party name is too long" }),
  amount: z.coerce
    .number()
    .positive({ message: "Amount must be greater than 0" }),
  chequeDate: z.string().min(1, { message: "Cheque date is required" }),
  remarks: z.string().trim().max(250, { message: "Remarks are too long" }),
})

type ChequeFormInput = z.input<typeof chequeFormSchema>
export type ChequeFormValues = z.output<typeof chequeFormSchema>

type ChequeFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  cheque?: Cheque | null
  bankAccounts: BankAccount[]
  onSubmit: (values: ChequeFormValues) => void
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

export function ChequeFormDialog({
  open,
  onOpenChange,
  mode,
  cheque,
  bankAccounts,
  onSubmit,
}: ChequeFormDialogProps) {
  const isEdit = mode === "edit"

  const emptyValues = React.useMemo<ChequeFormValues>(
    () => ({
      chequeNumber: "",
      direction: "issued",
      bankAccountId: bankAccounts[0]?.id ?? "",
      partyName: "",
      amount: 0,
      chequeDate: today(),
      remarks: "",
    }),
    [bankAccounts]
  )

  const form = useForm<ChequeFormInput, unknown, ChequeFormValues>({
    resolver: zodResolver(chequeFormSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: emptyValues,
  })

  React.useEffect(() => {
    if (!open) return

    if (isEdit && cheque) {
      form.reset({
        chequeNumber: cheque.chequeNumber,
        direction: cheque.direction,
        bankAccountId: cheque.bankAccountId,
        partyName: cheque.partyName,
        amount: cheque.amount,
        chequeDate: cheque.chequeDate,
        remarks: cheque.remarks ?? "",
      })
      return
    }

    form.reset(emptyValues)
  }, [open, isEdit, cheque, form, emptyValues])

  function handleSubmit(values: ChequeFormValues) {
    onSubmit(values)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FormDialogContent size="md">
        <FormDialogHeader>
          <FormDialogTitle>
            {isEdit ? "Edit Cheque" : "Record Cheque"}
          </FormDialogTitle>
          <FormDialogDescription>
            {isEdit
              ? "Update this cheque's details."
              : "Track a cheque issued to a supplier or received from a customer."}
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
                name="chequeNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Cheque Number{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. 0234567"
                        className="font-mono text-sm"
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
                name="direction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Direction</FormLabel>
                    <FormControl>
                      <NativeSelect {...field}>
                        {CHEQUE_DIRECTIONS.map((direction) => (
                          <option key={direction} value={direction}>
                            {chequeDirectionLabels[direction]}
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
                name="partyName"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>
                      Party Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Nepal Trading Co."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bankAccountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Account</FormLabel>
                    <FormControl>
                      <NativeSelect {...field}>
                        {bankAccounts.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.bankName} — {account.accountNumber.slice(-4)}
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
                name="chequeDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Cheque Date <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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

              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Remarks</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Optional note about this cheque"
                        rows={2}
                        {...field}
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
