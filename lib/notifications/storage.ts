import { sampleNotifications } from "@/lib/mock/notifications"
import type { AppNotification } from "@/types/notification"

const NOTIFICATIONS_STORAGE_KEY = "ibmerp-notifications"
export const NOTIFICATIONS_CHANGED_EVENT = "ibmerp-notifications-changed"

function canUseStorage() {
  return typeof window !== "undefined"
}

function emitChanged() {
  if (!canUseStorage()) return
  window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT))
}

export function readCustomNotifications(): AppNotification[] {
  if (!canUseStorage()) return []
  try {
    const raw = window.localStorage.getItem(NOTIFICATIONS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as AppNotification[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveCustomNotifications(notifications: AppNotification[]) {
  if (!canUseStorage()) return
  window.localStorage.setItem(
    NOTIFICATIONS_STORAGE_KEY,
    JSON.stringify(notifications)
  )
  emitChanged()
}

/** Custom notifications override sample records with the same id. */
export function getAllNotifications(): AppNotification[] {
  const custom = readCustomNotifications()
  const customIds = new Set(custom.map((item) => item.id))
  return [
    ...custom,
    ...sampleNotifications.filter((item) => !customIds.has(item.id)),
  ]
}

export function addNotification(
  notification: Omit<AppNotification, "id" | "timestamp" | "read"> & {
    id?: string
    timestamp?: string
    read?: boolean
  }
): AppNotification {
  const next: AppNotification = {
    ...notification,
    id: notification.id ?? `n-${Date.now()}`,
    timestamp: notification.timestamp ?? "Just now",
    read: notification.read ?? false,
  }
  saveCustomNotifications([next, ...readCustomNotifications()])
  return next
}

export function markAllNotificationsRead(): AppNotification[] {
  const all = getAllNotifications()
  const next = all.map((item) => ({ ...item, read: true }))
  // Persist overrides for every id so sample items stay read too.
  saveCustomNotifications(next)
  return next
}

export function getUnreadNotificationCount(): number {
  return getAllNotifications().filter((item) => !item.read).length
}
