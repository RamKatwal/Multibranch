import { getProductDetailById, mockProducts } from "@/lib/mock/products"
import { mockSuppliers } from "@/lib/mock/suppliers"
import type {
  PurchaseOrder,
  PurchaseOrderItem,
  PurchaseOrderStatus,
} from "@/types/purchase-order"

export type PurchasableProduct = {
  id: string
  name: string
  category: string
  availableQuantity: number
  rate: number
  unit: string
}

/** Active catalog products available for purchase-order line selection. */
export function getPurchasableProducts(): PurchasableProduct[] {
  return mockProducts
    .filter((product) => product.status === "active")
    .map((product) => {
      const detail = getProductDetailById(product.id)
      return {
        id: product.id,
        name: product.name,
        category: product.category,
        availableQuantity: detail?.availableQuantity ?? product.totalQuantity,
        rate: detail?.costPrice ?? 0,
        unit: detail?.primaryUnit ?? "Unit",
      }
    })
}

const statuses: PurchaseOrderStatus[] = [
  "draft",
  "ordered",
  "received",
  "cancelled",
]

const remarksSamples = [
  "",
  "Urgent restock for Kathmandu hub.",
  "Match last quarter pricing.",
  "Hold delivery until warehouse confirms space.",
  "Seasonal purchase — confirm lead time.",
]

function pad(value: number, length = 6) {
  return String(value).padStart(length, "0")
}

function orderDateForIndex(index: number) {
  const base = new Date(Date.UTC(2082, 0, 1))
  base.setUTCDate(base.getUTCDate() + (index % 400))
  const year = base.getUTCFullYear()
  const month = String(base.getUTCMonth() + 1).padStart(2, "0")
  const day = String(base.getUTCDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function buildItems(
  index: number,
  products: PurchasableProduct[]
): PurchaseOrderItem[] {
  if (products.length === 0) return []

  const count = (index % 3) + 1
  return Array.from({ length: count }, (_, itemIndex) => {
    const product = products[(index + itemIndex) % products.length]
    const quantity = ((index + itemIndex) % 5) + 1
    const unitCost = product.rate

    return {
      id: `POI-${pad(index + 1, 4)}-${itemIndex + 1}`,
      productId: product.id,
      name: product.name,
      quantity,
      unitCost,
      totalPrice: quantity * unitCost,
    }
  })
}

function buildMockPurchaseOrders(count: number): PurchaseOrder[] {
  const suppliers = mockSuppliers.filter((supplier) => supplier.status === "active")
  const products = getPurchasableProducts()

  return Array.from({ length: count }, (_, index) => {
    const n = index + 1
    const supplier = suppliers[index % Math.max(suppliers.length, 1)]
    const items = buildItems(index, products)

    return {
      id: `PO-${pad(n)}-2082/83`,
      supplierId: supplier?.id ?? "",
      supplier: supplier?.name ?? "Unknown supplier",
      orderDate: orderDateForIndex(index),
      status: statuses[index % statuses.length],
      remarks: remarksSamples[index % remarksSamples.length],
      items,
      totalAmount: items.reduce((sum, item) => sum + item.totalPrice, 0),
    }
  })
}

export const mockPurchaseOrders: PurchaseOrder[] = buildMockPurchaseOrders(64)
