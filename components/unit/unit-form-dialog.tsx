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
import type { UnitOfMeasure } from "@/types/unit"

const unitFormSchema = z.object({
  shortName: z
    .string()
    .trim()
    .min(1, { message: "Short name is required" })
    .max(12, { message: "Short name is too long" }),
  name: z
    .string()
    .trim()
    .min(1, { message: "Unit name is required" })
    .max(60, { message: "Unit name is too long" }),
})

type UnitFormInput = z.input<typeof unitFormSchema>
export type UnitFormValues = z.output<typeof unitFormSchema>

type UnitFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  unit?: UnitOfMeasure | null
  onSubmit: (values: UnitFormValues) => void
}

const emptyValues: UnitFormValues = {
  shortName: "",
  name: "",
}

export function UnitFormDialog({
  open,
  onOpenChange,
  mode,
  unit,
  onSubmit,
}: UnitFormDialogProps) {
  const isEdit = mode === "edit"

  const form = useForm<UnitFormInput, unknown, UnitFormValues>({
    resolver: zodResolver(unitFormSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: emptyValues,
  })

  React.useEffect(() => {
    if (!open) return

    if (isEdit && unit) {
      form.reset({
        shortName: unit.shortName,
        name: unit.name,
      })
      return
    }

    form.reset(emptyValues)
  }, [open, isEdit, unit, form])

  function handleSubmit(values: UnitFormValues) {
    onSubmit(values)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FormDialogContent size="md">
        <FormDialogHeader>
          <FormDialogTitle>
            {isEdit ? "Edit Unit" : "Create Unit"}
          </FormDialogTitle>
          <FormDialogDescription>
            Define a unit of measurement used across inventory and purchases.
          </FormDialogDescription>
        </FormDialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <FormDialogBody>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="shortName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Short Name <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Unit of Measurement (UOM)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Unit Name <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Unit of Measurement (UOM)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
