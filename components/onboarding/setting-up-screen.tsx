"use client"

import * as React from "react"

import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

const SETUP_MESSAGES = [
  "Creating your workspace…",
  "Saving company details…",
  "Configuring branches…",
  "Preparing your workspace…",
] as const

type SettingUpScreenProps = {
  open: boolean
  className?: string
}

export function SettingUpScreen({ open, className }: SettingUpScreenProps) {
  const [messageIndex, setMessageIndex] = React.useState(0)

  React.useEffect(() => {
    if (!open) {
      setMessageIndex(0)
      return
    }

    const id = window.setInterval(() => {
      setMessageIndex((current) =>
        current < SETUP_MESSAGES.length - 1 ? current + 1 : current
      )
    }, 700)

    return () => window.clearInterval(id)
  }, [open])

  if (!open) return null

  return (
    <div
      className={cn(
        "fixed inset-0 z-[60] flex flex-col items-center justify-center gap-5 bg-background px-6",
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Spinner size={32} variant="default" />
      <div className="flex max-w-sm flex-col items-center gap-2 text-center">
        <p className="text-lg font-semibold tracking-tight text-foreground">
          Setting things up
        </p>
        <p className="text-sm text-muted-foreground">
          {SETUP_MESSAGES[messageIndex]}
        </p>
      </div>
      <div className="mt-2 flex gap-1.5" aria-hidden>
        {SETUP_MESSAGES.map((_, index) => (
          <span
            key={index}
            className={cn(
              "size-1.5 rounded-full transition-colors",
              index <= messageIndex ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>
    </div>
  )
}
