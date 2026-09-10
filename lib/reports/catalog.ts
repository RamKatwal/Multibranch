import {
  BoxesIcon,
  LandmarkIcon,
  ReceiptTextIcon,
  ScrollTextIcon,
  ShoppingCartIcon,
  TrendingUpIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"

export type ReportLink = {
  title: string
  /** Present only for reports that are actually built. */
  href?: string
}

export type ReportCategory = {
  id: string
  title: string
  icon: LucideIcon
  reports: ReportLink[]
}

/**
 * The full Reports catalogue shown on the `/reports` landing page. Only entries
 * with an `href` navigate; the rest render muted until they are built.
 */
export const reportCatalog: ReportCategory[] = [
  {
    id: "inventory",
    title: "Inventory",
    icon: BoxesIcon,
    reports: [
      {
        title: "Inventory Valuation Report",
        href: "/reports/inventory-valuation",
      },
      { title: "Batch-wise Inventory Valuation" },
      { title: "Inventory Master" },
      { title: "Reorder Inventory Report" },
      { title: "Expiry Inventory Report" },
    ],
  },
  {
    id: "purchase",
    title: "Purchase",
    icon: ShoppingCartIcon,
    reports: [
      { title: "Purchase Requisition" },
      { title: "Purchase Order" },
      { title: "Purchase Book" },
      { title: "Purchase Return" },
      { title: "Purchase by Item – Summary Report" },
      { title: "Purchase by Item – Monthly Report" },
    ],
  },
  {
    id: "sales",
    title: "Sales",
    icon: ReceiptTextIcon,
    reports: [
      { title: "Sales Quotation" },
      { title: "Sales Order" },
      { title: "Delivery Note" },
      { title: "Returns Delivery Note" },
      { title: "Sales Book" },
      { title: "Sales Return" },
      { title: "Sales by Item – Summary Report" },
      { title: "Sales by Item – Monthly Report" },
    ],
  },
  {
    id: "supplier",
    title: "Supplier Reports",
    icon: UsersIcon,
    reports: [
      { title: "Supplier Summary" },
      { title: "Supplier Ledger" },
      { title: "Supplier Transaction" },
      { title: "Supplier Ageing" },
      { title: "Supplier Bill Ageing" },
    ],
  },
  {
    id: "customer",
    title: "Customer Reports",
    icon: UsersIcon,
    reports: [
      { title: "Customer Summary" },
      { title: "Customer Ledger" },
      { title: "Customer Transaction" },
      { title: "Customer Ageing" },
      { title: "Customer Bill Ageing" },
    ],
  },
  {
    id: "accounting",
    title: "Accounting",
    icon: LandmarkIcon,
    reports: [
      { title: "Trial Balance" },
      { title: "Balance Sheet" },
      { title: "Profit Loss Statement" },
      { title: "General Ledger" },
      { title: "Transaction Report/Day Book" },
    ],
  },
  {
    id: "tax",
    title: "Tax Reports",
    icon: ScrollTextIcon,
    reports: [
      { title: "Sales Register" },
      { title: "Sales Return Register" },
      { title: "Purchase Register" },
      { title: "Purchase Return Register" },
      { title: "VAT Summary Report" },
      { title: "TDS Report" },
      { title: "Annex 5 Materialized View Report" },
      { title: "Annex 13 Report" },
    ],
  },
  {
    id: "financial-position",
    title: "Financial Position Reports",
    icon: TrendingUpIcon,
    reports: [
      { title: "Financial Overview" },
      { title: "Financial Transactions" },
    ],
  },
]
