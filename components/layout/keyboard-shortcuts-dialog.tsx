"use client"

import * as React from "react"
import { ChevronDownIcon, ChevronUpIcon, KeyboardIcon } from "lucide-react"
import {
  m,
  useDragControls,
  useReducedMotion,
  type PanInfo,
} from "framer-motion"

import { ShortcutsBrowser } from "@/components/keyboard/shortcuts-browser"
import { transitions, withReducedMotion } from "@/lib/motion"
import { useKeyboardShortcuts } from "@/components/layout/keyboard-shortcuts-provider"
import { IconButton } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

const COLLAPSED_MAX_HEIGHT = 544
const COLLAPSED_VIEWPORT_RATIO = 0.85

const EXPAND_OFFSET = 48
const COLLAPSE_OFFSET = 72
const CLOSE_OFFSET = 120
const FLICK_VELOCITY = 550

export function KeyboardShortcutsDialog() {
  const { helpOpen, setHelpOpen } = useKeyboardShortcuts()
  const dragControls = useDragControls()
  const reduceMotion = useReducedMotion()

  const [expanded, setExpanded] = React.useState(false)
  const [dragging, setDragging] = React.useState(false)
  const [viewportHeight, setViewportHeight] = React.useState(() =>
    typeof window === "undefined" ? 0 : window.innerHeight
  )
  const movedRef = React.useRef(false)

  React.useEffect(() => {
    function update() {
      setViewportHeight(window.innerHeight)
    }

    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  React.useEffect(() => {
    if (!helpOpen) {
      setExpanded(false)
      setDragging(false)
    }
  }, [helpOpen])

  const collapsedHeight = Math.min(
    viewportHeight * COLLAPSED_VIEWPORT_RATIO,
    COLLAPSED_MAX_HEIGHT
  )
  const height = viewportHeight
    ? expanded
      ? viewportHeight
      : collapsedHeight
    : undefined

  const spring = withReducedMotion(transitions.spring, reduceMotion)

  function startDrag(event: React.PointerEvent<HTMLElement>) {
    if (event.button !== 0) return
    if ((event.target as HTMLElement).closest("[data-no-drag='true']")) return

    movedRef.current = false
    dragControls.start(event)
  }

  function handleDragEnd(_event: unknown, info: PanInfo) {
    setDragging(false)

    const { y: offsetY } = info.offset
    const velocityY = info.velocity.y

    if (!expanded && (offsetY <= -EXPAND_OFFSET || velocityY <= -FLICK_VELOCITY)) {
      setExpanded(true)
      return
    }

    if (expanded && (offsetY >= COLLAPSE_OFFSET || velocityY >= FLICK_VELOCITY)) {
      setExpanded(false)
      return
    }

    if (!expanded && (offsetY >= CLOSE_OFFSET || velocityY >= FLICK_VELOCITY * 2)) {
      setHelpOpen(false)
    }
  }

  return (
    <Sheet open={helpOpen} onOpenChange={setHelpOpen}>
      <SheetContent
        side="bottom"
        className={cn(
          "gap-0 overflow-hidden p-0 transition-opacity",
          expanded
            ? "rounded-none"
            : "rounded-t-2xl data-[side=bottom]:h-[min(85svh,34rem)]"
        )}
        showCloseButton={false}
        render={
          <m.div
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{
              top: expanded ? 0 : 0.28,
              bottom: 0.4,
              left: 0,
              right: 0,
            }}
            onDragStart={() => {
              movedRef.current = true
              setDragging(true)
            }}
            onDragEnd={handleDragEnd}
            initial={{ y: reduceMotion ? 0 : 32 }}
            animate={{ y: 0, height }}
            transition={spring}
          />
        }
      >
        <div
          onPointerDown={startDrag}
          className={cn(
            "shrink-0 touch-none select-none",
            dragging ? "cursor-grabbing" : "cursor-grab"
          )}
        >
          <button
            type="button"
            onClick={() => {
              if (movedRef.current) return
              setExpanded((current) => !current)
            }}
            aria-label={
              expanded ? "Collapse shortcuts panel" : "Expand shortcuts panel"
            }
            className="group flex w-full cursor-[inherit] items-center justify-center pt-3 pb-2 outline-none"
          >
            <m.span
              animate={{ scaleX: dragging ? 1.4 : 1 }}
              transition={spring}
              className="h-1.5 w-12 rounded-full bg-border transition-colors group-hover:bg-muted-foreground/40 group-focus-visible:bg-ring"
            />
          </button>

          <SheetHeader className="flex-row items-start gap-3 border-b px-5 pt-0 pb-4 text-left">
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <KeyboardIcon className="size-4 text-muted-foreground" />
                <SheetTitle className="text-base font-semibold">
                  Keyboard Shortcuts
                </SheetTitle>
              </div>
              <SheetDescription>
                Drag this header to expand to full screen. Planned items
                activate as features ship.
              </SheetDescription>
            </div>

            <div
              data-no-drag="true"
              className="flex shrink-0 cursor-default items-center gap-1"
            >
              <IconButton
                variant="ghost"
                color="neutral"
                size="32"
                aria-label={
                  expanded ? "Collapse panel" : "Expand to full screen"
                }
                onClick={() => setExpanded((current) => !current)}
              >
                {expanded ? <ChevronDownIcon /> : <ChevronUpIcon />}
              </IconButton>
              <SheetClose
                render={
                  <IconButton variant="ghost" color="neutral" size="32" aria-label="Close" />
                }
              >
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
                <span className="sr-only">Close</span>
              </SheetClose>
            </div>
          </SheetHeader>
        </div>

        <ShortcutsBrowser className="flex-1" scrollable autoFocusSearch />
      </SheetContent>
    </Sheet>
  )
}
