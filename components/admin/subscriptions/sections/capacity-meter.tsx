"use client"

import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type CapacityMeterProps = {
  label: string
  used: number
  limit: number
  usageLabel: string
  remainingLabel: string
  action?: ReactNode
  className?: string
}

export function CapacityMeter({
  label,
  used,
  limit,
  usageLabel,
  remainingLabel,
  action,
  className,
}: CapacityMeterProps) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0
  const remaining = Math.max(0, limit - used)

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-xs",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-fg-secondary">{label}</p>
          <p className="mt-1 text-sm font-semibold tabular-nums">
            {used} / {limit} {usageLabel}
          </p>
        </div>
        <span className="text-xs tabular-nums text-fg-secondary">
          {pct}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-fill2">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-auto flex items-center justify-between gap-3">
        <p className="text-xs text-fg-secondary">
          {remaining} {remainingLabel}
        </p>
        {action}
      </div>
    </div>
  )
}
