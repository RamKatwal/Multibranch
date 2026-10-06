"use client"

import type { LucideIcon } from "lucide-react"
import {
  CreditCard,
  Receipt,
  ShoppingBag,
  ShoppingCart,
} from "lucide-react"

import { useDashboardLayoutEdit } from "@/components/dashboard/home/dashboard-layout-context"
import { WidgetRemoveButton } from "@/components/dashboard/home/widget-remove-button"
import { Badge } from "@/components/ui/badge"
import {
  DASHBOARD_WIDGET_IDS,
  type DashboardWidgetId,
} from "@/lib/dashboard/default-layout"
import {
  businessOverviewStats,
  type BusinessOverviewStat,
  type BusinessOverviewTrend,
} from "@/lib/dashboard/mock-data"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

const icons: Record<string, LucideIcon> = {
  "total-sales": ShoppingCart,
  "total-receipt": Receipt,
  "total-purchase": ShoppingBag,
  "total-payment": CreditCard,
}

const KPI_WIDGET_IDS = [
  DASHBOARD_WIDGET_IDS.totalSales,
  DASHBOARD_WIDGET_IDS.totalReceipt,
  DASHBOARD_WIDGET_IDS.totalPurchase,
  DASHBOARD_WIDGET_IDS.totalPayment,
] as const

type KpiWidgetId = (typeof KPI_WIDGET_IDS)[number]

function formatChange(change: number) {
  const absolute = Math.abs(change).toFixed(change % 1 === 0 ? 2 : 1)
  if (change > 0) return `+${absolute}%`
  if (change < 0) return `-${absolute}%`
  return `${absolute}%`
}

function trendBadgeClass(trend: BusinessOverviewTrend) {
  switch (trend) {
    case "up":
      return "border-transparent bg-success/10 text-success"
    case "down":
      return "border-transparent bg-destructive/10 text-destructive"
    default:
      return "border-transparent bg-muted text-muted-foreground"
  }
}

function KpiStatCard({
  widgetId,
  stat,
}: {
  widgetId: DashboardWidgetId
  stat: BusinessOverviewStat
}) {
  const { isLayoutEditing } = useDashboardLayoutEdit()
  const Icon = icons[stat.id] ?? ShoppingCart

  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col justify-between gap-1 rounded-xl bg-card px-2.5 py-2 ring-1 ring-foreground/10",
        isLayoutEditing && "cursor-grab pb-7 active:cursor-grabbing"
      )}
    >
      <div className="flex size-7 items-center justify-center rounded-md text-muted-foreground">
        <Icon className="size-4" strokeWidth={1.75} />
      </div>

      <div className="min-w-0 space-y-0.5">
        <p className="truncate text-xs text-muted-foreground">{stat.label}</p>

        <div className="flex flex-wrap items-center gap-1.5">
          <p className="text-xl font-semibold tracking-tight tabular-nums">
            {formatCurrency(stat.value)}
          </p>
          {!isLayoutEditing ? (
            <Badge
              variant="strong"
              color="primary"
              size="20"
              className={cn(
                "dashboard-no-drag h-5 rounded-full px-1.5 text-[10px] font-medium",
                trendBadgeClass(stat.trend)
              )}
            >
              {formatChange(stat.change)}
            </Badge>
          ) : null}
        </div>
      </div>

      <WidgetRemoveButton
        widgetId={widgetId}
        className="absolute bottom-1.5 left-2"
      />
    </div>
  )
}

function createKpiWidget(widgetId: KpiWidgetId) {
  const stat = businessOverviewStats.find((item) => item.id === widgetId)

  function KpiWidget() {
    if (!stat) return null
    return <KpiStatCard widgetId={widgetId} stat={stat} />
  }

  KpiWidget.displayName = `KpiWidget(${widgetId})`
  return KpiWidget
}

export const TotalSalesWidget = createKpiWidget(
  DASHBOARD_WIDGET_IDS.totalSales
)
export const TotalReceiptWidget = createKpiWidget(
  DASHBOARD_WIDGET_IDS.totalReceipt
)
export const TotalPurchaseWidget = createKpiWidget(
  DASHBOARD_WIDGET_IDS.totalPurchase
)
export const TotalPaymentWidget = createKpiWidget(
  DASHBOARD_WIDGET_IDS.totalPayment
)
