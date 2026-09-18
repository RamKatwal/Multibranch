export const BANK_ACCOUNT_TYPES = ["current", "savings", "overdraft"] as const
export const BANK_ACCOUNT_STATUSES = ["active", "inactive"] as const

export type BankAccountType = (typeof BANK_ACCOUNT_TYPES)[number]
export type BankAccountStatus = (typeof BANK_ACCOUNT_STATUSES)[number]

export type BankAccount = {
  id: string
  bankName: string
  accountName: string
  accountNumber: string
  branchName: string
  accountType: BankAccountType
  /** Chart of accounts code this bank account posts to, e.g. "COA3". */
  glCode: string
  openingBalance: number
  entryBy: string
  status: BankAccountStatus
}

export const bankAccountTypeLabels: Record<BankAccountType, string> = {
  current: "Current",
  savings: "Savings",
  overdraft: "Overdraft",
}

export const bankAccountStatusLabels: Record<BankAccountStatus, string> = {
  active: "Active",
  inactive: "Inactive",
}
