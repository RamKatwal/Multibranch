import { mockPurchaseOrders } from "@/lib/mock/purchase-orders"
import {
  PURCHASE_ORDER_STATUSES,
  type PurchaseOrder,
} from "@/types/purchase-order"

/**
 * Client-side stub. No purchase-order API exists yet — persist to
 * localStorage instead of guessing at a contract.
 */
const PURCHASE_ORDERS_STORAGE_KEY = "ibmerp-purchase-orders-v1"

function canUseStorage() {
  return typeof window !== "undefined"
}

function isCurrentSchema(order: PurchaseOrder): boolean {
  return (
    typeof order.id === "string" &&
    typeof order.supplierId === "string" &&
    Array.isArray(order.items) &&
    PURCHASE_ORDER_STATUSES.includes(order.status)
  )
}

function cloneOrders(orders: PurchaseOrder[]): PurchaseOrder[] {
  return orders.map((order) => ({
    ...order,
    items: order.items.map((item) => ({ ...item })),
  }))
}

export function readPurchaseOrders(): PurchaseOrder[] {
  if (!canUseStorage()) return cloneOrders(mockPurchaseOrders)

  try {
    const raw = window.localStorage.getItem(PURCHASE_ORDERS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as PurchaseOrder[]
      if (Array.isArray(parsed)) {
        return parsed.filter(isCurrentSchema)
      }
    }
  } catch {
    // Fall back to mock seed data.
  }

  return cloneOrders(mockPurchaseOrders)
}

export function savePurchaseOrders(orders: PurchaseOrder[]) {
  if (!canUseStorage()) return orders
  window.localStorage.setItem(
    PURCHASE_ORDERS_STORAGE_KEY,
    JSON.stringify(orders)
  )
  return orders
}

export function getPurchaseOrderById(id: string): PurchaseOrder | undefined {
  return readPurchaseOrders().find((order) => order.id === id)
}

export function createPurchaseOrderId(existing: PurchaseOrder[]) {
  const used = new Set(existing.map((order) => order.id))
  let next = existing.length + 1
  let id = `PO-${String(next).padStart(6, "0")}-2082/83`

  while (used.has(id)) {
    next += 1
    id = `PO-${String(next).padStart(6, "0")}-2082/83`
  }

  return id
}

export function createPurchaseOrderItemId(index: number) {
  return `POI-${Date.now().toString().slice(-5)}-${index + 1}`
}
