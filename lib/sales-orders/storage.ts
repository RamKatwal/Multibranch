import { mockSalesOrders } from "@/lib/mock/sales-orders"
import {
  SALES_ORDER_STATUSES,
  type SalesOrder,
} from "@/types/sales-order"

/**
 * Client-side stub. No sales-order API exists yet — persist to
 * localStorage instead of guessing at a contract.
 */
const SALES_ORDERS_STORAGE_KEY = "ibmerp-sales-orders-v1"

function canUseStorage() {
  return typeof window !== "undefined"
}

function isCurrentSchema(order: SalesOrder): boolean {
  return (
    typeof order.id === "string" &&
    typeof order.customerId === "string" &&
    typeof order.entryDate === "string" &&
    Array.isArray(order.items) &&
    SALES_ORDER_STATUSES.includes(order.status)
  )
}

function cloneOrders(orders: SalesOrder[]): SalesOrder[] {
  return orders.map((order) => ({
    ...order,
    items: order.items.map((item) => ({ ...item })),
  }))
}

export function readSalesOrders(): SalesOrder[] {
  if (!canUseStorage()) return cloneOrders(mockSalesOrders)

  try {
    const raw = window.localStorage.getItem(SALES_ORDERS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as SalesOrder[]
      if (Array.isArray(parsed)) {
        return parsed.filter(isCurrentSchema)
      }
    }
  } catch {
    // Fall back to mock seed data.
  }

  return cloneOrders(mockSalesOrders)
}

export function saveSalesOrders(orders: SalesOrder[]) {
  if (!canUseStorage()) return orders
  window.localStorage.setItem(SALES_ORDERS_STORAGE_KEY, JSON.stringify(orders))
  return orders
}

export function getSalesOrderById(id: string): SalesOrder | undefined {
  return readSalesOrders().find((order) => order.id === id)
}

export function createSalesOrderId(existing: SalesOrder[]) {
  const used = new Set(existing.map((order) => order.id))
  let next = existing.length + 1
  let id = `SO-${String(next).padStart(6, "0")}-2082/83`

  while (used.has(id)) {
    next += 1
    id = `SO-${String(next).padStart(6, "0")}-2082/83`
  }

  return id
}

export function createSalesOrderItemId(index: number) {
  return `SOI-${Date.now().toString().slice(-5)}-${index + 1}`
}
