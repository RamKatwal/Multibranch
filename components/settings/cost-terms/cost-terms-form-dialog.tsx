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
import type { CostTerm } from "@/types/cost-term"

const costTermFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Term name is required" })
    .max(60, { message: "Term name is too long" }),
  description: z.string().trim().max(250, { message: "Description is too long" }),
})

export type CostTermFormValues = z.infer<typeof costTermFormSchema>

type CostTermFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  term?: CostTerm | null
  onSubmit: (values: CostTermFormValues) => void
}

const emptyValues: CostTermFormValues = {
  name: "",
  description: "",
}

export function CostTermFormDialog({
  open,
  onOpenChange,
  mode,
  term,
  onSubmit,
}: CostTermFormDialogProps) {
  const isEdit = mode === "edit"

  const form = useForm<CostTermFormValues>({
    resolver: zodResolver(costTermFormSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: emptyValues,
  })

  React.useEffect(() => {
    if (!open) return

    if (isEdit && term) {
      form.reset({
        name: term.name,
        description: term.description,
      })
      return
    }

    form.reset(emptyValues)
  }, [open, isEdit, term, form])

  function handleSubmit(values: CostTermFormValues) {
    onSubmit(values)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FormDialogContent size="md">
        <FormDialogHeader>
          <FormDialogTitle>
            {isEdit ? "Edit Cost Term" : "Add Cost Term"}
          </FormDialogTitle>
          <FormDialogDescription>
            Cost terms label how landed and delivery costs are calculated.
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
                      <Input placeholder="e.g. FOB (Free on Board)" {...field} />
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
                {isEdit ? "Save changes" : "Add Cost Term"}
              </Button>
            </FormDialogFooter>
          </form>
        </Form>
      </FormDialogContent>
    </Dialog>
  )
}
