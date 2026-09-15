import { getPurchasableProducts } from "@/lib/mock/purchase-orders"
import type {
  PurchaseRequisition,
  PurchaseRequisitionItem,
  PurchaseRequisitionStatus,
} from "@/types/purchase-requisition"

const statuses: PurchaseRequisitionStatus[] = [
  "approved",
  "draft",
  "for-approval",
  "cancelled",
]

const remarksSamples = [
  "",
  "Restock ahead of festival season.",
  "Requested by Kathmandu hub.",
  "Awaiting budget approval.",
  "Match previous requisition quantities.",
]

function pad(value: number, length = 6) {
  return String(value).padStart(length, "0")
}

function dateForIndex(index: number, offsetDays = 0) {
  const base = new Date(Date.UTC(2082, 0, 1))
  base.setUTCDate(base.getUTCDate() + (index % 400) + offsetDays)
  const year = base.getUTCFullYear()
  const month = String(base.getUTCMonth() + 1).padStart(2, "0")
  const day = String(base.getUTCDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function buildItems(
  index: number,
  products: ReturnType<typeof getPurchasableProducts>
): PurchaseRequisitionItem[] {
  if (products.length === 0) return []

  const count = (index % 3) + 1
  return Array.from({ length: count }, (_, itemIndex) => {
    const product = products[(index + itemIndex) % products.length]

    return {
      id: `REQI-${pad(index + 1, 4)}-${itemIndex + 1}`,
      productId: product.id,
      name: product.name,
      unit: product.unit,
      quantityInStock: product.availableQuantity,
      requestedQuantity: ((index + itemIndex) % 5) + 1,
    }
  })
}

function buildMockPurchaseRequisitions(count: number): PurchaseRequisition[] {
  const products = getPurchasableProducts()

  return Array.from({ length: count }, (_, index) => {
    const n = index + 1

    return {
      id: `REQ-${pad(n)}-2082/83`,
      entryDate: dateForIndex(index),
      dueDate: dateForIndex(index, 7),
      status: statuses[index % statuses.length],
      remarks: remarksSamples[index % remarksSamples.length],
      items: buildItems(index, products),
    }
  })
}

export const mockPurchaseRequisitions: PurchaseRequisition[] =
  buildMockPurchaseRequisitions(24)
