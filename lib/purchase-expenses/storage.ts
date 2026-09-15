import { mockPurchaseExpenses } from "@/lib/mock/purchase-expenses"
import {
  PURCHASE_EXPENSE_STATUSES,
  type PurchaseExpense,
} from "@/types/purchase-expense"

/**
 * Client-side stub. No purchase-expense API exists yet — persist to
 * localStorage instead of guessing at a contract.
 */
const PURCHASE_EXPENSES_STORAGE_KEY = "ibmerp-purchase-expenses-v1"

function canUseStorage() {
  return typeof window !== "undefined"
}

function isCurrentSchema(expense: PurchaseExpense): boolean {
  return (
    typeof expense.id === "string" &&
    typeof expense.mode === "string" &&
    typeof expense.entryDate === "string" &&
    Array.isArray(expense.items) &&
    PURCHASE_EXPENSE_STATUSES.includes(expense.status)
  )
}

function cloneExpenses(expenses: PurchaseExpense[]): PurchaseExpense[] {
  return expenses.map((expense) => ({
    ...expense,
    items: expense.items.map((item) => ({ ...item })),
  }))
}

export function readPurchaseExpenses(): PurchaseExpense[] {
  if (!canUseStorage()) return cloneExpenses(mockPurchaseExpenses)

  try {
    const raw = window.localStorage.getItem(PURCHASE_EXPENSES_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as PurchaseExpense[]
      if (Array.isArray(parsed)) {
        return parsed.filter(isCurrentSchema)
      }
    }
  } catch {
    // Fall back to mock seed data.
  }

  return cloneExpenses(mockPurchaseExpenses)
}

export function savePurchaseExpenses(expenses: PurchaseExpense[]) {
  if (!canUseStorage()) return expenses
  window.localStorage.setItem(
    PURCHASE_EXPENSES_STORAGE_KEY,
    JSON.stringify(expenses)
  )
  return expenses
}

export function getPurchaseExpenseById(id: string): PurchaseExpense | undefined {
  return readPurchaseExpenses().find((expense) => expense.id === id)
}

export function createPurchaseExpenseId(existing: PurchaseExpense[]) {
  const used = new Set(existing.map((expense) => expense.id))
  let next = existing.length + 1
  let id = `EXP-${String(next).padStart(6, "0")}-2082/83`

  while (used.has(id)) {
    next += 1
    id = `EXP-${String(next).padStart(6, "0")}-2082/83`
  }

  return id
}

export function createPurchaseExpenseItemId(index: number) {
  return `EXI-${Date.now().toString().slice(-5)}-${index + 1}`
}
