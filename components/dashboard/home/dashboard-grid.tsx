"use client"

import * as React from "react"
import type { Layout, ResponsiveLayouts } from "react-grid-layout"
import { Responsive, WidthProvider } from "react-grid-layout/legacy"
import {
  LayoutGrid,
  Minimize2,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Save,
  X,
} from "lucide-react"

import { AddWidgetsDialog } from "@/components/dashboard/home/add-widgets-dialog"
import { DashboardLayoutProvider } from "@/components/dashboard/home/dashboard-layout-context"
import { useHomeViewOptional } from "@/components/dashboard/home/home-view-context"
import {
  TotalPaymentWidget,
  TotalPurchaseWidget,
  TotalReceiptWidget,
  TotalSalesWidget,
} from "@/components/dashboard/home/widgets/business-overview"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuDivider,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BankCashBalanceWidget } from "@/components/dashboard/home/widgets/bank-cash-balance"
import { CashInOutWidget } from "@/components/dashboard/home/widgets/cash-in-out"
import { FinancialInsightWidget } from "@/components/dashboard/home/widgets/financial-insight"
import { PayableAgeingWidget } from "@/components/dashboard/home/widgets/payable-ageing"
import { ReceivableAgeingWidget } from "@/components/dashboard/home/widgets/receivable-ageing"
import { ReceivablesPayablesWidget } from "@/components/dashboard/home/widgets/receivables-payables"
import { RevenueInflowWidget } from "@/components/dashboard/home/widgets/revenue-inflow"
import { TransactionsWidget } from "@/components/dashboard/home/widgets/transactions"
import {
  ALL_DASHBOARD_WIDGET_IDS,
  areDashboardLayoutsEqual,
  DASHBOARD_LAYOUT_STORAGE_KEY,
  DASHBOARD_WIDGET_IDS,
  defaultDashboardLayouts,
  getLayoutWidgetIds,
  removeWidgetFromLayouts,
  restoreWidgetToLayouts,
  type DashboardWidgetId,
} from "@/lib/dashboard/default-layout"
import { cn } from "@/lib/utils"

import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"

// Bump this version whenever the default layout changes to invalidate stale saved layouts
const LAYOUT_VERSION = 15

const ResponsiveGridLayout = WidthProvider(Responsive)

const RESIZE_HANDLES = ["s", "w", "e", "n", "sw", "nw", "se", "ne"] as const

type DashboardGridProps = {
  storageKey?: string
  embedded?: boolean
  readOnly?: boolean
}

const widgetMap = {
  [DASHBOARD_WIDGET_IDS.totalSales]: TotalSalesWidget,
  [DASHBOARD_WIDGET_IDS.totalReceipt]: TotalReceiptWidget,
  [DASHBOARD_WIDGET_IDS.totalPurchase]: TotalPurchaseWidget,
  [DASHBOARD_WIDGET_IDS.totalPayment]: TotalPaymentWidget,
  [DASHBOARD_WIDGET_IDS.financialInsight]: FinancialInsightWidget,
  [DASHBOARD_WIDGET_IDS.receivablesPayables]: ReceivablesPayablesWidget,
  [DASHBOARD_WIDGET_IDS.receivableAgeing]: ReceivableAgeingWidget,
  [DASHBOARD_WIDGET_IDS.revenueInflow]: RevenueInflowWidget,
  [DASHBOARD_WIDGET_IDS.payableAgeing]: PayableAgeingWidget,
  [DASHBOARD_WIDGET_IDS.cashInOut]: CashInOutWidget,
  [DASHBOARD_WIDGET_IDS.bankCashBalance]: BankCashBalanceWidget,
  [DASHBOARD_WIDGET_IDS.transactions]: TransactionsWidget,
} as const

function cloneLayouts(layouts: ResponsiveLayouts): ResponsiveLayouts {
  return structuredClone(layouts)
}

export function DashboardGrid({
  storageKey = DASHBOARD_LAYOUT_STORAGE_KEY,
  embedded = false,
  readOnly = false,
}: DashboardGridProps = {}) {
  const homeView = useHomeViewOptional()
  const [isLayoutEditing, setIsLayoutEditing] = React.useState(false)
  const [isAddWidgetsOpen, setIsAddWidgetsOpen] = React.useState(false)
  const [hasCustomLayout, setHasCustomLayout] = React.useState(false)
  const [isDirty, setIsDirty] = React.useState(false)
  const [layoutKey, setLayoutKey] = React.useState(0)
  const [savedLayouts, setSavedLayouts] = React.useState<ResponsiveLayouts>(
    defaultDashboardLayouts
  )
  const [layouts, setLayouts] =
    React.useState<ResponsiveLayouts>(defaultDashboardLayouts)

  React.useEffect(() => {
    const versionKey = `${storageKey}-version`
    const savedVersion = window.localStorage.getItem(versionKey)

    if (savedVersion !== String(LAYOUT_VERSION)) {
      window.localStorage.removeItem(storageKey)
      window.localStorage.setItem(versionKey, String(LAYOUT_VERSION))
      return
    }

    const saved = window.localStorage.getItem(storageKey)
    if (!saved) return

    try {
      const parsed = JSON.parse(saved) as ResponsiveLayouts
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSavedLayouts(parsed)
      setLayouts(parsed)
      setHasCustomLayout(!areDashboardLayoutsEqual(parsed, defaultDashboardLayouts))
    } catch {
      window.localStorage.removeItem(storageKey)
    }
  }, [storageKey])

  const visibleWidgetIds = React.useMemo(
    () => new Set(getLayoutWidgetIds(layouts)),
    [layouts]
  )

  const handleLayoutChange = React.useCallback(
    (_currentLayout: Layout, allLayouts: ResponsiveLayouts) => {
      if (!isLayoutEditing) return
      setLayouts(allLayouts)
      setIsDirty(!areDashboardLayoutsEqual(allLayouts, savedLayouts))
    },
    [isLayoutEditing, savedLayouts]
  )

  const handleStartEditing = React.useCallback(() => {
    if (readOnly) return
    setLayouts(cloneLayouts(savedLayouts))
    setIsDirty(false)
    setIsLayoutEditing(true)
  }, [readOnly, savedLayouts])

  const handleSaveLayout = React.useCallback(() => {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify(layouts)
    )
    setSavedLayouts(cloneLayouts(layouts))
    setHasCustomLayout(
      !areDashboardLayoutsEqual(layouts, defaultDashboardLayouts)
    )
    setIsDirty(false)
    setIsLayoutEditing(false)
    setIsAddWidgetsOpen(false)
  }, [layouts, storageKey])

  const handleCancelEditing = React.useCallback(() => {
    setLayouts(cloneLayouts(savedLayouts))
    setIsDirty(false)
    setIsLayoutEditing(false)
    setIsAddWidgetsOpen(false)
    setLayoutKey((current) => current + 1)
  }, [savedLayouts])

  const handleResetLayout = React.useCallback(() => {
    window.localStorage.removeItem(storageKey)
    setSavedLayouts(defaultDashboardLayouts)
    setLayouts(defaultDashboardLayouts)
    setHasCustomLayout(false)
    setIsDirty(false)
    setIsLayoutEditing(false)
    setIsAddWidgetsOpen(false)
    setLayoutKey((current) => current + 1)
  }, [storageKey])

  const handleRemoveWidget = React.useCallback(
    (widgetId: DashboardWidgetId) => {
      if (!isLayoutEditing) return
      setLayouts((current) => {
        const next = removeWidgetFromLayouts(current, widgetId)
        setIsDirty(!areDashboardLayoutsEqual(next, savedLayouts))
        return next
      })
      setLayoutKey((current) => current + 1)
    },
    [isLayoutEditing, savedLayouts]
  )

  const handleToggleWidget = React.useCallback(
    (widgetId: DashboardWidgetId, visible: boolean) => {
      if (!isLayoutEditing) return

      setLayouts((current) => {
        const isVisible = getLayoutWidgetIds(current).includes(widgetId)
        if (visible === isVisible) return current

        const next = visible
          ? restoreWidgetToLayouts(current, widgetId)
          : removeWidgetFromLayouts(current, widgetId)
        setIsDirty(!areDashboardLayoutsEqual(next, savedLayouts))
        return next
      })
      setLayoutKey((current) => current + 1)
    },
    [isLayoutEditing, savedLayouts]
  )

  const registerLayoutActions = homeView?.registerLayoutActions
  const exitFullscreen = homeView?.exitFullscreen
  const isFullscreen = homeView?.isFullscreen ?? false

  // Register layout actions with the shell so Home sidebar more-actions can drive them.
  React.useEffect(() => {
    if (embedded || !registerLayoutActions) return

    registerLayoutActions({
      canEdit: !readOnly,
      isLayoutEditing,
      hasCustomLayout,
      startEditing: handleStartEditing,
      resetLayout: handleResetLayout,
    })

    return () => {
      registerLayoutActions(null)
    }
  }, [
    embedded,
    registerLayoutActions,
    readOnly,
    isLayoutEditing,
    hasCustomLayout,
    handleStartEditing,
    handleResetLayout,
  ])

  React.useEffect(() => {
    if (embedded || !isFullscreen || !exitFullscreen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      exitFullscreen()
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [embedded, isFullscreen, exitFullscreen])

  const editingControls = (
    <>
      <Button
        type="button"
        variant="outline"
        color="neutral"
        size="32"
        className="shadow-sm"
        onClick={() => setIsAddWidgetsOpen(true)}
      >
        <Plus />
        Add widget
      </Button>
      <Button
        type="button"
        variant="outline"
        color="neutral"
        size="32"
        className="shadow-sm"
        onClick={handleCancelEditing}
      >
        <X />
        Cancel
      </Button>
      <Button
        type="button"
        size="32"
        className="shadow-sm"
        disabled={!isDirty}
        onClick={handleSaveLayout}
      >
        <Save />
        Save layout
      </Button>
    </>
  )

  const embeddedControls = !readOnly ? (
    <div className="z-50 mb-3 flex flex-row flex-wrap justify-end gap-2">
      {isLayoutEditing ? (
        editingControls
      ) : (
        <>
          {hasCustomLayout ? (
            <Button
              type="button"
              variant="outline"
              color="neutral"
              size="32"
              className="shadow-md"
              onClick={handleResetLayout}
            >
              <RotateCcw />
              Reset layout
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            color="neutral"
            size="32"
            className="shadow-md"
            onClick={handleStartEditing}
          >
            <LayoutGrid />
            Edit layout
          </Button>
        </>
      )}
    </div>
  ) : null

  const homeEditingSection =
    !embedded && !readOnly && isLayoutEditing ? (
      <section
        aria-label="Layout editing"
        className="flex flex-row flex-wrap items-center gap-2"
      >
        {editingControls}
      </section>
    ) : null

  const fullscreenChrome =
    !embedded && isFullscreen && exitFullscreen ? (
      <div className="flex items-center justify-end gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              color="neutral"
              size="32"
              aria-label="More actions"
            >
              <MoreHorizontal />
              More actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuGroup>
              <DropdownMenuLabel>More actions</DropdownMenuLabel>
              <DropdownMenuDivider />
              {!readOnly && !isLayoutEditing ? (
                <DropdownMenuItem onClick={handleStartEditing}>
                  <LayoutGrid />
                  Edit layout
                </DropdownMenuItem>
              ) : null}
              {!readOnly && !isLayoutEditing && hasCustomLayout ? (
                <DropdownMenuItem onClick={handleResetLayout}>
                  <RotateCcw />
                  Reset layout
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem onClick={exitFullscreen}>
                <Minimize2 />
                Back to default
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ) : null

  return (
    <DashboardLayoutProvider
      isLayoutEditing={isLayoutEditing}
      removeWidget={handleRemoveWidget}
    >
      {embedded ? embeddedControls : null}

      {!embedded && (homeEditingSection || fullscreenChrome) ? (
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center">
            {homeEditingSection}
          </div>
          {fullscreenChrome}
        </div>
      ) : null}

      <div
        className={cn(
          "dashboard-grid -mx-1",
          isLayoutEditing && "dashboard-grid--editing"
        )}
      >
        <ResponsiveGridLayout
          key={layoutKey}
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 12, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={34}
          margin={[12, 12]}
          containerPadding={[0, 0]}
          draggableCancel=".dashboard-no-drag, button, a, input, select, textarea, [role='combobox'], [role='listbox'], [data-slot='dropdown-menu-trigger'], [data-slot='switch']"
          isResizable={isLayoutEditing}
          isDraggable={isLayoutEditing}
          isBounded
          resizeHandles={[...RESIZE_HANDLES]}
          compactType="vertical"
          onLayoutChange={handleLayoutChange}
        >
          {ALL_DASHBOARD_WIDGET_IDS.filter((id) =>
            visibleWidgetIds.has(id)
          ).map((id) => {
            const Widget = widgetMap[id]

            return (
              <div key={id} className="dashboard-grid-item">
                <Widget />
              </div>
            )
          })}
        </ResponsiveGridLayout>
      </div>

      <AddWidgetsDialog
        open={isAddWidgetsOpen}
        onOpenChange={setIsAddWidgetsOpen}
        visibleWidgetIds={visibleWidgetIds}
        onToggleWidget={handleToggleWidget}
      />
    </DashboardLayoutProvider>
  )
}
