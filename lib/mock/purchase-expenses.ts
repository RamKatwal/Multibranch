import { calculatePurchaseExpenseTotals } from "@/lib/purchase-expenses/calculations"
import { mockSuppliers } from "@/lib/mock/suppliers"
import type {
  PurchaseExpense,
  PurchaseExpenseItem,
  PurchaseExpenseMode,
  PurchaseExpensePaymentStatus,
  PurchaseExpenseStatus,
  PurchaseExpenseVatOption,
} from "@/types/purchase-expense"

export type ExpenseAccount = {
  id: string
  name: string
}

/** Expense category accounts, used for the "with bill" line-item account picker. */
export const mockExpenseAccounts: ExpenseAccount[] = [
  { id: "COA10", name: "Office Supplies" },
  { id: "COA11", name: "Rent Expense" },
  { id: "COA12", name: "Utilities" },
  { id: "COA13", name: "Travel & Transportation" },
  { id: "COA14", name: "Staff Welfare" },
  { id: "COA15", name: "Repair & Maintenance" },
  { id: "COA16", name: "Printing & Stationery" },
  { id: "COA17", name: "Miscellaneous Expense" },
]

/** Cash/bank accounts, used for the "without bill" Paid From picker. */
export const mockPaidFromAccounts: ExpenseAccount[] = [
  { id: "COA3", name: "Cash in Hand" },
  { id: "COA5", name: "Bank Account - NIC Asia" },
]

/**
 * Minimal reference list standing in for the payment-terms module, which
 * lives on a different, not-yet-merged branch. Only used to power the
 * Purchase Expense "Payment Period" field.
 */
export type PaymentPeriodRef = {
  id: string
  name: string
}

export const mockExpensePaymentPeriods: PaymentPeriodRef[] = [
  { id: "PT1", name: "Immediate" },
  { id: "PT2", name: "Net 7" },
  { id: "PT3", name: "Net 15" },
  { id: "PT4", name: "Net 30" },
]

const statuses: PurchaseExpenseStatus[] = [
  "approved",
  "draft",
  "for-approval",
  "cancelled",
]

const paymentStatuses: PurchaseExpensePaymentStatus[] = [
  "paid",
  "unpaid",
  "partially-paid",
]

const descriptionSamples = [
  "Monthly office rent",
  "Electricity and water bill",
  "Courier and delivery charges",
  "Staff tea and refreshments",
  "Printer cartridge and paper",
  "Vehicle fuel and maintenance",
  "Internet and phone bill",
  "Sundry office expense",
]

const remarksSamples = [
  "",
  "Reimbursed from petty cash.",
  "Approved by branch manager.",
  "Recurring monthly expense.",
  "One-off vendor charge.",
]

function pad(value: number, length = 6) {
  return String(value).padStart(length, "0")
}

function dateForIndex(index: number, offsetDays = 0) {
  const base = new Date(Date.UTC(2082, 0, 1))
  base.setUTCDate(base.getUTCDate() + (index % 400) + offsetDays)
  const year = base.getUTCFullYear()
  const month = String(base.getUTCMonth() + 1).padStart(2, "0")
  const day = String(base.getUTCDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function buildItems(index: number, mode: PurchaseExpenseMode): PurchaseExpenseItem[] {
  const count = (index % 2) + 1
  return Array.from({ length: count }, (_, itemIndex) => {
    const account = mockExpenseAccounts[(index + itemIndex) % mockExpenseAccounts.length]
    const amount = ((index + itemIndex) % 12) * 250 + 500
    const vat: PurchaseExpenseVatOption =
      mode === "with-bill" && (index + itemIndex) % 2 === 0 ? "vat" : "no-vat"

    return {
      id: `EXI-${pad(index + 1, 4)}-${itemIndex + 1}`,
      accountId: account.id,
      account: account.name,
      vat,
      amount,
      description: descriptionSamples[(index + itemIndex) % descriptionSamples.length],
    }
  })
}

function buildMockPurchaseExpenses(count: number): PurchaseExpense[] {
  const suppliers = mockSuppliers.filter((supplier) => supplier.status === "active")

  return Array.from({ length: count }, (_, index) => {
    const n = index + 1
    const mode: PurchaseExpenseMode = index % 3 === 0 ? "without-bill" : "with-bill"
    const items = buildItems(index, mode)
    const totals = calculatePurchaseExpenseTotals(items)
    const supplier = mode === "with-bill" ? suppliers[index % Math.max(suppliers.length, 1)] : undefined
    const paymentPeriod =
      mode === "with-bill"
        ? mockExpensePaymentPeriods[index % mockExpensePaymentPeriods.length]
        : undefined
    const paidFrom =
      mode === "without-bill"
        ? mockPaidFromAccounts[index % mockPaidFromAccounts.length]
        : undefined

    return {
      id: `EXP-${pad(n)}-2082/83`,
      mode,
      supplierId: supplier?.id ?? "",
      supplier: supplier?.name ?? "",
      invoiceNumber: mode === "with-bill" ? `INV-${pad(n, 4)}` : "",
      entryDate: dateForIndex(index),
      invoiceDate: mode === "with-bill" ? dateForIndex(index) : "",
      paymentPeriodId: paymentPeriod?.id ?? "",
      paymentPeriod: paymentPeriod?.name ?? "",
      paidFromId: paidFrom?.id ?? "",
      paidFrom: paidFrom?.name ?? "",
      status: statuses[index % statuses.length],
      paymentStatus: paymentStatuses[index % paymentStatuses.length],
      tds: mode === "with-bill" && index % 5 === 0,
      quickPayment: mode === "without-bill",
      remarks: remarksSamples[index % remarksSamples.length],
      items,
      ...totals,
    }
  })
}

export const mockPurchaseExpenses: PurchaseExpense[] = buildMockPurchaseExpenses(48)
