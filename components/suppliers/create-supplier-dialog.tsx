"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
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
  FormDialogFooter,
  FormDialogHeader,
  FormDialogTitle,
} from "@/components/ui/form-dialog"
import { Input } from "@/components/ui/input"
import { supplierCategories } from "@/lib/mock/suppliers"
import {
  SUPPLIER_TYPES,
  type Supplier,
  type SupplierType,
} from "@/types/supplier"

const createSupplierSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Supplier name is required" })
    .max(100, { message: "Name is too long" }),
  type: z.enum(SUPPLIER_TYPES),
  panNumber: z
    .string()
    .trim()
    .max(20, { message: "PAN number is too long" })
    .optional(),
  category: z.string().min(1, { message: "Category is required" }),
  address: z.string().trim().max(250, { message: "Address is too long" }),
  email: z
    .string()
    .trim()
    .email({ message: "Invalid email address" })
    .or(z.literal("")),
  contact: z.string().trim().max(30, { message: "Contact is too long" }),
})

type CreateSupplierFormInput = z.infer<typeof createSupplierSchema>

type CreateSupplierDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentBranchId?: string
  onCreateSupplier: (supplier: Supplier) => void
}

export function CreateSupplierDialog({
  open,
  onOpenChange,
  currentBranchId = "br_ht_01",
  onCreateSupplier,
}: CreateSupplierDialogProps) {
  const form = useForm<CreateSupplierFormInput>({
    resolver: zodResolver(createSupplierSchema),
    defaultValues: {
      name: "",
      type: "company",
      panNumber: "",
      category: "Raw Materials",
      address: "",
      email: "",
      contact: "",
    },
  })

  React.useEffect(() => {
    if (open) {
      form.reset({
        name: "",
        type: "company",
        panNumber: "",
        category: "Raw Materials",
        address: "",
        email: "",
        contact: "",
      })
    }
  }, [open, form])

  function handleSubmit(values: CreateSupplierFormInput) {
    const newId = `SUP${Date.now().toString().slice(-4)}`
    const newSupplier: Supplier = {
      id: newId,
      name: values.name.trim(),
      type: values.type,
      panNumber: values.panNumber?.trim() || undefined,
      category: values.category,
      address: values.address.trim(),
      email: values.email.trim(),
      contact: values.contact.trim(),
      entryBy: "admin",
      status: "active",
      createdBranchId: currentBranchId,
      addedBranchIds: [currentBranchId],
    }

    onCreateSupplier(newSupplier)
    toast.success(`Supplier "${newSupplier.name}" created successfully!`)
    onOpenChange(false)
  }

  const filteredCategories = supplierCategories.filter((c) => c !== "All")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FormDialogContent size="md">
        <FormDialogHeader>
          <FormDialogTitle>Add New</FormDialogTitle>
        </FormDialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <FormDialogBody className="grid min-h-0 flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>
                      Supplier Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Nepal Trading Co."
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
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <select
                        value={field.value}
                        onChange={(e) =>
                          field.onChange(e.target.value as SupplierType)
                        }
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-1"
                      >
                        <option value="company">Company</option>
                        <option value="individual">Individual</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="panNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PAN Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. 601234567"
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
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <select
                        value={field.value}
                        onChange={field.onChange}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-1"
                      >
                        {filteredCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 9801234567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="e.g. contact@supplier.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Kathmandu, Nepal" {...field} />
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
                color="neutral"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Supplier</Button>
            </FormDialogFooter>
          </form>
        </Form>
      </FormDialogContent>
    </Dialog>
  )
}
