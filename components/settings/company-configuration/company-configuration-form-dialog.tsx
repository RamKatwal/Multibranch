"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog } from "@/components/ui/dialog"
import {
  FormDialogBody,
  FormDialogContent,
  FormDialogDescription,
  FormDialogFooter,
  FormDialogHeader,
  FormDialogTitle,
} from "@/components/ui/form-dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { NativeSelect } from "@/components/ui/native-select"
import {
  COMPANY_INDUSTRY_OPTIONS,
  companyConfigurationSchema,
  type CompanyConfigurationFormValues,
} from "@/lib/companies/schema"
import type { CompanyProfile } from "@/types/company"

function RequiredMark() {
  return <span className="text-destructive"> *</span>
}

function profileToFormValues(profile: CompanyProfile): CompanyConfigurationFormValues {
  return {
    companyName: profile.companyName,
    email: profile.email,
    contact: profile.contact,
    pan: profile.pan,
    registeredWithVat: profile.registeredWithVat,
    industryType: profile.industryType,
    province: profile.province,
    district: profile.district,
    fullAddress: profile.fullAddress,
    companyWebsite: profile.companyWebsite ?? "",
    employeeNumber: profile.employeeNumber ?? "",
  }
}

type CompanyConfigurationFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile: CompanyProfile
  onSubmit: (values: CompanyConfigurationFormValues) => void
}

export function CompanyConfigurationFormDialog({
  open,
  onOpenChange,
  profile,
  onSubmit,
}: CompanyConfigurationFormDialogProps) {
  const form = useForm<CompanyConfigurationFormValues>({
    resolver: zodResolver(companyConfigurationSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: profileToFormValues(profile),
  })

  React.useEffect(() => {
    if (open) {
      form.reset(profileToFormValues(profile))
    }
  }, [open, profile, form])

  function handleSubmit(values: CompanyConfigurationFormValues) {
    onSubmit(values)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FormDialogContent size="xl">
        <FormDialogHeader>
          <FormDialogTitle>Edit company information</FormDialogTitle>
          <FormDialogDescription>
            Update your company profile details. These match the information
            collected during onboarding.
          </FormDialogDescription>
        </FormDialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <FormDialogBody className="grid sm:grid-cols-2">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Company Name
                      <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter company name" {...field} />
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
                    <FormLabel>
                      Email
                      <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter email" {...field} />
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
                    <FormLabel>
                      Contact
                      <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter contact" {...field} />
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
                    <FormLabel>
                      PAN
                      <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter PAN number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="registeredWithVat"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2 space-y-0 sm:col-span-2">
                    <FormControl>
                      <Checkbox
                        id="company-config-vat"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel
                      htmlFor="company-config-vat"
                      className="font-normal text-foreground"
                    >
                      Registered with VAT
                    </FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="industryType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry Type</FormLabel>
                    <FormControl>
                      <NativeSelect
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      >
                        {COMPANY_INDUSTRY_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
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
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Province
                      <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter province" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      District
                      <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter district" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fullAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Full Address
                      <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="companyWebsite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Website</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter company site" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="employeeNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter employee number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormDialogBody>

            <FormDialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                color="neutral"
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
