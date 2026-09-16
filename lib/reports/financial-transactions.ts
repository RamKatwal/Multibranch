import { getFinancialAccountOptions } from "@/lib/reports/financial-overview"

export { getFinancialAccountOptions }

export type FinancialTransactionRow = {
  date: string
  account: string
  reference: string
  transaction: string
  inAmount: number
  outAmount: number
  balanceAmount: number
}

/**
 * No cash/bank movements are modeled anywhere in this codebase, so this
 * always reports empty — the same as a freshly-provisioned tenant with no
 * payments recorded on the live reference.
 */
export function getFinancialTransactionsReport(): FinancialTransactionRow[] {
  return []
}
