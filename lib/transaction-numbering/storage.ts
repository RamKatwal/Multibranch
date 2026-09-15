import { mockTransactionNumbering } from "@/lib/mock/transaction-numbering"
import type { TransactionNumberingRule } from "@/types/transaction-numbering"

const TRANSACTION_NUMBERING_STORAGE_KEY = "ibmerp-transaction-numbering-v1"

export function readTransactionNumbering(): TransactionNumberingRule[] {
  try {
    const saved = window.localStorage.getItem(TRANSACTION_NUMBERING_STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved) as TransactionNumberingRule[]
    }
  } catch {
    // Fall back to mock seed data.
  }

  return mockTransactionNumbering.map((rule) => ({ ...rule }))
}

export function saveTransactionNumbering(rules: TransactionNumberingRule[]) {
  window.localStorage.setItem(
    TRANSACTION_NUMBERING_STORAGE_KEY,
    JSON.stringify(rules)
  )
  return rules
}
