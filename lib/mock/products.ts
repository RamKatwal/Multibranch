import { getBranchesByIds } from "@/lib/companies/options"
import type {
  Product,
  ProductDetail,
  ProductStockValuation,
} from "@/types/product"

export const productCategories = [
  "All",
  "Mobile",
  "Laptop",
  "Accessories",
  "Appliances",
  "Furniture",
  "Stationery",
  "Groceries",
  "Apparel",
  "Services",
  "Product Category 1",
  "Product Category 2",
] as const

const branchIdsList = [
  "br_ht_01",
  "br_ht_02",
  "comp_10881-head-office",
  "br_ev_01",
  "br_ev_02",
  "br_ev_03",
  "br_ev_04",
  "br_hq_01",
]

export const mockProducts: Product[] = [
  {
    id: "PRD1",
    name: "Iphone 15",
    totalQuantity: 5,
    category: "Mobile",
    type: "goods",
    entryBy: "ram",
    status: "active",
    createdBranchId: "br_ht_01",
    addedBranchIds: ["br_ht_01", "br_ht_02", "comp_10881-head-office"],
  },
  {
    id: "PRD2",
    name: "Samsung Galaxy S24",
    totalQuantity: 12,
    category: "Mobile",
    type: "goods",
    entryBy: "admin",
    status: "active",
    createdBranchId: "comp_10881-head-office",
    addedBranchIds: ["comp_10881-head-office", "br_ht_01"],
  },
  {
    id: "PRD3",
    name: "MacBook Air M3",
    totalQuantity: 8,
    category: "Laptop",
    type: "goods",
    entryBy: "gopal",
    status: "active",
    createdBranchId: "br_ht_02",
    addedBranchIds: ["br_ht_02", "br_ht_01", "comp_10881-head-office"],
  },
  {
    id: "PRD4",
    name: "Dell XPS 13",
    totalQuantity: 3,
    category: "Laptop",
    type: "goods",
    entryBy: "farah",
    status: "active",
    createdBranchId: "br_ev_01",
    addedBranchIds: ["br_ev_01"],
  },
  {
    id: "PRD5",
    name: "USB-C Charging Cable",
    totalQuantity: 240,
    category: "Accessories",
    type: "goods",
    entryBy: "ram",
    status: "active",
    createdBranchId: "br_ht_01",
    addedBranchIds: ["br_ht_01", "br_ht_02"],
  },
  {
    id: "PRD6",
    name: "Wireless Mouse",
    totalQuantity: 56,
    category: "Accessories",
    type: "goods",
    entryBy: "laxman",
    status: "active",
    createdBranchId: "br_ev_04",
    addedBranchIds: ["br_ev_04"],
  },
  {
    id: "PRD7",
    name: "Microwave Oven 20L",
    totalQuantity: 7,
    category: "Appliances",
    type: "goods",
    entryBy: "kabita",
    status: "active",
    createdBranchId: "br_ev_03",
    addedBranchIds: ["br_ev_03"],
  },
  {
    id: "PRD8",
    name: "Office Desk Chair",
    totalQuantity: 18,
    category: "Furniture",
    type: "goods",
    entryBy: "admin",
    status: "active",
    createdBranchId: "br_ev_02",
    addedBranchIds: ["br_ev_02", "comp_10881-head-office"],
  },
  {
    id: "PRD9",
    name: "A4 Printer Paper (Ream)",
    totalQuantity: 320,
    category: "Stationery",
    type: "goods",
    entryBy: "farah",
    status: "active",
    createdBranchId: "br_hq_01",
    addedBranchIds: ["br_hq_01"],
  },
  {
    id: "PRD10",
    name: "Basmati Rice 25kg",
    totalQuantity: 44,
    category: "Groceries",
    type: "goods",
    entryBy: "gopal",
    status: "active",
    createdBranchId: "br_ht_02",
    addedBranchIds: ["br_ht_02"],
  },
  {
    id: "PRD11",
    name: "Cotton T-Shirt",
    totalQuantity: 130,
    category: "Apparel",
    type: "goods",
    entryBy: "ram",
    status: "active",
    createdBranchId: "br_ht_01",
    addedBranchIds: ["br_ht_01", "br_ev_01"],
  },
  {
    id: "PRD12",
    name: "Annual Maintenance Contract",
    totalQuantity: 0,
    category: "Services",
    type: "service",
    entryBy: "admin",
    status: "active",
    createdBranchId: "comp_10881-head-office",
    addedBranchIds: ["comp_10881-head-office", "br_ht_01", "br_ht_02"],
  },
  {
    id: "PRD13",
    name: "On-site Installation Service",
    totalQuantity: 0,
    category: "Services",
    type: "service",
    entryBy: "laxman",
    status: "active",
    createdBranchId: "br_ev_04",
    addedBranchIds: ["br_ev_04"],
  },
  {
    id: "PRD14",
    name: "iPad Pro 11",
    totalQuantity: 4,
    category: "Mobile",
    type: "goods",
    entryBy: "farah",
    status: "inactive",
    createdBranchId: "br_hq_01",
    addedBranchIds: ["br_hq_01"],
  },
  {
    id: "PRD15",
    name: "Mechanical Keyboard",
    totalQuantity: 26,
    category: "Accessories",
    type: "goods",
    entryBy: "kabita",
    status: "inactive",
    createdBranchId: "br_ev_03",
    addedBranchIds: ["br_ev_03"],
  },
  // Products 16 - 75 generated cleanly
  ...Array.from({ length: 60 }, (_, idx) => {
    const num = idx + 16
    const names = [
      "Google Pixel 8",
      "OnePlus 12",
      "Lenovo ThinkPad X1",
      "HP Pavilion 15",
      "Asus ROG Strix",
      "Bluetooth Speaker",
      "Laptop Backpack",
      "HDMI Cable 2m",
      "Power Bank 20000mAh",
      "Webcam 1080p",
      "Refrigerator 250L",
      "Washing Machine 7kg",
      "Air Conditioner 1.5T",
      "Electric Kettle",
      "Ceiling Fan",
      "Executive Office Table",
      "Bookshelf 5-Tier",
      "Filing Cabinet",
      "Conference Table",
      "Reception Sofa",
      "Ballpoint Pen (Box)",
      "Sticky Notes Pack",
      "Whiteboard Marker Set",
      "Stapler Heavy Duty",
      "Document Folder",
      "Wheat Flour 10kg",
      "Sunflower Oil 5L",
      "Sugar 50kg",
      "Instant Coffee Jar",
      "Green Tea 100 Bags",
      "Denim Jeans",
      "Formal Shirt",
      "Winter Jacket",
      "Running Shoes",
      "Woolen Sweater",
      "Data Recovery Service",
      "Software Setup Service",
      "Network Cabling Service",
      "CCTV Installation Service",
      "Extended Warranty Plan",
      "27-inch Monitor",
      "Gaming Chair",
      "Portable SSD 1TB",
      "Router Dual-Band",
      "Surge Protector",
      "LED Desk Lamp",
      "Standing Desk Converter",
      "Noise-Cancelling Headphones",
      "Smartwatch Series 6",
      "Fitness Band",
      "Coffee Maker",
      "Vacuum Cleaner",
      "Water Purifier",
      "Induction Cooktop",
      "Toaster 2-Slice",
      "Desktop Computer",
      "Graphics Card",
      "RAM Module 16GB",
      "UPS 1000VA",
      "Printer Ink Cartridge",
    ]

    const categoriesList = [
      "Mobile",
      "Laptop",
      "Accessories",
      "Appliances",
      "Furniture",
      "Stationery",
      "Groceries",
      "Apparel",
      "Services",
      "Product Category 1",
      "Product Category 2",
    ]

    const branch = branchIdsList[idx % branchIdsList.length]
    const otherBranches = branchIdsList.filter((b) => b !== branch)
    const assignedBranches = [
      branch,
      ...(idx % 2 === 0 ? [otherBranches[idx % otherBranches.length]] : []),
      ...(idx % 3 === 0 ? [otherBranches[(idx + 1) % otherBranches.length]] : []),
    ]

    const category = categoriesList[idx % categoriesList.length]
    const isService = category === "Services"
    const name = names[idx] ?? `Product Item ${num}`

    return {
      id: `PRD${num}`,
      name,
      totalQuantity: isService ? 0 : ((num * 37) % 400) + 1,
      category,
      type: isService ? ("service" as const) : ("goods" as const),
      entryBy: ["admin", "ram", "farah", "gopal", "laxman", "kabita"][idx % 6],
      status: num % 12 === 0 ? ("inactive" as const) : ("active" as const),
      createdBranchId: branch,
      addedBranchIds: assignedBranches,
    }
  }),
]

export function getProductById(id: string): Product | undefined {
  return mockProducts.find((product) => product.id === id)
}

const stockValuations: ProductStockValuation[] = [
  "FIFO",
  "LIFO",
  "Weighted Average",
]

/**
 * Expands a list-level product into the full record shown on the Product
 * Details page. Fields the demo data does not carry are derived deterministically
 * from the product id so the same product always renders the same values.
 */
export function getProductDetailById(id: string): ProductDetail | undefined {
  const product = getProductById(id)
  if (!product) return undefined

  const seed = Number(id.replace(/\D/g, "")) || 1
  const isService = product.type === "service"
  const holdQuantity = isService ? 0 : (seed - 1) % 3
  const availableQuantity = Math.max(product.totalQuantity - holdQuantity, 0)
  const costPrice = isService ? 0 : ((seed * 53) % 900) + 100

  return {
    ...product,
    alias: null,
    sku: isService ? null : `SKU-${id}`,
    hsCode: null,
    itemCode: null,
    tax: seed % 2 === 0 ? "13% VAT" : null,
    stockValuation: stockValuations[(seed - 1) % stockValuations.length],
    expiryDate: null,
    primaryUnit: isService ? "Job" : "Unit",
    subCategory: null,
    reorderQty: isService ? null : ((seed % 5) + 1) * 5,
    availableQuantity,
    holdQuantity,
    batchTracking: false,
    inventoryManaged: !isService,
    isSellable: true,
    costPrice,
    sellingPrice: Math.round(costPrice * 1.35),
    discountPercent: 0,
    purchaseAccount: isService ? "Purchase Services" : "Purchase Goods",
    salesAccount: isService ? "Sales Services" : "Sales Goods",
    inventoryAccount: "Inventory Account",
    openingQuantity: null,
    openingRate: null,
  }
}

export const PRODUCT_TRANSACTION_TYPES = [
  "Opening",
  "Purchase",
  "Sales",
  "Adjustment",
  "Transfer",
] as const

export type ProductTransactionType = (typeof PRODUCT_TRANSACTION_TYPES)[number]

export type ProductTransaction = {
  id: string
  date: string
  reference: string
  type: ProductTransactionType
  /** Signed quantity: positive is stock in, negative is stock out. */
  quantity: number
}

/**
 * Deterministic mock stock movements for a product, newest first. Services and
 * products with no tracked inventory return an empty list.
 */
export function getProductTransactions(id: string): ProductTransaction[] {
  const product = getProductById(id)
  if (!product || product.type === "service") return []

  const seed = Number(id.replace(/\D/g, "")) || 1
  const rows = (seed % 4) + 4
  const flows: { type: ProductTransactionType; sign: number; prefix: string }[] =
    [
      { type: "Purchase", sign: 1, prefix: "PB" },
      { type: "Sales", sign: -1, prefix: "SL" },
      { type: "Adjustment", sign: 1, prefix: "ADJ" },
      { type: "Transfer", sign: -1, prefix: "TRF" },
    ]

  const baseDate = new Date(2026, 8, 5)

  return Array.from({ length: rows }, (_, idx) => {
    const flow = flows[(seed + idx) % flows.length]
    const date = new Date(baseDate)
    date.setDate(baseDate.getDate() - idx * 3)
    const magnitude = ((seed + idx * 7) % 12) + 1

    return {
      id: `${id}-TXN${idx + 1}`,
      date: date.toISOString().slice(0, 10),
      reference: `${flow.prefix}-${String(1000 + seed * 3 + idx)}/2083-84`,
      type: flow.type,
      quantity: flow.sign * magnitude,
    }
  })
}

export type ProductBranchStock = {
  branchId: string
  branchName: string
  branchCode: string
  availableQuantity: number
  stockIn: number
  stockOut: number
  totalQuantity: number
}

/**
 * Per-branch stock breakdown for a product. Quantities are split across the
 * product's assigned branches and stay deterministic for a given product id.
 */
export function getProductBranchStock(id: string): ProductBranchStock[] {
  const product = getProductById(id)
  if (!product || product.type === "service") return []

  const branchIds =
    product.addedBranchIds?.length
      ? product.addedBranchIds
      : product.createdBranchId
        ? [product.createdBranchId]
        : []

  if (!branchIds.length) return []

  const detail = getProductDetailById(id)
  const seed = Number(id.replace(/\D/g, "")) || 1
  const resolved = getBranchesByIds(branchIds)
  const branchCount = resolved.length || branchIds.length

  const totalAvailable = detail?.availableQuantity ?? product.totalQuantity
  const totalUnits = detail?.totalQuantity ?? product.totalQuantity

  let remainingAvailable = totalAvailable
  let remainingTotal = totalUnits

  return (resolved.length
    ? resolved
    : branchIds.map((branchId) => ({
        id: branchId,
        name: branchId,
        code: branchId.slice(0, 3).toUpperCase(),
        status: "active",
        isHeadOffice: false,
        companyId: "",
        companyName: "",
      }))
  ).map((branch, idx) => {
    const isLast = idx === branchCount - 1
    const share = branchCount - idx
    const availableQuantity = isLast
      ? remainingAvailable
      : Math.floor(remainingAvailable / share)
    const totalQuantity = isLast
      ? remainingTotal
      : Math.floor(remainingTotal / share)

    remainingAvailable -= availableQuantity
    remainingTotal -= totalQuantity

    const stockOut = ((seed + idx * 5) % 8) + 1
    const stockIn = availableQuantity + stockOut

    return {
      branchId: branch.id,
      branchName: branch.name,
      branchCode: branch.code,
      availableQuantity,
      stockIn,
      stockOut,
      totalQuantity,
    }
  })
}
