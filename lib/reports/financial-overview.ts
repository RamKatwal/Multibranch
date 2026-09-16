import { BANK, CASH_IN_HAND } from "@/lib/mock/chart-of-accounts"

export type FinancialOverviewRow = {
  glCode: string
  account: string
  openingBalance: number
  inAmount: number
  outAmount: number
  closingBalance: number
}

export type FinancialAccountOption = { id: string; name: string }

export function getFinancialAccountOptions(): FinancialAccountOption[] {
  return [
    { id: CASH_IN_HAND, name: "Cash in Hand" },
    { id: BANK, name: "Bank" },
  ]
}

/**
 * Cash/Bank account movements aren't modeled anywhere in this codebase (no
 * payments module exists yet), so every account genuinely reports zero —
 * matching a freshly-provisioned tenant on the live reference too.
 */
export function getFinancialOverviewReport(): FinancialOverviewRow[] {
  return getFinancialAccountOptions().map((account) => ({
    glCode: account.id,
    account: account.name,
    openingBalance: 0,
    inAmount: 0,
    outAmount: 0,
    closingBalance: 0,
  }))
}
