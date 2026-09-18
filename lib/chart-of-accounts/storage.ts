import { mockChartOfAccounts } from "@/lib/mock/chart-of-accounts"
import type { ChartOfAccount } from "@/lib/mock/chart-of-accounts"

const CHART_OF_ACCOUNTS_STORAGE_KEY = "ibmerp-chart-of-accounts-v1"

export function readChartOfAccounts(): ChartOfAccount[] {
  try {
    const saved = window.localStorage.getItem(CHART_OF_ACCOUNTS_STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved) as ChartOfAccount[]
    }
  } catch {
    // Fall back to mock seed data.
  }

  return mockChartOfAccounts.map((account) => ({ ...account }))
}

export function saveChartOfAccounts(accounts: ChartOfAccount[]) {
  window.localStorage.setItem(
    CHART_OF_ACCOUNTS_STORAGE_KEY,
    JSON.stringify(accounts)
  )
  return accounts
}

export function createAccountCode(accounts: ChartOfAccount[]) {
  const max = accounts.reduce((highest, account) => {
    const match = /^COA(\d+)$/i.exec(account.code)
    if (!match) return highest
    return Math.max(highest, Number(match[1]))
  }, 0)

  return `COA${max + 1}`
}
