import { mockSalesOrders } from "@/lib/mock/sales-orders"
import type {
  DeliveryNote,
  DeliveryNoteInvoiceStatus,
  DeliveryNoteStatus,
} from "@/types/delivery-note"

const statuses: DeliveryNoteStatus[] = ["approved", "draft", "for-approval", "cancelled"]
const invoiceStatuses: DeliveryNoteInvoiceStatus[] = ["invoiced", "not-invoiced"]
const entryBySamples = ["admin", "ram", "farah", "gopal", "laxman", "kabita"]

function pad(value: number, length = 6) {
  return String(value).padStart(length, "0")
}

function dateForIndex(index: number, offsetDays = 2) {
  const base = new Date(Date.UTC(2082, 0, 1))
  base.setUTCDate(base.getUTCDate() + (index % 400) + offsetDays)
  const year = base.getUTCFullYear()
  const month = String(base.getUTCMonth() + 1).padStart(2, "0")
  const day = String(base.getUTCDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/** One delivery note per approved sales order — shipments only go out once an order is confirmed. */
function buildMockDeliveryNotes(): DeliveryNote[] {
  const approvedOrders = mockSalesOrders.filter((order) => order.status === "approved")

  return approvedOrders.map((order, index) => ({
    id: `DLN-${pad(index + 1)}-2082/83`,
    customerId: order.customerId,
    customer: order.customer,
    entryDate: dateForIndex(index),
    totalAmount: order.grandTotal,
    invoiceStatus: invoiceStatuses[index % invoiceStatuses.length],
    status: statuses[index % statuses.length],
    entryBy: entryBySamples[index % entryBySamples.length],
  }))
}

export const mockDeliveryNotes: DeliveryNote[] = buildMockDeliveryNotes()
