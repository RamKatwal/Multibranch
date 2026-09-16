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
      {
        title: "Batch-wise Inventory Valuation",
        href: "/reports/inventory-batch-valuation",
      },
      { title: "Inventory Master", href: "/reports/inventory-master" },
      { title: "Reorder Inventory Report", href: "/reports/reorder-inventory" },
      { title: "Expiry Inventory Report", href: "/reports/expiry-inventory" },
    ],
  },
  {
    id: "purchase",
    title: "Purchase",
    icon: ShoppingCartIcon,
    reports: [
      { title: "Purchase Requisition", href: "/reports/purchase-requisition" },
      { title: "Purchase Order", href: "/reports/purchase-order" },
      { title: "Purchase Book", href: "/reports/purchase-book" },
      { title: "Purchase Return", href: "/reports/purchase-return" },
      {
        title: "Purchase by Item – Summary Report",
        href: "/reports/purchase-by-item-summary",
      },
      {
        title: "Purchase by Item – Monthly Report",
        href: "/reports/purchase-by-item-monthly",
      },
    ],
  },
  {
    id: "sales",
    title: "Sales",
    icon: ReceiptTextIcon,
    reports: [
      { title: "Sales Quotation", href: "/reports/sales-quotation" },
      { title: "Sales Order", href: "/reports/sales-order" },
      { title: "Delivery Note", href: "/reports/delivery-note" },
      {
        title: "Returns Delivery Note",
        href: "/reports/delivery-note-return",
      },
      { title: "Sales Book", href: "/reports/sales-book" },
      { title: "Sales Return", href: "/reports/sales-return" },
      {
        title: "Sales by Item – Summary Report",
        href: "/reports/sales-by-item-summary",
      },
      {
        title: "Sales by Item – Monthly Report",
        href: "/reports/sales-by-item-monthly",
      },
    ],
  },
  {
    id: "supplier",
    title: "Supplier Reports",
    icon: UsersIcon,
    reports: [
      { title: "Supplier Summary", href: "/reports/supplier-summary" },
      { title: "Supplier Ledger", href: "/reports/supplier-ledger" },
      { title: "Supplier Transaction", href: "/reports/supplier-transaction" },
      { title: "Supplier Ageing", href: "/reports/supplier-ageing" },
      { title: "Supplier Bill Ageing", href: "/reports/supplier-bill-ageing" },
    ],
  },
  {
    id: "customer",
    title: "Customer Reports",
    icon: UsersIcon,
    reports: [
      { title: "Customer Summary", href: "/reports/customer-summary" },
      { title: "Customer Ledger", href: "/reports/customer-ledger" },
      { title: "Customer Transaction", href: "/reports/customer-transaction" },
      { title: "Customer Ageing", href: "/reports/customer-ageing" },
      { title: "Customer Bill Ageing", href: "/reports/customer-bill-ageing" },
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
