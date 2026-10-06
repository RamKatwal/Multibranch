"use client"

import * as React from "react"

import {
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

// Local composite on top of Radian's Dialog (not a Radian registry item). Radian's
// DialogHeader / DialogBody / DialogFooter bring the padding and dividers; this adds the
// width presets and a scrolling body for long forms.

const formDialogSizes = {
  sm: "sm:max-w-md",
  md: "sm:max-w-lg",
  lg: "sm:max-w-xl",
  xl: "sm:max-w-2xl",
  "2xl": "sm:max-w-3xl",
  "4xl": "sm:max-w-5xl",
  "5xl": "sm:max-w-6xl",
} as const

type FormDialogSize = keyof typeof formDialogSizes

function FormDialogContent({
  className,
  size = "md",
  ...props
}: React.ComponentProps<typeof DialogContent> & {
  size?: FormDialogSize
}) {
  return (
    <DialogContent
      className={cn(
        "max-h-[min(720px,calc(100svh-2rem))] overflow-hidden",
        formDialogSizes[size],
        className
      )}
      {...props}
    />
  )
}

function FormDialogHeader({
  className,
  ...props
}: React.ComponentProps<typeof DialogHeader>) {
  return <DialogHeader className={cn("shrink-0", className)} {...props} />
}

function FormDialogTitle(props: React.ComponentProps<typeof DialogTitle>) {
  return <DialogTitle {...props} />
}

function FormDialogDescription(
  props: React.ComponentProps<typeof DialogDescription>
) {
  return <DialogDescription {...props} />
}

function FormDialogBody({
  className,
  ...props
}: React.ComponentProps<typeof DialogBody>) {
  return (
    <DialogBody
      className={cn(
        "thin-scrollbar flex min-h-0 flex-col gap-4 overflow-y-auto",
        className
      )}
      {...props}
    />
  )
}

function FormDialogFooter({
  className,
  ...props
}: React.ComponentProps<typeof DialogFooter>) {
  return <DialogFooter className={cn("shrink-0", className)} {...props} />
}

export {
  FormDialogBody,
  FormDialogContent,
  FormDialogDescription,
  FormDialogFooter,
  FormDialogHeader,
  FormDialogTitle,
}
