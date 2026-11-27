"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
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
  FormDialogDescription,
  FormDialogFooter,
  FormDialogHeader,
  FormDialogTitle,
} from "@/components/ui/form-dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs } from "@/components/ui/tabs"
import type { Company } from "@/lib/branches/company-branches"
import type { BillTo } from "@/lib/mock/account-billing"

const schema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("company"),
    companyId: z.string().min(1, "Select a company"),
  }),
  z.object({
    type: z.literal("individual"),
    name: z.string().trim().min(1, "Enter a name"),
    email: z.string().trim().email("Enter a valid email"),
    phone: z.string().trim().min(7, "Enter a phone number"),
    pan: z
      .string()
      .trim()
      .regex(/^(\d{9})?$/, "PAN is 9 digits")
      .optional(),
  }),
])

type Values = z.infer<typeof schema>

function defaultsFor(billTo: BillTo | null, companies: Company[]): Values {
  if (billTo?.type === "individual") {
    return { ...billTo, pan: billTo.pan ?? "" }
  }
  return {
    type: "company",
    companyId:
      billTo?.type === "company" ? billTo.companyId : (companies[0]?.id ?? ""),
  }
}

type BillingDetailsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  billTo: BillTo | null
  companies: Company[]
  onSave: (billTo: BillTo) => void
}

export function BillingDetailsDialog({
  open,
  onOpenChange,
  billTo,
  companies,
  onSave,
}: BillingDetailsDialogProps) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: defaultsFor(billTo, companies),
  })

  const [prevOpen, setPrevOpen] = React.useState(open)
  if (prevOpen !== open) {
    setPrevOpen(open)
    if (open) form.reset(defaultsFor(billTo, companies))
  }

  const type = useWatch({ control: form.control, name: "type" })

  function switchType(next: string) {
    if (next === type) return
    form.reset(
      next === "individual"
        ? { type: "individual", name: "", email: "", phone: "", pan: "" }
        : { type: "company", companyId: companies[0]?.id ?? "" }
    )
  }

  function handleSubmit(values: Values) {
    if (values.type === "company") {
      const company = companies.find((item) => item.id === values.companyId)
      if (!company) return
      onSave({ type: "company", companyId: company.id, companyName: company.name })
    } else {
      onSave({ ...values, pan: values.pan || undefined })
    }
    toast.success("Billing details saved")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FormDialogContent size="md">
        <FormDialogHeader>
          <FormDialogTitle>
            {billTo ? "Change billing details" : "Set billing details"}
          </FormDialogTitle>
          <FormDialogDescription>
            Invoices are issued to a company or to an individual.
          </FormDialogDescription>
        </FormDialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <FormDialogBody>
              <Tabs
                value={type}
                onValueChange={switchType}
                items={[
                  { value: "company", label: "Company" },
                  { value: "individual", label: "Individual" },
                ]}
              />

              {type === "company" ? (
                <FormField
                  control={form.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <Select
                        name={field.name}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger ref={field.ref} onBlur={field.onBlur}>
                            <SelectValue placeholder="Select a company" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companies.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full name</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input type="tel" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PAN (optional)</FormLabel>
                        <FormControl>
                          <Input inputMode="numeric" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
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
              <Button type="submit">Save</Button>
            </FormDialogFooter>
          </form>
        </Form>
      </FormDialogContent>
    </Dialog>
  )
}
