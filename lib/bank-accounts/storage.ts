import { mockBankAccounts } from "@/lib/mock/bank-accounts"
import type { BankAccount } from "@/types/bank-account"

const BANK_ACCOUNTS_STORAGE_KEY = "ibmerp-bank-accounts-v1"

export function readBankAccounts(): BankAccount[] {
  try {
    const saved = window.localStorage.getItem(BANK_ACCOUNTS_STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved) as BankAccount[]
    }
  } catch {
    // Fall back to mock seed data.
  }

  return mockBankAccounts.map((account) => ({ ...account }))
}

export function saveBankAccounts(accounts: BankAccount[]) {
  window.localStorage.setItem(
    BANK_ACCOUNTS_STORAGE_KEY,
    JSON.stringify(accounts)
  )
  return accounts
}

export function createBankAccountId(accounts: BankAccount[]) {
  const max = accounts.reduce((highest, account) => {
    const match = /^BNK(\d+)$/i.exec(account.id)
    if (!match) return highest
    return Math.max(highest, Number(match[1]))
  }, 0)

  return `BNK${max + 1}`
}
