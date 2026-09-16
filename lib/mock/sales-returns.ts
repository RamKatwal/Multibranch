import { mockCustomers } from "@/lib/mock/customers"
import type { SalesReturn, SalesReturnStatus } from "@/types/sales-return"

const statuses: SalesReturnStatus[] = ["approved", "draft", "for-approval", "void"]
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

function buildMockSalesReturns(count: number): SalesReturn[] {
  const customers = mockCustomers.filter((customer) => customer.status === "active")

  return Array.from({ length: count }, (_, index) => {
    const n = index + 1
    const customer = customers[index % Math.max(customers.length, 1)]

    return {
      id: `SRT-${pad(n)}-2082/83`,
      entryDate: dateForIndex(index),
      customerId: customer?.id ?? "",
      customer: customer?.name ?? "Unknown customer",
      refInvoice: `SNV-${pad(((index * 11) % 900) + 1)}-2082/83`,
      totalAmount: 5000 + ((index * 9850) % 320000),
      status: statuses[index % statuses.length],
      entryBy: entryBySamples[index % entryBySamples.length],
    }
  })
}

export const mockSalesReturns: SalesReturn[] = buildMockSalesReturns(80)
