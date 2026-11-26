"use client"

import type { LucideIcon } from "lucide-react"
import {
  Building2Icon,
  GitBranchIcon,
  LayersIcon,
  UsersIcon,
  WalletIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { HomeKpi, TrendDirection } from "@/lib/admin/home-metrics"
import { cn } from "@/lib/utils"

const kpiIcons: Record<string, LucideIcon> = {
  organizations: Building2Icon,
  branches: GitBranchIcon,
  users: UsersIcon,
  mrr: WalletIcon,
  "attach-rate": LayersIcon,
}

function trendBadgeClass(trend: TrendDirection) {
  switch (trend) {
    case "up":
      return "border-transparent bg-success/10 text-success"
    case "down":
      return "border-transparent bg-destructive/10 text-error-text"
    default:
      return "border-transparent bg-fill2 text-fg-secondary"
  }
}

type KpiStripProps = {
  kpis: HomeKpi[]
}

export function KpiStrip({ kpis }: KpiStripProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {kpis.map((kpi) => {
        const Icon = kpiIcons[kpi.id] ?? Building2Icon

        return (
          <div
            key={kpi.id}
            className="flex flex-col justify-between gap-1 rounded-xl bg-card px-2.5 py-2 border"
          >
            <div className="flex size-7 items-center justify-center rounded-md text-fg-secondary">
              <Icon className="size-4" strokeWidth={1.75} aria-hidden />
            </div>

            <div className="min-w-0 space-y-0.5">
              <p className="truncate text-xs text-fg-secondary">{kpi.label}</p>

              <div className="flex flex-wrap items-center gap-1.5">
                <p className="text-xl font-semibold tracking-tight tabular-nums">
                  {kpi.value}
                </p>
                <Badge variant="strong" color="primary" size="20"
                  className={cn(
                    " tabular-nums",
                    trendBadgeClass(kpi.trend)
                  )}
                >
                  {kpi.changeLabel}
                </Badge>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
