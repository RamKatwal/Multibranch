"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import {
  DASHBOARD_WIDGET_CATALOG,
  DASHBOARD_WIDGET_CATEGORIES,
  type DashboardWidgetId,
} from "@/lib/dashboard/default-layout"
import { cn } from "@/lib/utils"

type AddWidgetsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  visibleWidgetIds: Set<DashboardWidgetId>
  onToggleWidget: (widgetId: DashboardWidgetId, visible: boolean) => void
}

export function AddWidgetsDialog({
  open,
  onOpenChange,
  visibleWidgetIds,
  onToggleWidget,
}: AddWidgetsDialogProps) {
  const grouped = React.useMemo(
    () =>
      DASHBOARD_WIDGET_CATEGORIES.map((category) => ({
        ...category,
        widgets: DASHBOARD_WIDGET_CATALOG.filter(
          (widget) => widget.category === category.id
        ),
      })).filter((category) => category.widgets.length > 0),
    []
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="gap-0 overflow-hidden p-0 sm:max-w-sm"
        showCloseButton
      >
        <DialogHeader className="border-b px-5 py-4 pr-12">
          <DialogTitle className="text-base font-semibold">
            Show and hide widgets
          </DialogTitle>
          <DialogDescription className="sr-only">
            Toggle which widgets appear on your dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="thin-scrollbar max-h-[min(28rem,65vh)] overflow-y-auto px-5 py-3">
          <div className="flex flex-col gap-5">
            {grouped.map((category) => (
              <section key={category.id} className="flex flex-col gap-1">
                <h3 className="px-0.5 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {category.label}
                </h3>
                <ul className="flex flex-col">
                  {category.widgets.map((widget) => {
                    const checked = visibleWidgetIds.has(widget.id)

                    return (
                      <li key={widget.id}>
                        <label
                          className={cn(
                            "flex cursor-pointer items-center gap-3 rounded-md py-2.5 transition-colors",
                            "hover:bg-muted/50"
                          )}
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-medium text-foreground">
                              {widget.label}
                            </span>
                            {widget.description ? (
                              <span className="mt-0.5 block text-xs text-muted-foreground">
                                {widget.description}
                              </span>
                            ) : null}
                          </span>
                          <Switch
                            checked={checked}
                            onCheckedChange={(next) =>
                              onToggleWidget(widget.id, next)
                            }
                            aria-label={`Show ${widget.label}`}
                          />
                        </label>
                      </li>
                    )
                  })}
                </ul>
              </section>
            ))}
          </div>
        </div>

        <DialogFooter className="border-t px-5 py-3 sm:justify-end">
          <Button type="button" size="32" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
