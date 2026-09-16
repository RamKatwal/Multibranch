import type { PurchaseReturn, PurchaseReturnStatus } from "@/types/purchase-return"

const suppliers = [
  "Robert Hood",
  "Summit Supplies",
  "Green Valley Traders",
  "Metro Hardware",
  "Alpine Distributors",
  "Horizon Parts Co.",
  "Nexus Trading",
  "Cedarline Stores",
  "Pacific Imports",
  "Valley Forge Ltd.",
  "Brightway Logistics",
  "Everest Merchants",
] as const

const statuses: PurchaseReturnStatus[] = [
  "approved",
  "draft",
  "for-approval",
  "void",
]

const entryBySamples = ["admin", "ram", "farah", "gopal", "laxman", "kabita"]

function pad(value: number, length = 6) {
  return String(value).padStart(length, "0")
}

function entryDateForIndex(index: number) {
  const base = new Date(Date.UTC(2082, 0, 1))
  base.setUTCDate(base.getUTCDate() + (index % 400))
  const year = base.getUTCFullYear()
  const month = String(base.getUTCMonth() + 1).padStart(2, "0")
  const day = String(base.getUTCDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function buildMockPurchaseReturns(count: number): PurchaseReturn[] {
  return Array.from({ length: count }, (_, index) => {
    const n = index + 1

    return {
      id: `RET-${pad(n)}-2082/83`,
      entryDate: entryDateForIndex(index),
      supplier: suppliers[index % suppliers.length],
      refInvoice: `PIN-${pad(((index * 11) % 900) + 1)}-2082/83`,
      totalAmount: 8500 + ((index * 13750) % 485000),
      status: statuses[index % statuses.length],
      entryBy: entryBySamples[index % entryBySamples.length],
    }
  })
}

export const mockPurchaseReturns: PurchaseReturn[] =
  buildMockPurchaseReturns(320)
