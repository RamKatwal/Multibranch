"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { EyeIcon, ViewOffSlashIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
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
import { DEMO_SIGNUP } from "@/lib/demo/signup"
import { skipToPayment } from "@/lib/demo/skip-to-payment"
import { cn } from "@/lib/utils"

const FormSchema = z
  .object({
    fullName: z.string().min(1, { message: "Full name is required" }),
    contact: z
      .string()
      .min(1, { message: "Contact is required" })
      .min(7, { message: "Please enter a valid contact number" }),
    email: z
      .string()
      .min(1, { message: "Email is required" })
      .email({ message: "Please enter a valid email address" }),
    username: z
      .string()
      .min(1, { message: "Username is required" })
      .min(3, { message: "Username must be at least 3 characters" }),
    password: z
      .string()
      .min(1, { message: "Password is required" })
      .min(8, { message: "Password must be at least 8 characters long" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })


export default function SignupForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      fullName: "",
      contact: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  })

  function toggleVisibility(
    setter: React.Dispatch<React.SetStateAction<boolean>>
  ) {
    return (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setter((prev) => !prev)
    }
  }

  function fillDemoSignup() {
    form.reset({ ...DEMO_SIGNUP })
  }

  async function handleSkipToPayment() {
    if (isLoading) return
    form.reset({ ...DEMO_SIGNUP })
    setIsLoading(true)
    try {
      router.push(await skipToPayment())
    } catch {
      toast.error("Could not skip to payment")
      setIsLoading(false)
    }
  }

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      router.push(
        `/verification?email=${encodeURIComponent(data.email.trim())}`
      )
    }, 600)
  }

  return (
    <div className="flex w-full max-w-xl flex-col gap-8 bg-background">
      <div className="flex flex-col gap-6">
        <AppBrand href="/signup" size={32} priority />
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Sign Up</h1>
          <p className="text-sm text-muted-foreground">
            Start your free, 14 days trial
          </p>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel htmlFor="fullName">Full Name</FormLabel>
                  <FormControl>
                    <Input
                      id="fullName"
                      placeholder="Enter full name"
                      autoComplete="name"
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
                <FormItem className="min-w-0">
                  <FormLabel htmlFor="contact">Contact</FormLabel>
                  <FormControl>
                    <Input
                      id="contact"
                      type="tel"
                      placeholder="+977-9877777777"
                      autoComplete="tel"
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
                <FormItem className="min-w-0">
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <FormControl>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      autoComplete="email"
                      {...field}
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
                <FormItem className="min-w-0">
                  <FormLabel htmlFor="username">Username</FormLabel>
                  <FormControl>
                    <Input
                      id="username"
                      placeholder="Enter username"
                      autoComplete="username"
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
                <FormItem className="min-w-0">
                  <FormLabel htmlFor="signup-password">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create password"
                        autoComplete="new-password"
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
                        onMouseDown={toggleVisibility(setShowPassword)}
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
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel htmlFor="confirm-password">
                    Confirm Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm Password"
                        autoComplete="new-password"
                        className="peer pr-9"
                      />
                      <button
                        type="button"
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        className={cn(
                          "absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground",
                          "cursor-pointer hover:text-foreground",
                          "peer-disabled:pointer-events-none peer-disabled:opacity-50"
                        )}
                        onMouseDown={toggleVisibility(setShowConfirmPassword)}
                      >
                        <HugeiconsIcon
                          icon={
                            showConfirmPassword ? EyeIcon : ViewOffSlashIcon
                          }
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

          <Button className="h-10 w-full" type="submit" disabled={isLoading}>
            {isLoading ? (
              <Spinner size={18} variant="default" />
            ) : (
              "Create Account"
            )}
          </Button>

          <p className="text-[13px] leading-relaxed text-muted-foreground">
            By clicking &apos;Create Account&apos;, I agree to Omniverse&apos;s{" "}
            <Link
              href="#"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Terms &amp; Conditions
            </Link>{" "}
            and acknowledge its{" "}
            <Link
              href="#"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </p>

          <p className="text-sm text-muted-foreground">
            Have an account?{" "}
            <Link
              href="/signin"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Login
            </Link>
          </p>
        </form>
      </Form>

      <DemoFillFab
        actions={[
          { label: "Fill demo account", onFill: fillDemoSignup, shortcutKey: "d" },
          {
            label: "Skip to payment",
            onFill: () => void handleSkipToPayment(),
            shortcutKey: "g",
          },
        ]}
      />
    </div>
  )
}
