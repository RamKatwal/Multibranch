import { mockDeliveryNoteReturns } from "@/lib/mock/delivery-note-returns"
import {
  DELIVERY_NOTE_RETURN_STATUSES,
  type DeliveryNoteReturn,
} from "@/types/delivery-note-return"

/**
 * Client-side stub. No delivery-note-return API exists yet — persist to
 * localStorage instead of guessing at a contract.
 */
const DELIVERY_NOTE_RETURNS_STORAGE_KEY = "ibmerp-delivery-note-returns-v1"

function canUseStorage() {
  return typeof window !== "undefined"
}

function isCurrentSchema(entry: DeliveryNoteReturn): boolean {
  return (
    typeof entry.id === "string" &&
    typeof entry.customerId === "string" &&
    typeof entry.entryDate === "string" &&
    typeof entry.deliveryNoteId === "string" &&
    typeof entry.totalAmount === "number" &&
    DELIVERY_NOTE_RETURN_STATUSES.includes(entry.status)
  )
}

function cloneReturns(returns: DeliveryNoteReturn[]): DeliveryNoteReturn[] {
  return returns.map((entry) => ({ ...entry }))
}

export function readDeliveryNoteReturns(): DeliveryNoteReturn[] {
  if (!canUseStorage()) return cloneReturns(mockDeliveryNoteReturns)

  try {
    const raw = window.localStorage.getItem(DELIVERY_NOTE_RETURNS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as DeliveryNoteReturn[]
      if (Array.isArray(parsed)) {
        return parsed.filter(isCurrentSchema)
      }
    }
  } catch {
    // Fall back to mock seed data.
  }

  return cloneReturns(mockDeliveryNoteReturns)
}

export function saveDeliveryNoteReturns(returns: DeliveryNoteReturn[]) {
  if (!canUseStorage()) return returns
  window.localStorage.setItem(
    DELIVERY_NOTE_RETURNS_STORAGE_KEY,
    JSON.stringify(returns)
  )
  return returns
}

export function getDeliveryNoteReturnById(
  id: string
): DeliveryNoteReturn | undefined {
  return readDeliveryNoteReturns().find((entry) => entry.id === id)
}

export function createDeliveryNoteReturnId(existing: DeliveryNoteReturn[]) {
  const used = new Set(existing.map((entry) => entry.id))
  let next = existing.length + 1
  let id = `DLR-${String(next).padStart(6, "0")}-2082/83`

  while (used.has(id)) {
    next += 1
    id = `DLR-${String(next).padStart(6, "0")}-2082/83`
  }

  return id
}
