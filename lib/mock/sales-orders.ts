import { getProductDetailById, mockProducts } from "@/lib/mock/products"
import { mockCustomers } from "@/lib/mock/customers"
import {
  SALES_ORDER_VAT_RATE,
  type SalesOrder,
  type SalesOrderItem,
  type SalesOrderStatus,
  type SalesOrderVatOption,
} from "@/types/sales-order"

export type SellableProduct = {
  id: string
  name: string
  category: string
  availableQuantity: number
  rate: number
  unit: string
  vat: SalesOrderVatOption
}

/** Active catalog products available for sales-order line selection. */
export function getSellableProducts(): SellableProduct[] {
  return mockProducts
    .filter((product) => product.status === "active")
    .map((product) => {
      const detail = getProductDetailById(product.id)
      return {
        id: product.id,
        name: product.name,
        category: product.category,
        availableQuantity: detail?.availableQuantity ?? product.totalQuantity,
        rate: detail?.sellingPrice ?? 0,
        unit: detail?.primaryUnit ?? "Unit",
        vat: detail?.tax ? "vat" : "no-vat",
      }
    })
}

const statuses: SalesOrderStatus[] = ["approved", "draft", "for-approval", "cancelled"]

const remarksSamples = [
  "",
  "Rush delivery requested.",
  "Match quoted pricing.",
  "Hold until customer confirms address.",
  "Repeat order — same terms as last time.",
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

function calculateItemAmount(quantity: number, rate: number, discountPercent: number) {
  const gross = quantity * rate
  const discount = gross * (discountPercent / 100)
  return Math.max(gross - discount, 0)
}

function buildItems(index: number, products: SellableProduct[]): SalesOrderItem[] {
  if (products.length === 0) return []

  const count = (index % 3) + 1
  return Array.from({ length: count }, (_, itemIndex) => {
    const product = products[(index + itemIndex) % products.length]
    const quantity = ((index + itemIndex) % 5) + 1
    const rate = product.rate
    const discountPercent = index % 5 === 0 ? 5 : 0

    return {
      id: `SOI-${pad(index + 1, 4)}-${itemIndex + 1}`,
      productId: product.id,
      name: product.name,
      unit: product.unit,
      quantity,
      rate,
      discountPercent,
      vat: product.vat,
      amount: calculateItemAmount(quantity, rate, discountPercent),
    }
  })
}

function buildMockSalesOrders(count: number): SalesOrder[] {
  const customers = mockCustomers.filter((customer) => customer.status === "active")
  const products = getSellableProducts()

  return Array.from({ length: count }, (_, index) => {
    const n = index + 1
    const customer = customers[index % Math.max(customers.length, 1)]
    const items = buildItems(index, products)

    const subTotal = items.reduce((sum, item) => sum + item.amount, 0)
    const taxableTotal = items
      .filter((item) => item.vat === "vat")
      .reduce((sum, item) => sum + item.amount, 0)
    const nonTaxableTotal = subTotal - taxableTotal
    const vatAmount = taxableTotal * SALES_ORDER_VAT_RATE
    const additionalDiscount = index % 4 === 0 ? Math.round(subTotal * 0.03) : 0
    const grandTotal = Math.max(subTotal - additionalDiscount + vatAmount, 0)

    return {
      id: `SO-${pad(n)}-2082/83`,
      customerId: customer?.id ?? "",
      customer: customer?.name ?? "Unknown customer",
      entryDate: dateForIndex(index),
      deliveryDate: dateForIndex(index, 5),
      status: statuses[index % statuses.length],
      remarks: remarksSamples[index % remarksSamples.length],
      entryBy: entryBySamples[index % entryBySamples.length],
      items,
      additionalDiscount,
      subTotal,
      taxableTotal,
      nonTaxableTotal,
      vatAmount,
      grandTotal,
    }
  })
}

export const mockSalesOrders: SalesOrder[] = buildMockSalesOrders(64)
