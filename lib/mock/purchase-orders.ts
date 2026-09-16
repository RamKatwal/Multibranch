import { calculateItemAmount, calculatePurchaseOrderTotals } from "@/lib/purchase-orders/calculations"
import { getProductDetailById, mockProducts } from "@/lib/mock/products"
import { mockPaymentTerms } from "@/lib/mock/payment-terms"
import { mockSuppliers } from "@/lib/mock/suppliers"
import type {
  PurchaseOrder,
  PurchaseOrderItem,
  PurchaseOrderStatus,
  PurchaseOrderVatOption,
} from "@/types/purchase-order"

export type PurchasableProduct = {
  id: string
  name: string
  category: string
  availableQuantity: number
  rate: number
  unit: string
  discountPercent: number
  vat: PurchaseOrderVatOption
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
        discountPercent: detail?.discountPercent ?? 0,
        vat: detail?.tax ? "vat" : "no-vat",
      }
    })
}

/**
 * Minimal reference list standing in for the Purchase Requisition module,
 * which is still a stub page in this codebase. Only used to power the
 * Purchase Order "Reference" field and "Ref. Requisition" column.
 */
export type PurchaseRequisitionRef = {
  id: string
  supplierId: string
}

export const mockPurchaseRequisitionRefs: PurchaseRequisitionRef[] = [
  { id: "REQ-000001-2082/83", supplierId: "SUP1" },
  { id: "REQ-000002-2082/83", supplierId: "SUP1" },
  { id: "REQ-000003-2082/83", supplierId: "SUP2" },
]

const statuses: PurchaseOrderStatus[] = [
  "approved",
  "draft",
  "for-approval",
  "cancelled",
]

const remarksSamples = [
  "",
  "Urgent restock for Kathmandu hub.",
  "Match last quarter pricing.",
  "Hold delivery until warehouse confirms space.",
  "Seasonal purchase — confirm lead time.",
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
  products: PurchasableProduct[]
): PurchaseOrderItem[] {
  if (products.length === 0) return []

  const count = (index % 3) + 1
  return Array.from({ length: count }, (_, itemIndex) => {
    const product = products[(index + itemIndex) % products.length]
    const quantity = ((index + itemIndex) % 5) + 1
    const rate = product.rate
    const discountPercent = product.discountPercent
    const vat = product.vat

    return {
      id: `POI-${pad(index + 1, 4)}-${itemIndex + 1}`,
      productId: product.id,
      name: product.name,
      unit: product.unit,
      quantity,
      rate,
      discountPercent,
      vat,
      amount: calculateItemAmount({ quantity, rate, discountPercent }),
    }
  })
}

function buildMockPurchaseOrders(count: number): PurchaseOrder[] {
  const suppliers = mockSuppliers.filter((supplier) => supplier.status === "active")
  const products = getPurchasableProducts()
  const paymentTerms = mockPaymentTerms.filter((term) => term.status === "active")

  return Array.from({ length: count }, (_, index) => {
    const n = index + 1
    const supplier = suppliers[index % Math.max(suppliers.length, 1)]
    const reference = mockPurchaseRequisitionRefs.find(
      (ref) => ref.supplierId === supplier?.id
    )
    const paymentTerm = paymentTerms[index % Math.max(paymentTerms.length, 1)]
    const items = buildItems(index, products)
    const provisionalSubTotal = items.reduce((sum, item) => sum + item.amount, 0)
    const additionalDiscount =
      index % 4 === 0 ? Math.round(provisionalSubTotal * 0.05) : 0
    const totals = calculatePurchaseOrderTotals(items, additionalDiscount)

    return {
      id: `PO-${pad(n)}-2082/83`,
      supplierId: supplier?.id ?? "",
      supplier: supplier?.name ?? "Unknown supplier",
      referenceId: reference?.id ?? "",
      reference: reference?.id ?? "",
      entryDate: dateForIndex(index),
      deliveryDate: dateForIndex(index, 7),
      paymentPeriodId: paymentTerm?.id ?? "",
      paymentPeriod: paymentTerm?.name ?? "",
      status: statuses[index % statuses.length],
      remarks: remarksSamples[index % remarksSamples.length],
      entryBy: entryBySamples[index % entryBySamples.length],
      items,
      additionalDiscount,
      ...totals,
    }
  })
}

export const mockPurchaseOrders: PurchaseOrder[] = buildMockPurchaseOrders(64)
