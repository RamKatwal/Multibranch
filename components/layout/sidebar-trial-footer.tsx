"use client"

import Link from "next/link"
import { Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const FREE_TRIAL_TOTAL_DAYS = 30

type SidebarTrialFooterProps = {
  daysRemaining?: number
  totalDays?: number
  href?: string
  className?: string
}

function TrialProgressRing({
  daysRemaining,
  totalDays,
}: {
  daysRemaining: number
  totalDays: number
}) {
  const size = 36
  const strokeWidth = 3.5
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const elapsed = Math.min(Math.max(totalDays - daysRemaining, 0), totalDays)
  const progress = totalDays > 0 ? elapsed / totalDays : 0
  const dashOffset = circumference * (1 - progress)

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-90 shrink-0"
      aria-hidden
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-trial-accent/15"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        className="text-trial-accent transition-[stroke-dashoffset] duration-500"
      />
    </svg>
  )
}

export function SidebarTrialFooter({
  daysRemaining = 3,
  totalDays = FREE_TRIAL_TOTAL_DAYS,
  href = "/settings/billing-plans",
  className,
}: SidebarTrialFooterProps) {
  const remaining = Math.max(0, Math.min(daysRemaining, totalDays))
  const dayLabel = remaining === 1 ? "day" : "days"

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-trial-accent/20 bg-trial-surface p-3 group-data-[collapsible=icon]:hidden",
        className
      )}
      style={{
        backgroundImage:
          "radial-gradient(120% 100% at 0% 0%, var(--trial-glow) 0%, var(--trial-surface) 62%)",
      }}
    >
      <div className="flex items-center gap-2.5">
        <TrialProgressRing
          daysRemaining={remaining}
          totalDays={totalDays}
        />
        <div className="min-w-0 leading-tight">
          <p className="truncate text-xs text-muted-foreground">
            Free Trial Ends in
          </p>
          <p className="truncate text-sm font-semibold text-foreground">
            {remaining} {dayLabel}
          </p>
        </div>
      </div>

      <Button
        size="sm"
        className="w-full"
        nativeButton={false}
        render={<Link href={href} />}
      >
        <Zap />
        Select a Plan
      </Button>
    </div>
  )
}
