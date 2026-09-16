import { mockCustomers } from "@/lib/mock/customers"
import {
  type SalesPayment,
  type SalesPaymentMode,
  type SalesPaymentStatus,
} from "@/types/sales-payment"

const statuses: SalesPaymentStatus[] = [
  "approved",
  "draft",
  "for-approval",
  "void",
]

const modes: SalesPaymentMode[] = ["cash", "bank", "cheque", "card"]

const remarksSamples = [
  "",
  "Partial settlement.",
  "Advance against order.",
  "Cleared against overdue invoice.",
  "Received at counter.",
]

const entryBySamples = ["admin", "ram", "farah", "gopal", "laxman", "kabita"]

function pad(value: number, length = 6) {
  return String(value).padStart(length, "0")
}

function dateForIndex(index: number) {
  const base = new Date(Date.UTC(2082, 0, 1))
  base.setUTCDate(base.getUTCDate() + (index % 400))
  const year = base.getUTCFullYear()
  const month = String(base.getUTCMonth() + 1).padStart(2, "0")
  const day = String(base.getUTCDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function buildMockSalesPayments(count: number): SalesPayment[] {
  const customers = mockCustomers.filter((customer) => customer.status === "active")

  return Array.from({ length: count }, (_, index) => {
    const n = index + 1
    const customer = customers[index % Math.max(customers.length, 1)]
    const hasInvoice = index % 3 !== 0

    return {
      id: `SPR-${pad(n)}-2082/83`,
      entryDate: dateForIndex(index),
      customerId: customer?.id ?? "",
      customer: customer?.name ?? "Unknown customer",
      refInvoice: hasInvoice
        ? `SNV-${pad(((index * 7) % 900) + 1)}-2082/83`
        : "",
      amount: 1500 + ((index * 4750) % 180000),
      mode: modes[index % modes.length],
      status: statuses[index % statuses.length],
      remarks: remarksSamples[index % remarksSamples.length],
      entryBy: entryBySamples[index % entryBySamples.length],
    }
  })
}

export const mockSalesPayments: SalesPayment[] = buildMockSalesPayments(72)
