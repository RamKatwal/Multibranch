import {
  DuoAccountingIcon,
  DuoBankAccountsIcon,
  DuoChartOfAccountsIcon,
  DuoChequesIcon,
  DuoConfigurationsIcon,
  DuoDeliveryNoteIcon,
  DuoExpenseIcon,
  DuoHomeIcon,
  DuoInventoryIcon,
  DuoOrderIcon,
  DuoPaymentsIcon,
  DuoProductCategoryIcon,
  DuoProductsIcon,
  DuoPurchaseIcon,
  DuoQuotationIcon,
  DuoReportsIcon,
  DuoRequisitionIcon,
  DuoReturnDeliveryNoteIcon,
  DuoReturnIcon,
  DuoSalesIcon,
  DuoSettingsIcon,
  DuoStockAdjustmentIcon,
  DuoUnitIcon,
  DuoUsersIcon,
} from "@/components/icons/duo"
import { getConfigurationsItemByHref } from "@/config/configurations-navigation"
import { getSettingsItemByHref } from "@/config/settings-navigation"
import { getUsersPermissionsItemByHref } from "@/config/users-permissions-navigation"

import type { NavItem } from "@/types/navigation"

export const mainNavigation: NavItem[] = [
  {
    title: "Home",
    href: "/",
    icon: DuoHomeIcon,
  },
  {
    title: "Inventory",
    href: "/inventory",
    icon: DuoInventoryIcon,
    children: [
      {
        title: "Products",
        href: "/inventory/products",
        icon: DuoProductsIcon,
        description: "Manage product catalog and item details.",
      },
      {
        title: "Product Category",
        href: "/inventory/product-category",
        icon: DuoProductCategoryIcon,
        description: "Organize products into categories and groups.",
      },
      {
        title: "Unit",
        href: "/inventory/unit",
        icon: DuoUnitIcon,
        description: "Define measurement units for inventory items.",
      },
      {
        title: "Stock Adjustment",
        href: "/inventory/stock-adjustment",
        icon: DuoStockAdjustmentIcon,
        description: "Adjust stock levels and reconcile inventory.",
      },
      {
        title: "Stock Transfer",
        href: "/inventory/stock-transfer",
        icon: DuoStockAdjustmentIcon,
        description: "Move stock between branches with itemised transfers.",
      },
      {
        title: "Stock Transfer 2",
        href: "/inventory/stock-transfer-2",
        icon: DuoStockAdjustmentIcon,
        description: "Alternate stock transfer flow between branches.",
      },
    ],
  },
  {
    title: "Purchase",
    href: "/purchase",
    icon: DuoPurchaseIcon,
    children: [
      {
        title: "Return",
        href: "/purchase/return",
        icon: DuoReturnIcon,
        description: "Process purchase returns and credit notes.",
      },
      {
        title: "Order",
        href: "/purchase/order",
        icon: DuoOrderIcon,
        description: "Create and track purchase orders.",
      },
      {
        title: "Requisition",
        href: "/purchase/requisition",
        icon: DuoRequisitionIcon,
        description: "Submit and approve purchase requisitions.",
      },
      {
        title: "Expense",
        href: "/purchase/expense",
        icon: DuoExpenseIcon,
        description: "Record and manage purchase expenses.",
      },
      {
        title: "Payments",
        href: "/purchase/payments",
        icon: DuoPaymentsIcon,
        description: "Track supplier payments and settlements.",
      },
      {
        title: "Suppliers",
        href: "/purchase/suppliers",
        icon: DuoUsersIcon,
        description: "Manage supplier profiles and contact details.",
      },
    ],
  },
  {
    title: "Sales",
    href: "/sales",
    icon: DuoSalesIcon,
    children: [
      {
        title: "Return",
        href: "/sales/return",
        icon: DuoReturnIcon,
        description: "Handle sales returns and refunds.",
      },
      {
        title: "Order",
        href: "/sales/order",
        icon: DuoOrderIcon,
        description: "Manage customer sales orders.",
      },
      {
        title: "Quotation",
        href: "/sales/quotation",
        icon: DuoQuotationIcon,
        description: "Create and send sales quotations.",
      },
      {
        title: "Delivery Note",
        href: "/sales/delivery-note",
        icon: DuoDeliveryNoteIcon,
        description: "Issue delivery notes for shipments.",
      },
      {
        title: "Return Delivery Note",
        href: "/sales/return-delivery-note",
        icon: DuoReturnDeliveryNoteIcon,
        description: "Process returned goods delivery notes.",
      },
      {
        title: "Payments",
        href: "/sales/payments",
        icon: DuoPaymentsIcon,
        description: "Record customer payments and receipts.",
      },
      {
        title: "Customers",
        href: "/sales/customers",
        icon: DuoUsersIcon,
        description: "Manage customer profiles and contact details.",
      },
    ],
  },
  {
    title: "Accounting",
    href: "/accounting",
    icon: DuoAccountingIcon,
    children: [
      {
        title: "Chart of Accounts",
        href: "/accounting/chart-of-accounts",
        icon: DuoChartOfAccountsIcon,
        description: "Manage account structure and ledgers.",
      },
      {
        title: "Bank Accounts",
        href: "/accounting/bank-accounts",
        icon: DuoBankAccountsIcon,
        description: "Configure and monitor bank accounts.",
      },
      {
        title: "Cheques",
        href: "/accounting/cheques",
        icon: DuoChequesIcon,
        description: "Track issued and received cheques.",
      },
    ],
  },
  {
    title: "Reports",
    href: "/reports",
    icon: DuoReportsIcon,
  },
  {
    title: "Configurations",
    href: "/configurations",
    icon: DuoSettingsIcon,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: DuoConfigurationsIcon,
  },
]

export const appBrand = {
  name: "Omniverse",
  plan: "Platform",
  /** Default company mark — reuse whenever a company logo is needed. */
  logo: "/omniverse-logo.png",
}

export function getNavItemByHref(href: string): NavItem | undefined {
  for (const item of mainNavigation) {
    if (item.href === href) {
      return item
    }

    if (item.children) {
      const child = item.children.find((entry) => entry.href === href)

      if (child) {
        return child
      }
    }
  }

  return undefined
}

export type BreadcrumbEntry = {
  title: string
  href?: string
}

function formatSegmentTitle(segment: string) {
  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export function getBreadcrumbs(pathname: string): BreadcrumbEntry[] {
  if (pathname === "/") {
    return [{ title: "Home" }]
  }

  const crumbs: BreadcrumbEntry[] = []
  const segments = pathname.split("/").filter(Boolean)
  let currentPath = ""

  for (const segment of segments) {
    currentPath += `/${segment}`
    const navItem = getNavItemByHref(currentPath)
    const isLast = currentPath === pathname

    crumbs.push({
      title:
        navItem?.title ??
        getConfigurationsItemByHref(currentPath)?.title ??
        getUsersPermissionsItemByHref(currentPath)?.title ??
        getSettingsItemByHref(currentPath)?.title ??
        formatSegmentTitle(segment),
      href: isLast ? undefined : currentPath,
    })
  }

  return crumbs
}
