"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { DemoFillFab } from "@/components/demo-fill-fab"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { DEMO_COMPANY } from "@/lib/demo/company"
import {
  apiJson,
  restoreOnboardingSessionFromClient,
  saveOnboardingSessionClient,
} from "@/lib/onboarding/client-session"
import {
  loadCompanyDraft,
  saveCompanyDraft,
} from "@/lib/onboarding/company-storage"
import type { OnboardingSessionData } from "@/lib/onboarding/session-types"
const INDUSTRY_OPTIONS = [
  "Automobiles",
  "Retail",
  "Wholesale",
  "Manufacturing",
  "Services",
  "Hospitality",
  "Healthcare",
  "Education",
  "Technology",
  "Other",
] as const

const FormSchema = z.object({
  companyName: z.string().min(1, { message: "Company name is required" }),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
  contact: z
    .string()
    .min(1, { message: "Contact is required" })
    .min(7, { message: "Please enter a valid contact number" }),
  pan: z.string().min(1, { message: "PAN is required" }),
  registeredWithVat: z.boolean(),
  industryType: z.string().min(1, { message: "Industry type is required" }),
  province: z.string().min(1, { message: "Province is required" }),
  district: z.string().min(1, { message: "District is required" }),
  fullAddress: z.string().min(1, { message: "Full address is required" }),
  companyWebsite: z.string().optional(),
  employeeNumber: z.string().optional(),
})


function RequiredMark() {
  return <span className="text-destructive"> *</span>
}

export default function CompanyDetailsForm() {
  const router = useRouter()

  const [isLoading, setIsLoading] = React.useState(false)
  const [hydrated, setHydrated] = React.useState(false)

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      companyName: "",
      email: "",
      contact: "",
      pan: "",
      registeredWithVat: false,
      industryType: "",
      province: "",
      district: "",
      fullAddress: "",
      companyWebsite: "",
      employeeNumber: "",
    },
  })

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      const localDraft = loadCompanyDraft()
      try {
        const session = await restoreOnboardingSessionFromClient()
        if (cancelled) return
        const draft = session?.company ?? localDraft
        if (session) saveOnboardingSessionClient(session)
        if (draft) {
          form.reset({
            companyName: draft.companyName,
            email: draft.email,
            contact: draft.contact,
            pan: draft.pan,
            registeredWithVat: draft.registeredWithVat,
            industryType: draft.industryType || "",
            province: draft.province,
            district: draft.district,
            fullAddress: draft.fullAddress,
            companyWebsite: draft.companyWebsite ?? "",
            employeeNumber: draft.employeeNumber ?? "",
          })
        }
      } catch {
        if (cancelled) return
        if (localDraft) {
          form.reset({
            ...localDraft,
            companyWebsite: localDraft.companyWebsite ?? "",
            employeeNumber: localDraft.employeeNumber ?? "",
            email: localDraft.email,
          })
        }
      } finally {
        if (!cancelled) setHydrated(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [form])

  function fillDemoCompany() {
    form.reset({
      ...DEMO_COMPANY,
      email: DEMO_COMPANY.email,
    })
  }

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setIsLoading(true)
    const draft = {
      companyName: data.companyName,
      email: data.email,
      contact: data.contact,
      pan: data.pan,
      registeredWithVat: data.registeredWithVat,
      industryType: data.industryType,
      province: data.province,
      district: data.district,
      fullAddress: data.fullAddress,
      companyWebsite: data.companyWebsite,
      employeeNumber: data.employeeNumber,
    }
    saveCompanyDraft(draft)

    const emailQuery = data.email.trim()
      ? `?email=${encodeURIComponent(data.email.trim())}`
      : ""

    try {
      const res = await apiJson<{ session: OnboardingSessionData }>(
        "/api/onboarding/company",
        {
          method: "POST",
          body: JSON.stringify({ company: draft, finalize: true }),
        }
      )
      saveOnboardingSessionClient(res.session)
      router.push(`/onboarding/plan${emailQuery}`)
    } catch (e) {
      form.setError("companyName", {
        message:
          e instanceof Error ? e.message : "Could not save company. Try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size={24} variant="default" />
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Add company information
        </h1>
        <p className="text-sm text-muted-foreground">
          Tell us about your business so we can set up your workspace. Next
          you&apos;ll add branches.
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6 rounded-lg bg-card p-5 text-card-foreground ring-1 ring-foreground/10 md:p-6"
        >
          <div className="grid gap-4 sm:grid-cols-2">
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
                    <Input
                      placeholder="Enter company name"
                      {...field}
                    />
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
                    <Input
                      type="email"
                      placeholder="Enter email"
                      {...field}
                    />
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
                    <Input
                      placeholder="Enter contact"
                      {...field}
                    />
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
                    <Input
                      placeholder="Enter PAN number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="registeredWithVat"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox
                    size="sm"
                    id="registered-with-vat"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel
                  htmlFor="registered-with-vat"
                  className="font-normal text-foreground"
                >
                  Registered with VAT
                </FormLabel>
              </FormItem>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="industryType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry Type</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    name={field.name}
                  >
                    <FormControl>
                      <SelectTrigger onBlur={field.onBlur} ref={field.ref}>
                        <SelectValue placeholder="Select industry type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {INDUSTRY_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    <Input
                      placeholder="Enter province"
                      {...field}
                    />
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
                    <Input
                      placeholder="Enter district"
                      {...field}
                    />
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
                    <Input
                      placeholder="Enter your address"
                      {...field}
                    />
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
                    <Input
                      placeholder="Enter company site"
                      {...field}
                    />
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
                    <Input
                      placeholder="Enter employee number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              className="h-10 min-w-44"
              disabled={isLoading}
            >
              {isLoading ? (
                <Spinner size={18} variant="default" />
              ) : (
                <>
                  Save &amp; Continue
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    className="size-4"
                    data-icon="inline-end"
                  />
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>

      <DemoFillFab label="Fill demo company" onFill={fillDemoCompany} />
    </div>
  )
}
