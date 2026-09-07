import {
  getProductDetailById,
  mockProducts,
} from "@/lib/mock/products"
import type {
  StockTransfer,
  StockTransferItem,
  StockTransferStatus,
} from "@/types/stock-transfer"

export type TransferableProduct = {
  id: string
  name: string
  category: string
  availableQuantity: number
  rate: number
  unit: string
}

/** Active goods products available for transfer line selection. */
export function getTransferableProducts(): TransferableProduct[] {
  return mockProducts
    .filter((product) => product.type === "goods" && product.status === "active")
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

/** Branch options offered in the From / To branch selectors. */
export const stockTransferBranches = [
  "Head Office",
  "Kathmandu Branch",
  "Pokhara Branch",
  "Biratnagar Branch",
  "Butwal Branch",
  "Birgunj Branch",
] as const

/** Item catalog offered when adding rows to a stock transfer. */
export const stockTransferItemCatalog = [
  "Iphone 15",
  "Samsung Galaxy S24",
  "MacBook Air M3",
  "Dell XPS 13",
  "Logitech MX Master 3",
  "USB-C Cable 2m",
  "Office Chair",
  "A4 Paper Ream",
  "Ballpoint Pen (Box)",
  "HDMI Cable",
] as const

const statuses: StockTransferStatus[] = ["completed", "in-transit", "draft"]

const entryUsers = ["ram", "admin", "farah", "gopal", "laxman", "kabita"]

const remarksPool = [
  "Restocking retail floor",
  "Damaged units pulled for return",
  "Seasonal demand rebalance",
  "New branch opening stock",
  "Warehouse consolidation",
  "",
]

function pad(value: number, length = 4) {
  return String(value).padStart(length, "0")
}

function dateForIndex(index: number) {
  const base = new Date(Date.UTC(2026, 0, 1))
  base.setUTCDate(base.getUTCDate() + ((index * 3) % 240))
  const year = base.getUTCFullYear()
  const month = String(base.getUTCMonth() + 1).padStart(2, "0")
  const day = String(base.getUTCDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function buildItems(index: number): StockTransferItem[] {
  const count = (index % 3) + 1
  return Array.from({ length: count }, (_, itemIdx) => {
    const name =
      stockTransferItemCatalog[(index + itemIdx) % stockTransferItemCatalog.length]
    const quantity = ((index + itemIdx) % 8) + 1
    const rate = 500 + (((index + itemIdx) * 375) % 45000)
    return {
      id: `ITM-${pad(index + 1)}-${itemIdx + 1}`,
      name,
      quantity,
      rate,
      totalPrice: quantity * rate,
    }
  })
}

function buildMockStockTransfers(count: number): StockTransfer[] {
  return Array.from({ length: count }, (_, index) => {
    const n = index + 1
    const items = buildItems(index)
    const fromBranch =
      stockTransferBranches[index % stockTransferBranches.length]
    const toBranch =
      stockTransferBranches[(index + 2) % stockTransferBranches.length]

    return {
      id: `TRF-${pad(n)}-2082-83`,
      fromBranch,
      toBranch,
      date: dateForIndex(index),
      remarks: remarksPool[index % remarksPool.length],
      items,
      totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
      totalAmount: items.reduce((sum, item) => sum + item.totalPrice, 0),
      entryBy: entryUsers[index % entryUsers.length],
      status: statuses[index % statuses.length],
    }
  })
}

export const mockStockTransfers: StockTransfer[] = buildMockStockTransfers(48)
