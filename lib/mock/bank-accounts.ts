import type { BankAccount } from "@/types/bank-account"

export const mockBankAccounts: BankAccount[] = [
  {
    id: "BNK1",
    bankName: "Nabil Bank",
    accountName: "Omniverse Trading Pvt. Ltd.",
    accountNumber: "0123456789012",
    branchName: "Durbar Marg",
    accountType: "current",
    glCode: "COA3",
    openingBalance: 250000,
    entryBy: "admin",
    status: "active",
  },
  {
    id: "BNK2",
    bankName: "Nepal Investment Mega Bank",
    accountName: "Omniverse Trading Pvt. Ltd.",
    accountNumber: "9988776655001",
    branchName: "New Road",
    accountType: "savings",
    glCode: "COA3",
    openingBalance: 75000,
    entryBy: "admin",
    status: "active",
  },
]
