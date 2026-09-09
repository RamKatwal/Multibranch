"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import {
  goToShortcuts,
  quickCreateShortcuts,
} from "@/lib/keyboard/shortcuts"
import { focusPageSearch, isTypingTarget } from "@/lib/keyboard/utils"

type KeyboardShortcutsContextValue = {
  commandOpen: boolean
  setCommandOpen: (open: boolean) => void
  createOpen: boolean
  setCreateOpen: (open: boolean) => void
  helpOpen: boolean
  setHelpOpen: (open: boolean) => void
  openCommandPalette: () => void
  openQuickCreate: () => void
  openShortcutsHelp: () => void
}

const KeyboardShortcutsContext =
  React.createContext<KeyboardShortcutsContextValue | null>(null)

const SEQUENCE_TIMEOUT_MS = 1000

function hrefForQuickCreateKey(key: string): string | undefined {
  const entry = Object.entries(quickCreateShortcuts).find(
    ([, value]) => value.key === key.toLowerCase()
  )
  return entry?.[0]
}

export function KeyboardShortcutsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [commandOpen, setCommandOpen] = React.useState(false)
  const [createOpen, setCreateOpen] = React.useState(false)
  const [helpOpen, setHelpOpen] = React.useState(false)
  const pendingGoRef = React.useRef(false)
  const sequenceTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  )

  const clearSequence = React.useCallback(() => {
    pendingGoRef.current = false
    if (sequenceTimerRef.current) {
      clearTimeout(sequenceTimerRef.current)
      sequenceTimerRef.current = null
    }
  }, [])

  const openCommandPalette = React.useCallback(() => {
    setCreateOpen(false)
    setHelpOpen(false)
    setCommandOpen(true)
  }, [])

  const openQuickCreate = React.useCallback(() => {
    setCommandOpen(false)
    setHelpOpen(false)
    setCreateOpen(true)
  }, [])

  const openShortcutsHelp = React.useCallback(() => {
    setCommandOpen(false)
    setCreateOpen(false)
    setHelpOpen(true)
  }, [])

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) return

      const key = event.key
      const lower = key.toLowerCase()
      const mod = event.metaKey || event.ctrlKey
      const typing = isTypingTarget(event.target)

      // Mod+/ → shortcuts help (takes precedence over sidebar)
      if (mod && (key === "/" || key === "?")) {
        if (typing) return
        event.preventDefault()
        openShortcutsHelp()
        clearSequence()
        return
      }

      // Mod+K → command palette
      if (mod && !event.shiftKey && lower === "k") {
        event.preventDefault()
        setCreateOpen(false)
        setHelpOpen(false)
        setCommandOpen((open) => !open)
        clearSequence()
        return
      }

      // Mod+Shift+F → global search (command palette)
      if (mod && event.shiftKey && lower === "f") {
        event.preventDefault()
        openCommandPalette()
        clearSequence()
        return
      }

      // Mod+Shift+Q → sign out
      if (mod && event.shiftKey && lower === "q") {
        event.preventDefault()
        clearSequence()
        router.push("/signup")
        return
      }

      // Mod+F → page search (don't steal browser find when no page search)
      if (mod && !event.shiftKey && lower === "f") {
        if (typing) return
        const focused = focusPageSearch()
        if (focused) {
          event.preventDefault()
        }
        clearSequence()
        return
      }

      // Alt+N → quick create menu (avoids Chrome Ctrl+N new window)
      if (event.altKey && !mod && !event.shiftKey && lower === "n") {
        if (typing) return
        event.preventDefault()
        openQuickCreate()
        clearSequence()
        return
      }

      // Alt+letter → quick create actions
      if (
        event.altKey &&
        !mod &&
        !event.shiftKey &&
        key.length === 1 &&
        /[a-z]/i.test(key)
      ) {
        if (typing) return
        const href = hrefForQuickCreateKey(lower)
        if (href) {
          event.preventDefault()
          setCreateOpen(false)
          setCommandOpen(false)
          setHelpOpen(false)
          router.push(href)
          clearSequence()
          return
        }
      }

      // Sequence navigation: G then key
      if (typing || mod || event.altKey) {
        clearSequence()
        return
      }

      if (pendingGoRef.current) {
        const target = goToShortcuts[lower]
        clearSequence()
        if (target) {
          event.preventDefault()
          router.push(target.href)
        }
        return
      }

      if (lower === "g" && !event.shiftKey) {
        pendingGoRef.current = true
        sequenceTimerRef.current = setTimeout(clearSequence, SEQUENCE_TIMEOUT_MS)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      clearSequence()
    }
  }, [
    clearSequence,
    openCommandPalette,
    openQuickCreate,
    openShortcutsHelp,
    router,
  ])

  const value = React.useMemo(
    () => ({
      commandOpen,
      setCommandOpen,
      createOpen,
      setCreateOpen,
      helpOpen,
      setHelpOpen,
      openCommandPalette,
      openQuickCreate,
      openShortcutsHelp,
    }),
    [
      commandOpen,
      createOpen,
      helpOpen,
      openCommandPalette,
      openQuickCreate,
      openShortcutsHelp,
    ]
  )

  return (
    <KeyboardShortcutsContext.Provider value={value}>
      {children}
    </KeyboardShortcutsContext.Provider>
  )
}

export function useKeyboardShortcuts() {
  const ctx = React.useContext(KeyboardShortcutsContext)
  if (!ctx) {
    throw new Error(
      "useKeyboardShortcuts must be used within KeyboardShortcutsProvider"
    )
  }
  return ctx
}

/** Optional access when provider may be absent (tests / isolated render). */
export function useKeyboardShortcutsOptional() {
  return React.useContext(KeyboardShortcutsContext)
}
