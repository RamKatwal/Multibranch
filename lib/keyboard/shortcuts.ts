export type ShortcutCategory =
  | "Global"
  | "Quick Create"
  | "Navigation"
  | "Form Editing"
  | "Transaction Entry"

export type ShortcutAvailability = "available" | "planned"

export type KeyboardShortcutDef = {
  id: string
  /** Display keys, use "Mod" for Ctrl/Cmd */
  keys: string[]
  description: string
  category: ShortcutCategory
  availability: ShortcutAvailability
  /** Optional chord sequence, e.g. ["g", "i"] */
  sequence?: string[]
}

/** Quick-create Alt shortcuts keyed by create menu href */
export const quickCreateShortcuts: Record<
  string,
  { key: string; label: string }
> = {
  "/sales/invoice": { key: "i", label: "Alt+I" },
  "/purchase/invoice": { key: "b", label: "Alt+B" },
  "/purchase/expense": { key: "e", label: "Alt+E" },
  "/purchase/payments": { key: "p", label: "Alt+P" },
  "/sales/payments": { key: "r", label: "Alt+R" },
  "/accounting/journal-voucher": { key: "j", label: "Alt+J" },
  "/sales/customers": { key: "c", label: "Alt+C" },
  "/purchase/suppliers?create=1": { key: "v", label: "Alt+V" },
  "/purchase/order": { key: "o", label: "Alt+O" },
  "/sales/order": { key: "w", label: "Alt+W" },
  "/sales/return": { key: "m", label: "Alt+M" },
  "/purchase/return": { key: "d", label: "Alt+D" },
  "/accounting/contra": { key: "t", label: "Alt+T" },
  "/accounting/bank-accounts": { key: "a", label: "Alt+A" },
}

/** Go-to navigation chords: G then key → href */
export const goToShortcuts: Record<string, { href: string; label: string }> = {
  h: { href: "/", label: "Home" },
  i: { href: "/sales/invoice", label: "Invoices" },
  b: { href: "/purchase/invoice", label: "Bills" },
  c: { href: "/sales/customers", label: "Customers" },
  v: { href: "/purchase/suppliers", label: "Vendors" },
  g: { href: "/accounting/chart-of-accounts", label: "General Ledger" },
  j: { href: "/accounting/journal-voucher", label: "Journal Entries" },
  r: { href: "/reports", label: "Reports" },
  a: { href: "/accounting/chart-of-accounts", label: "Chart of Accounts" },
  p: { href: "/purchase/payments", label: "Payments" },
  t: { href: "/accounting", label: "Tax Center" },
}

/**
 * Preferred G-then key per href when multiple chords share a destination
 * (e.g. CoA is both G G and G A — show G A in the nav).
 */
const preferredGoToKeyByHref: Record<string, string> = {
  "/": "h",
  "/sales/invoice": "i",
  "/purchase/invoice": "b",
  "/customers": "c",
  "/sales/customers": "c",
  "/suppliers": "v",
  "/purchase/suppliers": "v",
  "/accounting/chart-of-accounts": "a",
  "/accounting/journal-voucher": "j",
  "/reports": "r",
  "/purchase/payments": "p",
  "/accounting": "t",
}

/** Shortcut keys for a nav/create href: prefer Go-to chords, else Alt create. */
export function getNavShortcutKeys(href: string): string[] | null {
  const preferredKey = preferredGoToKeyByHref[href]
  if (preferredKey && goToShortcuts[preferredKey]?.href === href) {
    return ["G", preferredKey.toUpperCase()]
  }

  for (const [key, target] of Object.entries(goToShortcuts)) {
    if (target.href === href) {
      return ["G", key.toUpperCase()]
    }
  }

  const create = quickCreateShortcuts[href]
  if (create) {
    return ["Alt", create.key.toUpperCase()]
  }

  return null
}

export const keyboardShortcuts: KeyboardShortcutDef[] = [
  // Global
  {
    id: "command-palette",
    keys: ["Mod", "K"],
    description: "Open the Command Palette",
    category: "Global",
    availability: "available",
  },
  {
    id: "quick-create",
    keys: ["Alt", "N"],
    description: "Open the Quick Create menu",
    category: "Global",
    availability: "available",
  },
  {
    id: "settings",
    keys: ["Mod", ","],
    description: "Open Settings",
    category: "Global",
    availability: "available",
  },
  {
    id: "shortcuts-help",
    keys: ["Mod", "/"],
    description: "Open Keyboard Shortcuts help",
    category: "Global",
    availability: "available",
  },
  {
    id: "page-search",
    keys: ["Mod", "F"],
    description: "Search within the current page or list",
    category: "Global",
    availability: "available",
  },
  {
    id: "global-search",
    keys: ["Mod", "Shift", "F"],
    description: "Open Global Search (Command Palette)",
    category: "Global",
    availability: "available",
  },
  {
    id: "sign-out",
    keys: ["Mod", "Shift", "Q"],
    description: "Sign out of the current session",
    category: "Global",
    availability: "available",
  },
  {
    id: "save",
    keys: ["Mod", "S"],
    description: "Save the current record",
    category: "Global",
    availability: "planned",
  },
  {
    id: "save-new",
    keys: ["Mod", "Shift", "S"],
    description: "Save and create a new record",
    category: "Global",
    availability: "planned",
  },
  {
    id: "save-post",
    keys: ["Mod", "Enter"],
    description: "Save, Post, or Save & Close",
    category: "Global",
    availability: "planned",
  },
  {
    id: "print",
    keys: ["Mod", "P"],
    description: "Print the current document",
    category: "Global",
    availability: "planned",
  },
  {
    id: "escape",
    keys: ["Esc"],
    description: "Close dialogs, drawers, menus, or cancel",
    category: "Global",
    availability: "available",
  },
  {
    id: "toggle-sidebar",
    keys: ["Mod", "B"],
    description: "Toggle the sidebar",
    category: "Global",
    availability: "available",
  },

  // Quick Create
  {
    id: "create-invoice",
    keys: ["Alt", "I"],
    description: "Create Invoice",
    category: "Quick Create",
    availability: "available",
  },
  {
    id: "create-bill",
    keys: ["Alt", "B"],
    description: "Create Bill",
    category: "Quick Create",
    availability: "available",
  },
  {
    id: "create-expense",
    keys: ["Alt", "E"],
    description: "Create Expense",
    category: "Quick Create",
    availability: "available",
  },
  {
    id: "create-payment",
    keys: ["Alt", "P"],
    description: "Create Payment",
    category: "Quick Create",
    availability: "available",
  },
  {
    id: "receive-payment",
    keys: ["Alt", "R"],
    description: "Receive Payment",
    category: "Quick Create",
    availability: "available",
  },
  {
    id: "create-journal",
    keys: ["Alt", "J"],
    description: "Create Journal Entry",
    category: "Quick Create",
    availability: "available",
  },
  {
    id: "create-customer",
    keys: ["Alt", "C"],
    description: "Create Customer",
    category: "Quick Create",
    availability: "available",
  },
  {
    id: "create-vendor",
    keys: ["Alt", "V"],
    description: "Create Vendor",
    category: "Quick Create",
    availability: "available",
  },
  {
    id: "create-po",
    keys: ["Alt", "O"],
    description: "Create Purchase Order",
    category: "Quick Create",
    availability: "available",
  },
  {
    id: "create-so",
    keys: ["Alt", "W"],
    description: "Create Sales Order",
    category: "Quick Create",
    availability: "available",
  },
  {
    id: "create-credit-memo",
    keys: ["Alt", "M"],
    description: "Create Credit Memo",
    category: "Quick Create",
    availability: "available",
  },
  {
    id: "create-debit-note",
    keys: ["Alt", "D"],
    description: "Create Debit Note",
    category: "Quick Create",
    availability: "available",
  },
  {
    id: "create-transfer",
    keys: ["Alt", "T"],
    description: "Create Fund Transfer",
    category: "Quick Create",
    availability: "available",
  },
  {
    id: "create-bank",
    keys: ["Alt", "A"],
    description: "Create Bank Account",
    category: "Quick Create",
    availability: "available",
  },

  // Navigation (G then …)
  {
    id: "goto-home",
    keys: ["G", "H"],
    sequence: ["g", "h"],
    description: "Go to Home",
    category: "Navigation",
    availability: "available",
  },
  {
    id: "goto-invoices",
    keys: ["G", "I"],
    sequence: ["g", "i"],
    description: "Go to Invoices",
    category: "Navigation",
    availability: "available",
  },
  {
    id: "goto-bills",
    keys: ["G", "B"],
    sequence: ["g", "b"],
    description: "Go to Bills",
    category: "Navigation",
    availability: "available",
  },
  {
    id: "goto-customers",
    keys: ["G", "C"],
    sequence: ["g", "c"],
    description: "Go to Customers",
    category: "Navigation",
    availability: "available",
  },
  {
    id: "goto-vendors",
    keys: ["G", "V"],
    sequence: ["g", "v"],
    description: "Go to Vendors",
    category: "Navigation",
    availability: "available",
  },
  {
    id: "goto-gl",
    keys: ["G", "G"],
    sequence: ["g", "g"],
    description: "Go to General Ledger / Chart of Accounts",
    category: "Navigation",
    availability: "available",
  },
  {
    id: "goto-journal",
    keys: ["G", "J"],
    sequence: ["g", "j"],
    description: "Go to Journal Entries",
    category: "Navigation",
    availability: "available",
  },
  {
    id: "goto-reports",
    keys: ["G", "R"],
    sequence: ["g", "r"],
    description: "Go to Reports",
    category: "Navigation",
    availability: "available",
  },
  {
    id: "goto-coa",
    keys: ["G", "A"],
    sequence: ["g", "a"],
    description: "Go to Chart of Accounts",
    category: "Navigation",
    availability: "available",
  },
  {
    id: "goto-payments",
    keys: ["G", "P"],
    sequence: ["g", "p"],
    description: "Go to Payments",
    category: "Navigation",
    availability: "available",
  },
  {
    id: "goto-tax",
    keys: ["G", "T"],
    sequence: ["g", "t"],
    description: "Go to Tax Center / Accounting",
    category: "Navigation",
    availability: "available",
  },

  // Form Editing
  {
    id: "next-field",
    keys: ["Tab"],
    description: "Move to the next field",
    category: "Form Editing",
    availability: "available",
  },
  {
    id: "prev-field",
    keys: ["Shift", "Tab"],
    description: "Move to the previous field",
    category: "Form Editing",
    availability: "available",
  },
  {
    id: "open-dropdown",
    keys: ["Alt", "Down"],
    description: "Open a dropdown list",
    category: "Form Editing",
    availability: "planned",
  },
  {
    id: "toggle-checkbox",
    keys: ["Space"],
    description: "Toggle a checkbox",
    category: "Form Editing",
    availability: "available",
  },
  {
    id: "insert-row",
    keys: ["Insert"],
    description: "Add a new row to a table or line items",
    category: "Form Editing",
    availability: "planned",
  },
  {
    id: "delete-row",
    keys: ["Delete"],
    description: "Delete the selected row",
    category: "Form Editing",
    availability: "planned",
  },
  {
    id: "edit-row",
    keys: ["F2"],
    description: "Edit the selected row or record",
    category: "Form Editing",
    availability: "planned",
  },

  // Transaction Entry
  {
    id: "dup-line",
    keys: ["Mod", "D"],
    description: "Duplicate the current line",
    category: "Transaction Entry",
    availability: "planned",
  },
  {
    id: "dup-txn",
    keys: ["Mod", "Shift", "D"],
    description: "Duplicate the entire transaction",
    category: "Transaction Entry",
    availability: "planned",
  },
  {
    id: "move-row-up",
    keys: ["Mod", "Up"],
    description: "Move the selected row up",
    category: "Transaction Entry",
    availability: "planned",
  },
  {
    id: "move-row-down",
    keys: ["Mod", "Down"],
    description: "Move the selected row down",
    category: "Transaction Entry",
    availability: "planned",
  },
  {
    id: "delete-line",
    keys: ["Mod", "Backspace"],
    description: "Delete the selected line",
    category: "Transaction Entry",
    availability: "planned",
  },
  {
    id: "add-line",
    keys: ["Alt", "Plus"],
    description: "Add a new line item",
    category: "Transaction Entry",
    availability: "planned",
  },
  {
    id: "remove-line",
    keys: ["Alt", "Minus"],
    description: "Remove the selected line item",
    category: "Transaction Entry",
    availability: "planned",
  },
]

export const shortcutCategories: ShortcutCategory[] = [
  "Global",
  "Quick Create",
  "Navigation",
  "Form Editing",
  "Transaction Entry",
]
