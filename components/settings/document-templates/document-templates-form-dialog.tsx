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
import type { DocumentTemplate } from "@/types/document-template"
import { DOCUMENT_TYPES, documentTypeLabels } from "@/types/document-type"

const documentTemplateFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Template name is required" })
    .max(80, { message: "Template name is too long" }),
  documentType: z.enum(DOCUMENT_TYPES),
  content: z
    .string()
    .trim()
    .min(1, { message: "Template content is required" })
    .max(4000, { message: "Template content is too long" }),
})

export type DocumentTemplateFormValues = z.infer<
  typeof documentTemplateFormSchema
>

type DocumentTemplateFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  template?: DocumentTemplate | null
  onSubmit: (values: DocumentTemplateFormValues) => void
}

const emptyValues: DocumentTemplateFormValues = {
  name: "",
  documentType: "sales_invoice",
  content: "",
}

export function DocumentTemplateFormDialog({
  open,
  onOpenChange,
  mode,
  template,
  onSubmit,
}: DocumentTemplateFormDialogProps) {
  const isEdit = mode === "edit"

  const form = useForm<DocumentTemplateFormValues>({
    resolver: zodResolver(documentTemplateFormSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: emptyValues,
  })

  React.useEffect(() => {
    if (!open) return

    if (isEdit && template) {
      form.reset({
        name: template.name,
        documentType: template.documentType,
        content: template.content,
      })
      return
    }

    form.reset(emptyValues)
  }, [open, isEdit, template, form])

  function handleSubmit(values: DocumentTemplateFormValues) {
    onSubmit(values)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FormDialogContent size="lg">
        <FormDialogHeader>
          <FormDialogTitle>
            {isEdit ? "Edit Document Template" : "Add Document Template"}
          </FormDialogTitle>
          <FormDialogDescription>
            Templates control how a document is laid out when printed or
            exported to PDF.
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
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Standard Sales Invoice" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="documentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document Type</FormLabel>
                      <FormControl>
                        <NativeSelect {...field}>
                          {DOCUMENT_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {documentTypeLabels[type]}
                            </option>
                          ))}
                        </NativeSelect>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Use placeholders like {{company.name}} and {{lineItems}}"
                        className="min-h-40 font-mono text-xs"
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
              <Button type="submit">
                {isEdit ? "Save changes" : "Add Template"}
              </Button>
            </FormDialogFooter>
          </form>
        </Form>
      </FormDialogContent>
    </Dialog>
  )
}
