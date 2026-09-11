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
import {
  BARCODE_FORMATS,
  barcodeFormatLabels,
  COSTING_METHODS,
  costingMethodLabels,
  type ProductConfiguration,
} from "@/types/product-configuration"

const productConfigurationFormSchema = z.object({
  defaultUnit: z
    .string()
    .trim()
    .min(1, { message: "Default unit is required" })
    .max(30, { message: "Default unit is too long" }),
  costingMethod: z.enum(COSTING_METHODS),
  autoGenerateSku: z.boolean(),
  skuPrefix: z.string().trim().max(15, { message: "SKU prefix is too long" }),
  lowStockThreshold: z.coerce
    .number({ message: "Enter a low-stock threshold" })
    .int({ message: "Threshold must be a whole number" })
    .min(0, { message: "Threshold cannot be negative" }),
  barcodeFormat: z.enum(BARCODE_FORMATS),
})

type ProductConfigurationFormInput = z.input<
  typeof productConfigurationFormSchema
>
export type ProductConfigurationFormValues = z.output<
  typeof productConfigurationFormSchema
>

type ProductConfigurationFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  configuration: ProductConfiguration
  onSubmit: (values: ProductConfigurationFormValues) => void
}

export function ProductConfigurationFormDialog({
  open,
  onOpenChange,
  configuration,
  onSubmit,
}: ProductConfigurationFormDialogProps) {
  const form = useForm<
    ProductConfigurationFormInput,
    unknown,
    ProductConfigurationFormValues
  >({
    resolver: zodResolver(productConfigurationFormSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: configuration,
  })

  React.useEffect(() => {
    if (!open) return
    form.reset(configuration)
  }, [open, configuration, form])

  function handleSubmit(values: ProductConfigurationFormValues) {
    onSubmit(values)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FormDialogContent size="md">
        <FormDialogHeader>
          <FormDialogTitle>Edit Product Configuration</FormDialogTitle>
          <FormDialogDescription>
            Defaults applied when creating new products across the catalog.
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
                  name="defaultUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Unit</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Pcs" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="costingMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Costing Method</FormLabel>
                      <FormControl>
                        <NativeSelect {...field}>
                          {COSTING_METHODS.map((method) => (
                            <option key={method} value={method}>
                              {costingMethodLabels[method]}
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
                name="autoGenerateSku"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        id="product-config-auto-sku"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel
                      htmlFor="product-config-auto-sku"
                      className="font-normal"
                    >
                      Auto-generate SKU for new products
                    </FormLabel>
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="skuPrefix"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU Prefix</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. PRD-" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lowStockThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Low Stock Threshold</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          value={field.value as number}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="barcodeFormat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Barcode Format</FormLabel>
                    <FormControl>
                      <NativeSelect {...field}>
                        {BARCODE_FORMATS.map((format) => (
                          <option key={format} value={format}>
                            {barcodeFormatLabels[format]}
                          </option>
                        ))}
                      </NativeSelect>
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
              <Button type="submit">Save changes</Button>
            </FormDialogFooter>
          </form>
        </Form>
      </FormDialogContent>
    </Dialog>
  )
}
