import { mockSalesPayments } from "@/lib/mock/sales-payments"
import {
  SALES_PAYMENT_MODES,
  SALES_PAYMENT_STATUSES,
  type SalesPayment,
} from "@/types/sales-payment"

/**
 * Client-side stub. No sales-payment API exists yet — persist to
 * localStorage instead of guessing at a contract.
 */
const SALES_PAYMENTS_STORAGE_KEY = "ibmerp-sales-payments-v1"

function canUseStorage() {
  return typeof window !== "undefined"
}

function isCurrentSchema(payment: SalesPayment): boolean {
  return (
    typeof payment.id === "string" &&
    typeof payment.customerId === "string" &&
    typeof payment.entryDate === "string" &&
    typeof payment.amount === "number" &&
    SALES_PAYMENT_STATUSES.includes(payment.status) &&
    SALES_PAYMENT_MODES.includes(payment.mode)
  )
}

function clonePayments(payments: SalesPayment[]): SalesPayment[] {
  return payments.map((payment) => ({ ...payment }))
}

export function readSalesPayments(): SalesPayment[] {
  if (!canUseStorage()) return clonePayments(mockSalesPayments)

  try {
    const raw = window.localStorage.getItem(SALES_PAYMENTS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as SalesPayment[]
      if (Array.isArray(parsed)) {
        return parsed.filter(isCurrentSchema)
      }
    }
  } catch {
    // Fall back to mock seed data.
  }

  return clonePayments(mockSalesPayments)
}

export function saveSalesPayments(payments: SalesPayment[]) {
  if (!canUseStorage()) return payments
  window.localStorage.setItem(
    SALES_PAYMENTS_STORAGE_KEY,
    JSON.stringify(payments)
  )
  return payments
}

export function getSalesPaymentById(id: string): SalesPayment | undefined {
  return readSalesPayments().find((payment) => payment.id === id)
}

export function createSalesPaymentId(existing: SalesPayment[]) {
  const used = new Set(existing.map((payment) => payment.id))
  let next = existing.length + 1
  let id = `SPR-${String(next).padStart(6, "0")}-2082/83`

  while (used.has(id)) {
    next += 1
    id = `SPR-${String(next).padStart(6, "0")}-2082/83`
  }

  return id
}
