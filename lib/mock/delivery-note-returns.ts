import { mockDeliveryNotes } from "@/lib/mock/delivery-notes"
import type {
  DeliveryNoteReturn,
  DeliveryNoteReturnStatus,
} from "@/types/delivery-note-return"

const statuses: DeliveryNoteReturnStatus[] = [
  "approved",
  "draft",
  "for-approval",
  "cancelled",
]
const entryBySamples = ["admin", "ram", "farah", "gopal", "laxman", "kabita"]

function pad(value: number, length = 6) {
  return String(value).padStart(length, "0")
}

function dateForIndex(index: number, offsetDays = 6) {
  const base = new Date(Date.UTC(2082, 0, 1))
  base.setUTCDate(base.getUTCDate() + (index % 400) + offsetDays)
  const year = base.getUTCFullYear()
  const month = String(base.getUTCMonth() + 1).padStart(2, "0")
  const day = String(base.getUTCDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/** A return against every fourth delivery note — most shipments aren't returned. */
function buildMockDeliveryNoteReturns(): DeliveryNoteReturn[] {
  return mockDeliveryNotes
    .filter((_, index) => index % 4 === 0)
    .map((note, index) => ({
      id: `DLR-${pad(index + 1)}-2082/83`,
      customerId: note.customerId,
      customer: note.customer,
      entryDate: dateForIndex(index),
      totalAmount: Math.round(note.totalAmount * 0.3),
      deliveryNoteId: note.id,
      status: statuses[index % statuses.length],
      entryBy: entryBySamples[index % entryBySamples.length],
    }))
}

export const mockDeliveryNoteReturns: DeliveryNoteReturn[] =
  buildMockDeliveryNoteReturns()
