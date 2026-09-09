"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { EyeIcon, ViewOffSlashIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { AppBrand } from "@/components/app-brand"
import { DemoFillFab } from "@/components/demo-fill-fab"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import {
  DEMO_ADMIN,
  DEMO_USER,
  isDemoAdminCredentials,
  isDemoUserCredentials,
  isSixDigitTenantId,
} from "@/lib/demo/auth"
import {
  apiJson,
  restoreOnboardingSessionFromClient,
  saveAuthSessionClient,
  saveOnboardingSessionClient,
} from "@/lib/onboarding/client-session"
import type {
  AuthSessionData,
  OnboardingSessionData,
} from "@/lib/onboarding/session-types"
import { resumePathForStatus } from "@/lib/onboarding/status"
import { cn } from "@/lib/utils"

const FormSchema = z.object({
  tenantId: z
    .string()
    .trim()
    .min(1, { message: "Tenant ID is required" })
    .refine(isSixDigitTenantId, {
      message: "Tenant ID must be 6 digits",
    }),
  username: z.string().trim().min(1, { message: "Username is required" }),
  password: z
    .string()
    .trim()
    .min(1, { message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" }),
})

export default function SignInForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      tenantId: "",
      username: "",
      password: "",
    },
  })

  function togglePasswordVisibility(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setShowPassword((prev) => !prev)
  }

  function fillDemoAdmin() {
    form.setValue("tenantId", DEMO_ADMIN.tenantId, { shouldValidate: true })
    form.setValue("username", DEMO_ADMIN.email, { shouldValidate: true })
    form.setValue("password", DEMO_ADMIN.password, { shouldValidate: true })
    form.clearErrors()
  }

  function fillDemoUser() {
    form.setValue("tenantId", DEMO_USER.tenantId, { shouldValidate: true })
    form.setValue("username", DEMO_USER.email, { shouldValidate: true })
    form.setValue("password", DEMO_USER.password, { shouldValidate: true })
    form.clearErrors()
  }

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    const username = data.username.trim().toLowerCase()
    const tenantId = data.tenantId.trim()
    const isAdmin = isDemoAdminCredentials(
      tenantId,
      data.username,
      data.password
    )
    const isUser = isDemoUserCredentials(
      tenantId,
      data.username,
      data.password
    )
    setIsLoading(true)

    try {
      if (isAdmin) {
        const res = await apiJson<{
          auth: AuthSessionData
          session: OnboardingSessionData
        }>("/api/auth/session", {
          method: "POST",
          body: JSON.stringify({
            email: DEMO_ADMIN.email,
            name: DEMO_ADMIN.name,
            completeOnboarding: true,
          }),
        })
        saveAuthSessionClient(res.auth)
        saveOnboardingSessionClient(res.session)
        router.push("/")
        return
      }

      if (isUser) {
        const res = await apiJson<{
          auth: AuthSessionData
          session: OnboardingSessionData
        }>("/api/auth/session", {
          method: "POST",
          body: JSON.stringify({
            email: DEMO_USER.email,
            name: DEMO_USER.name,
            completeOnboarding: true,
          }),
        })
        saveAuthSessionClient(res.auth)
        saveOnboardingSessionClient(res.session)
        router.push("/branch-selector")
        return
      }

      // Prefer durable local mirror if cookie was cleared
      await restoreOnboardingSessionFromClient()

      const statusRes = await apiJson<{
        session: OnboardingSessionData | null
      }>("/api/onboarding/status")

      const existing = statusRes.session
      if (existing && existing.email === username) {
        const res = await apiJson<{
          auth: AuthSessionData
          session: OnboardingSessionData
        }>("/api/auth/session", {
          method: "POST",
          body: JSON.stringify({ email: username }),
        })
        saveAuthSessionClient(res.auth)
        saveOnboardingSessionClient(res.session)
        router.push(
          resumePathForStatus(res.session.status, res.session.email)
        )
        return
      }

      form.setError("password", {
        message: "Invalid tenant ID, username, or password.",
      })
    } catch {
      form.setError("password", {
        message: "Unable to sign in. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-8">
      <div className="flex flex-col gap-6">
        <AppBrand href="/signin" size={32} priority />
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Sign In</h1>
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="tenantId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tenant ID</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          autoComplete="organization"
                          placeholder="6-digit tenant ID"
                          {...field}
                          onChange={(event) => {
                            const next = event.target.value
                              .replace(/\D/g, "")
                              .slice(0, 6)
                            field.onChange(next)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          autoComplete="username"
                          placeholder="Enter username"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            className="peer pr-9"
                          />
                          <button
                            type="button"
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                            className={cn(
                              "absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground",
                              "cursor-pointer hover:text-foreground",
                              "peer-disabled:pointer-events-none peer-disabled:opacity-50"
                            )}
                            onMouseDown={togglePasswordVisibility}
                          >
                            <HugeiconsIcon
                              icon={showPassword ? EyeIcon : ViewOffSlashIcon}
                              className="size-4"
                            />
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? <Spinner size={18} variant="default" /> : "Sign In"}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <DemoFillFab
        actions={[
          {
            label: "Fill demo login",
            onFill: fillDemoAdmin,
            shortcutKey: "d",
          },
          {
            label: "Fill user login",
            onFill: fillDemoUser,
            shortcutKey: "u",
          },
        ]}
      />
    </div>
  )
}
