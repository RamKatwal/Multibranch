export type AccountCategory =
  | "Current Assets"
  | "Non Current Assets"
  | "Current Liability"
  | "Non Current Liability"
  | "Equity"
  | "Income"
  | "Expense"

export type ChartOfAccount = {
  code: string
  name: string
  category: AccountCategory
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
  { code: "COA1", name: "Accounts Receivable", category: "Current Assets" },
  { code: "COA2", name: "Cash in Hand", category: "Current Assets" },
  { code: "COA3", name: "Bank", category: "Current Assets" },
  { code: "COA4", name: "Accounts Payable", category: "Current Liability" },
  { code: "COA5", name: "TDS Payable", category: "Current Liability" },
  { code: "COA6", name: "Sales Revenue", category: "Income" },
  { code: "COA7", name: "Purchases / COGS", category: "Expense" },
  { code: "COA8", name: "Owner's Equity", category: "Equity" },
]

export const ACCOUNTS_RECEIVABLE = "COA1"
export const CASH_IN_HAND = "COA2"
export const BANK = "COA3"
export const ACCOUNTS_PAYABLE = "COA4"
export const TDS_PAYABLE = "COA5"
export const SALES_REVENUE = "COA6"
export const PURCHASES_COGS = "COA7"
export const OWNERS_EQUITY = "COA8"
