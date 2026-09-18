export const ACCOUNT_CATEGORIES = [
  "Current Assets",
  "Non Current Assets",
  "Current Liability",
  "Non Current Liability",
  "Equity",
  "Income",
  "Expense",
] as const

export type AccountCategory = (typeof ACCOUNT_CATEGORIES)[number]

export const ACCOUNT_STATUSES = ["active", "inactive"] as const
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number]

export type ChartOfAccount = {
  code: string
  name: string
  category: AccountCategory
  openingBalance: number
  entryBy: string
  status: AccountStatus
  /** Referenced by lib/reports/** — protected from deletion in the UI. */
  isSystemAccount?: boolean
}

/**
 * A small, fixed chart of accounts standing in for the general ledger this
 * codebase doesn't otherwise model. Balances are derived at report time from
 * purchase/sales order data (see lib/reports/general-ledger.ts) rather than
 * stored — accounts with no real source (Cash, Bank, Owner's Equity) always
 * report zero, matching how a freshly-provisioned tenant looks on the live
 * reference too.
 */
export const mockChartOfAccounts: ChartOfAccount[] = [
  {
    code: "COA1",
    name: "Accounts Receivable",
    category: "Current Assets",
    openingBalance: 0,
    entryBy: "system",
    status: "active",
    isSystemAccount: true,
  },
  {
    code: "COA2",
    name: "Cash in Hand",
    category: "Current Assets",
    openingBalance: 0,
    entryBy: "system",
    status: "active",
    isSystemAccount: true,
  },
  {
    code: "COA3",
    name: "Bank",
    category: "Current Assets",
    openingBalance: 0,
    entryBy: "system",
    status: "active",
    isSystemAccount: true,
  },
  {
    code: "COA4",
    name: "Accounts Payable",
    category: "Current Liability",
    openingBalance: 0,
    entryBy: "system",
    status: "active",
    isSystemAccount: true,
  },
  {
    code: "COA5",
    name: "TDS Payable",
    category: "Current Liability",
    openingBalance: 0,
    entryBy: "system",
    status: "active",
    isSystemAccount: true,
  },
  {
    code: "COA6",
    name: "Sales Revenue",
    category: "Income",
    openingBalance: 0,
    entryBy: "system",
    status: "active",
    isSystemAccount: true,
  },
  {
    code: "COA7",
    name: "Purchases / COGS",
    category: "Expense",
    openingBalance: 0,
    entryBy: "system",
    status: "active",
    isSystemAccount: true,
  },
  {
    code: "COA8",
    name: "Owner's Equity",
    category: "Equity",
    openingBalance: 0,
    entryBy: "system",
    status: "active",
    isSystemAccount: true,
  },
  {
    code: "COA9",
    name: "Inventory",
    category: "Current Assets",
    openingBalance: 0,
    entryBy: "admin",
    status: "active",
  },
  {
    code: "COA10",
    name: "Fixed Assets",
    category: "Non Current Assets",
    openingBalance: 0,
    entryBy: "admin",
    status: "active",
  },
  {
    code: "COA11",
    name: "VAT Payable",
    category: "Current Liability",
    openingBalance: 0,
    entryBy: "admin",
    status: "active",
  },
  {
    code: "COA12",
    name: "Salary Payable",
    category: "Current Liability",
    openingBalance: 0,
    entryBy: "admin",
    status: "active",
  },
  {
    code: "COA13",
    name: "Long Term Loan",
    category: "Non Current Liability",
    openingBalance: 0,
    entryBy: "admin",
    status: "active",
  },
  {
    code: "COA14",
    name: "Retained Earnings",
    category: "Equity",
    openingBalance: 0,
    entryBy: "admin",
    status: "active",
  },
  {
    code: "COA15",
    name: "Rent Expense",
    category: "Expense",
    openingBalance: 0,
    entryBy: "admin",
    status: "active",
  },
  {
    code: "COA16",
    name: "Salary Expense",
    category: "Expense",
    openingBalance: 0,
    entryBy: "admin",
    status: "active",
  },
  {
    code: "COA17",
    name: "Other Income",
    category: "Income",
    openingBalance: 0,
    entryBy: "admin",
    status: "active",
  },
]

export const ACCOUNTS_RECEIVABLE = "COA1"
export const CASH_IN_HAND = "COA2"
export const BANK = "COA3"
export const ACCOUNTS_PAYABLE = "COA4"
export const TDS_PAYABLE = "COA5"
export const SALES_REVENUE = "COA6"
export const PURCHASES_COGS = "COA7"
export const OWNERS_EQUITY = "COA8"
