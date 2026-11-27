"use client"

import * as React from "react"
import { CheckIcon, FlaskConicalIcon, RotateCcwIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  applyDemoScenario,
  clearDemoScenario,
  demoScenarios,
  getDemoScenario,
  readDemoScenarioId,
} from "@/lib/admin/demo-scenarios"
import { BRANCHES_CHANGE_EVENT } from "@/lib/branches/storage"
import { cn } from "@/lib/utils"

function subscribe(listener: () => void) {
  window.addEventListener("storage", listener)
  window.addEventListener(BRANCHES_CHANGE_EVENT, listener)
  return () => {
    window.removeEventListener("storage", listener)
    window.removeEventListener(BRANCHES_CHANGE_EVENT, listener)
  }
}

/**
 * Demo-only control, fixed to the bottom right of the admin console. Each scenario loads a
 * ready-made state (companies, branches, branch limit) so a use case can be shown on the spot.
 */
export function DemoScenarioSwitcher() {
  const [open, setOpen] = React.useState(false)
  const activeId = React.useSyncExternalStore(
    subscribe,
    readDemoScenarioId,
    () => null
  )
  const active = getDemoScenario(activeId)

  return (
    <div className="fixed right-4 bottom-4 z-40">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            size="32"
            variant="outline"
            color="neutral"
            className="shadow-md"
          >
            <FlaskConicalIcon />
            {active ? `Demo: ${active.label}` : "Demo scenarios"}
          </Button>
        </PopoverTrigger>
        <PopoverContent side="top" align="end" className="w-80 p-1">
          <div className="px-2 pt-1.5 pb-2">
            <p className="text-sm font-medium text-fg">Demo scenarios</p>
            <p className="text-xs text-fg-secondary">
              Load a ready-made state to show a use case. Replaces the
              branches stored in this browser.
            </p>
          </div>
          <ul className="flex flex-col gap-0.5">
            {demoScenarios.map((scenario) => {
              const isActive = scenario.id === activeId
              return (
                <li key={scenario.id}>
                  <button
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => {
                      applyDemoScenario(scenario)
                      toast.success(`Scenario loaded: ${scenario.label}`)
                      setOpen(false)
                    }}
                    className={cn(
                      "flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left hover:bg-fill2 focus-visible:ring-2 focus-visible:ring-primary-focus focus-visible:outline-none",
                      isActive && "bg-fill2"
                    )}
                  >
                    <span className="flex size-4 shrink-0 items-center justify-center pt-1 text-fg">
                      {isActive ? <CheckIcon className="size-4" /> : null}
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="text-sm font-medium text-fg">
                        {scenario.label}
                      </span>
                      <span className="text-xs text-fg-secondary">
                        {scenario.description}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
          <div className="mt-1 border-t border-border p-1 pt-2">
            <Button
              size="28"
              variant="ghost"
              color="neutral"
              className="w-full justify-start"
              disabled={!active}
              onClick={() => {
                clearDemoScenario()
                toast.success("Demo data reset")
                setOpen(false)
              }}
            >
              <RotateCcwIcon />
              Reset to app data
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
