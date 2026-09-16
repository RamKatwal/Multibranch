import { getSellableProducts } from "@/lib/mock/sales-orders"
import { mockCustomers } from "@/lib/mock/customers"
import type {
  SalesQuotation,
  SalesQuotationItem,
  SalesQuotationStatus,
} from "@/types/sales-quotation"

const statuses: SalesQuotationStatus[] = [
  "approved",
  "draft",
  "for-approval",
  "cancelled",
]

const remarksSamples = [
  "",
  "Valid for 15 days.",
  "Bulk pricing applied.",
  "Awaiting customer sign-off.",
  "Follow up before due date.",
]

const entryBySamples = ["admin", "ram", "farah", "gopal", "laxman", "kabita"]

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

function buildItems(
  index: number,
  products: ReturnType<typeof getSellableProducts>
): SalesQuotationItem[] {
  if (products.length === 0) return []

  const count = (index % 3) + 1
  return Array.from({ length: count }, (_, itemIndex) => {
    const product = products[(index + itemIndex) % products.length]
    const quantity = ((index + itemIndex) % 5) + 1

    return {
      id: `SQI-${pad(index + 1, 4)}-${itemIndex + 1}`,
      productId: product.id,
      name: product.name,
      unit: product.unit,
      quantity,
      rate: product.rate,
      amount: quantity * product.rate,
    }
  })
}

function buildMockSalesQuotations(count: number): SalesQuotation[] {
  const customers = mockCustomers.filter((customer) => customer.status === "active")
  const products = getSellableProducts()

  return Array.from({ length: count }, (_, index) => {
    const n = index + 1
    const customer = customers[index % Math.max(customers.length, 1)]
    const items = buildItems(index, products)
    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0)

    return {
      id: `SQ-${pad(n)}-2082/83`,
      customerId: customer?.id ?? "",
      customer: customer?.name ?? "Unknown customer",
      entryDate: dateForIndex(index),
      dueDate: dateForIndex(index, 15),
      status: statuses[index % statuses.length],
      remarks: remarksSamples[index % remarksSamples.length],
      entryBy: entryBySamples[index % entryBySamples.length],
      items,
      totalAmount,
    }
  })
}

export const mockSalesQuotations: SalesQuotation[] = buildMockSalesQuotations(20)
