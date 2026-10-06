"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import {
  Cancel01Icon,
  InformationCircleIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  formatNpr,
  PLAN_FEATURE_CATEGORIES,
  PLANS,
  type PlanFeatureValue,
  type PlanId,
} from "@/lib/onboarding/plans"
import { cn } from "@/lib/utils"

function FeatureCell({ value }: { value: PlanFeatureValue }) {
  if (typeof value === "string") {
    return (
      <span className="text-xs font-medium leading-snug text-foreground">
        {value}
      </span>
    )
  }

  if (value) {
    return (
      <span
        className="inline-flex size-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        aria-label="Included"
      >
        <HugeiconsIcon icon={Tick02Icon} className="size-3.5" strokeWidth={2} />
      </span>
    )
  }

  return (
    <span
      className="inline-flex size-6 items-center justify-center rounded-full bg-destructive/10 text-destructive"
      aria-label="Not included"
    >
      <HugeiconsIcon icon={Cancel01Icon} className="size-3" strokeWidth={2} />
    </span>
  )
}

function CategorySection({
  category,
  defaultOpen = false,
}: {
  category: (typeof PLAN_FEATURE_CATEGORIES)[number]
  defaultOpen?: boolean
}) {
  const [open, setOpen] = React.useState(defaultOpen)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger
        className={cn(
          "flex w-full items-center justify-between gap-3 border-b border-border bg-muted/40 px-3 py-2.5 text-left transition-colors hover:bg-muted/60",
          open && "border-b-0"
        )}
      >
        <span className="text-sm font-semibold text-foreground">
          {category.name}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="divide-y divide-border border-b border-border">
          {category.features.map((feature) => (
            <div
              key={feature.id}
              className="grid grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] items-center gap-2 px-3 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-1.5">
                <span className="text-xs text-foreground sm:text-sm">
                  {feature.name}
                </span>
                {feature.description ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex size-4 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
                        aria-label={`About ${feature.name}`}
                      >
                        <HugeiconsIcon
                          icon={InformationCircleIcon}
                          className="size-3.5"
                          strokeWidth={2}
                        />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[220px]">
                      {feature.description}
                    </TooltipContent>
                  </Tooltip>
                ) : null}
              </div>
              {(PLANS.map((p) => p.id) as PlanId[]).map((planId) => (
                <div key={planId} className="flex justify-center">
                  <FeatureCell value={feature.values[planId]} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function PlanCompareDialog({
  selectedPlanId,
  onSelectPlan,
  triggerClassName,
  triggerLabel = "View details",
  open: openProp,
  onOpenChange,
  hideTrigger = false,
}: {
  selectedPlanId?: PlanId
  onSelectPlan?: (planId: PlanId) => void
  triggerClassName?: string
  triggerLabel?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  hideTrigger?: boolean
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : uncontrolledOpen

  function setOpen(next: boolean) {
    if (!isControlled) setUncontrolledOpen(next)
    onOpenChange?.(next)
  }

  function handleSelect(planId: PlanId) {
    onSelectPlan?.(planId)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {hideTrigger ? null : (
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="link"
            className={cn(
              "h-auto px-0 text-sm font-medium text-primary",
              triggerClassName
            )}
          >
            {triggerLabel}
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="max-h-[min(860px,calc(100svh-2rem))] overflow-hidden sm:max-w-3xl">
        <DialogHeader className="shrink-0">
          <DialogTitle>
            Compare plans
          </DialogTitle>
          <DialogDescription>
            See what is included in each plan. Expand a category for the full
            feature list.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-auto">
          <div className="sticky top-0 z-10 grid grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] gap-2 border-b border-border bg-popover px-3 py-3">
            <div className="flex items-end pb-1 text-xs font-medium text-muted-foreground">
              Features
            </div>
            {PLANS.map((plan) => {
              const isSelected = selectedPlanId === plan.id
              const priceLabel =
                plan.monthlyPerUser === 0
                  ? "Free"
                  : `${formatNpr(plan.monthlyPerUser)}/user`

              return (
                <div
                  key={plan.id}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-lg border px-2 py-2.5 text-center",
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                      : "border-border bg-muted/20"
                  )}
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-foreground sm:text-sm">
                      {plan.name}
                    </p>
                    <p className="mt-0.5 text-[11px] tabular-nums text-muted-foreground">
                      {priceLabel}
                      {plan.monthlyPerUser > 0 ? " /mo" : ""}
                    </p>
                  </div>
                  {onSelectPlan ? (
                    <Button
                      type="button"
                      size="32"
                      variant={isSelected ? "strong" : "outline"}
                      color={isSelected ? "primary" : "neutral"}
                      className="h-7 w-full max-w-[7.5rem] text-xs"
                      onClick={() => handleSelect(plan.id)}
                    >
                      {isSelected ? (
                        <>
                          <HugeiconsIcon
                            icon={Tick02Icon}
                            className="size-3"
                          />
                          Selected
                        </>
                      ) : (
                        "Select"
                      )}
                    </Button>
                  ) : null}
                </div>
              )
            })}
          </div>

          <div className="pb-2">
            {PLAN_FEATURE_CATEGORIES.map((category, index) => (
              <CategorySection
                key={category.id}
                category={category}
                defaultOpen={index === 0}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
