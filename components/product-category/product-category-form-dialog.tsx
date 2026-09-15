"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import type { ProductCategory } from "@/types/product-category"

const productCategoryFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, { message: "Category name is required" })
      .max(80, { message: "Category name is too long" }),
    isSubCategory: z.boolean(),
    parentId: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.isSubCategory && !values.parentId) {
      ctx.addIssue({
        code: "custom",
        path: ["parentId"],
        message: "Parent category is required",
      })
    }
  })

type ProductCategoryFormInput = z.input<typeof productCategoryFormSchema>
export type ProductCategoryFormValues = z.output<typeof productCategoryFormSchema>

type ProductCategoryFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  category?: ProductCategory | null
  parentOptions: ProductCategory[]
  onSubmit: (values: ProductCategoryFormValues) => void
}

const emptyValues: ProductCategoryFormValues = {
  name: "",
  isSubCategory: false,
  parentId: "",
}

export function ProductCategoryFormDialog({
  open,
  onOpenChange,
  mode,
  category,
  parentOptions,
  onSubmit,
}: ProductCategoryFormDialogProps) {
  const isEdit = mode === "edit"

  const form = useForm<
    ProductCategoryFormInput,
    unknown,
    ProductCategoryFormValues
  >({
    resolver: zodResolver(productCategoryFormSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: emptyValues,
  })

  const isSubCategory = form.watch("isSubCategory")

  React.useEffect(() => {
    if (!open) return

    if (isEdit && category) {
      form.reset({
        name: category.name,
        isSubCategory: category.isSubCategory,
        parentId: category.parentId ?? "",
      })
      return
    }

    form.reset(emptyValues)
  }, [open, isEdit, category, form])

  function handleSubmit(values: ProductCategoryFormValues) {
    onSubmit({
      ...values,
      parentId: values.isSubCategory ? values.parentId : "",
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FormDialogContent size="md">
        <FormDialogHeader>
          <FormDialogTitle>
            {isEdit ? "Edit Category" : "Create Category"}
          </FormDialogTitle>
          <FormDialogDescription>
            Organize products into categories and optional sub-categories.
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
                    <FormLabel>
                      {isSubCategory ? "Sub Category Name" : "Category Name"}{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Category Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isSubCategory"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        id="category-is-sub"
                        checked={field.value}
                        disabled={isEdit}
                        onCheckedChange={(checked) => {
                          field.onChange(checked === true)
                          if (!checked) {
                            form.setValue("parentId", "")
                          }
                        }}
                      />
                    </FormControl>
                    <FormLabel
                      htmlFor="category-is-sub"
                      className="font-normal"
                    >
                      This category is a sub-category
                    </FormLabel>
                  </FormItem>
                )}
              />

              {isSubCategory || (isEdit && category?.isSubCategory) ? (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Note: After saving, the subcategory setting can&apos;t be
                  changed on edit!
                </p>
              ) : null}

              {isSubCategory ? (
                <FormField
                  control={form.control}
                  name="parentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Choose Parent Category{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <NativeSelect {...field} value={field.value ?? ""}>
                          <option value="">Category</option>
                          {parentOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.name}
                            </option>
                          ))}
                        </NativeSelect>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}
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
