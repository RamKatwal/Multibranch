import { mockDeliveryNotes } from "@/lib/mock/delivery-notes"
import {
  DELIVERY_NOTE_INVOICE_STATUSES,
  DELIVERY_NOTE_STATUSES,
  type DeliveryNote,
} from "@/types/delivery-note"

/**
 * Client-side stub. No delivery-note API exists yet — persist to
 * localStorage instead of guessing at a contract.
 */
const DELIVERY_NOTES_STORAGE_KEY = "ibmerp-delivery-notes-v1"

function canUseStorage() {
  return typeof window !== "undefined"
}

function isCurrentSchema(note: DeliveryNote): boolean {
  return (
    typeof note.id === "string" &&
    typeof note.customerId === "string" &&
    typeof note.entryDate === "string" &&
    typeof note.totalAmount === "number" &&
    DELIVERY_NOTE_STATUSES.includes(note.status) &&
    DELIVERY_NOTE_INVOICE_STATUSES.includes(note.invoiceStatus)
  )
}

function cloneNotes(notes: DeliveryNote[]): DeliveryNote[] {
  return notes.map((note) => ({ ...note }))
}

export function readDeliveryNotes(): DeliveryNote[] {
  if (!canUseStorage()) return cloneNotes(mockDeliveryNotes)

  try {
    const raw = window.localStorage.getItem(DELIVERY_NOTES_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as DeliveryNote[]
      if (Array.isArray(parsed)) {
        return parsed.filter(isCurrentSchema)
      }
    }
  } catch {
    // Fall back to mock seed data.
  }

  return cloneNotes(mockDeliveryNotes)
}

export function saveDeliveryNotes(notes: DeliveryNote[]) {
  if (!canUseStorage()) return notes
  window.localStorage.setItem(DELIVERY_NOTES_STORAGE_KEY, JSON.stringify(notes))
  return notes
}

export function getDeliveryNoteById(id: string): DeliveryNote | undefined {
  return readDeliveryNotes().find((note) => note.id === id)
}

export function createDeliveryNoteId(existing: DeliveryNote[]) {
  const used = new Set(existing.map((note) => note.id))
  let next = existing.length + 1
  let id = `DLN-${String(next).padStart(6, "0")}-2082/83`

  while (used.has(id)) {
    next += 1
    id = `DLN-${String(next).padStart(6, "0")}-2082/83`
  }

  return id
}
