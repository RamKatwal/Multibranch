import { mockSalesReturns } from "@/lib/mock/sales-returns"
import {
  SALES_RETURN_STATUSES,
  type SalesReturn,
} from "@/types/sales-return"

/**
 * Client-side stub. No sales-return API exists yet — persist to
 * localStorage instead of guessing at a contract.
 */
const SALES_RETURNS_STORAGE_KEY = "ibmerp-sales-returns-v1"

function canUseStorage() {
  return typeof window !== "undefined"
}

function isCurrentSchema(entry: SalesReturn): boolean {
  return (
    typeof entry.id === "string" &&
    typeof entry.customerId === "string" &&
    typeof entry.entryDate === "string" &&
    typeof entry.totalAmount === "number" &&
    SALES_RETURN_STATUSES.includes(entry.status)
  )
}

function cloneReturns(returns: SalesReturn[]): SalesReturn[] {
  return returns.map((entry) => ({ ...entry }))
}

export function readSalesReturns(): SalesReturn[] {
  if (!canUseStorage()) return cloneReturns(mockSalesReturns)

  try {
    const raw = window.localStorage.getItem(SALES_RETURNS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as SalesReturn[]
      if (Array.isArray(parsed)) {
        return parsed.filter(isCurrentSchema)
      }
    }
  } catch {
    // Fall back to mock seed data.
  }

  return cloneReturns(mockSalesReturns)
}

export function saveSalesReturns(returns: SalesReturn[]) {
  if (!canUseStorage()) return returns
  window.localStorage.setItem(SALES_RETURNS_STORAGE_KEY, JSON.stringify(returns))
  return returns
}

export function getSalesReturnById(id: string): SalesReturn | undefined {
  return readSalesReturns().find((entry) => entry.id === id)
}

export function createSalesReturnId(existing: SalesReturn[]) {
  const used = new Set(existing.map((entry) => entry.id))
  let next = existing.length + 1
  let id = `SRT-${String(next).padStart(6, "0")}-2082/83`

  while (used.has(id)) {
    next += 1
    id = `SRT-${String(next).padStart(6, "0")}-2082/83`
  }

  return id
}
