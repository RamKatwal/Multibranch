# Pages to build — local codebase vs. live reference

Comparison of this codebase (`Multibranch`, branded **Omniverse**) against the live reference build at `https://erp-tan-rho.vercel.app/`, crawled screen-by-screen. Screenshots are saved under `design-refs/`.

**Important caveats — read before using this table:**

- **The working tree changed while this audit was running.** A large, uncommitted restructuring of `configurations/*` → `settings/*` was in progress in this repo during the crawl (new `settings/company-info`, `settings/billing-plans`, `settings/notification`, `settings/user-activities`, new `components/settings/*` feature folders, a new `templates/` dir and `scripts/build-pages.sh`, plus deletions of the old `configurations/billing-plans` and `configurations/general/company-configuration`). This table reflects the filesystem as of the final check; if that work is still ongoing, re-run the audit before relying on this for planning.
- **`CLAUDE.md` had an unrelated, unexplained block appended to it** (referencing `src/components/ui`, `src/styles/tokens.css`, `legacy/**`, Storybook, a "Providhy" design system) that doesn't match this repo. Flagged for the user; not used as input to this audit — the real library is `components/ui` at the repo root.
- **The live reference itself is partly unfinished.** Many of its screens render only "This module is ready for implementation." — the same placeholder pattern this codebase already uses (`ModulePage`). Where both sides are stubs, Status is `missing` (not yet a real feature to compare against), not a defect.
- Dynamic detail/edit/create sub-routes (e.g. `/inventory/products/[productId]`, `/inventory/stock-transfer/create`) are **not** individually rowed below — the crawl couldn't reliably open a live detail record in the time budgeted, so only their parent list screens are compared.

## Status legend

- **missing** — no real feature on the local side (stub placeholder only), even if a route file exists.
- **outdated** — built locally, but has a confirmed design-system violation or a real functional gap vs. the live version.
- **done** — built locally with the shared design system, matching or exceeding the live version.

## Main comparison

| Route | Live URL | Exists in codebase? | Uses design system? | Status | Screenshot path |
|---|---|---|---|---|---|
| `/` (Home) | `/` | Yes | Partial — 2 dashboard widgets (`Transactions`, `Payable Ageing`) use a hand-rolled tab bar (`dashboard-widget-tabs.tsx`) instead of `components/ui/tabs` | outdated | `design-refs/home.png` |
| `/inventory` | `/inventory` | Yes | Yes | done | `design-refs/inventory.png` |
| `/inventory/products` | `/inventory/products` | Yes | Yes | done | `design-refs/inventory-products.png` |
| `/inventory/product-category` | `/inventory/product-category` | Yes (stub) | Yes | missing | `design-refs/inventory-product-category.png` |
| `/inventory/unit` | `/inventory/unit` | Yes (stub) | Yes | missing | `design-refs/inventory-unit.png` |
| `/inventory/stock-adjustment` | `/inventory/stock-adjustment` | Yes (stub) | Yes | missing | `design-refs/inventory-stock-adjustment.png` |
| `/inventory/stock-transfer` | `/inventory/stock-transfer` | Yes | Yes | done | `design-refs/inventory-stock-transfer.png` |
| `/purchase` | `/purchase` | Yes | Yes | done | `design-refs/purchase.png` |
| `/purchase/return` | `/purchase/return` | Yes | Yes | done | `design-refs/purchase-return.png` |
| `/purchase/order` | `/purchase/order` | Yes (stub) | Yes | missing | `design-refs/purchase-order.png` |
| `/purchase/requisition` | `/purchase/requisition` | Yes (stub) | Yes | missing | `design-refs/purchase-requisition.png` |
| `/purchase/expense` | `/purchase/expense` | Yes (stub) | Yes | missing | `design-refs/purchase-expense.png` |
| `/purchase/payments` | `/purchase/payments` | Yes (stub) | Yes | missing | `design-refs/purchase-payments.png` |
| `/purchase/suppliers` | `/purchase/suppliers` | Yes | Yes | done | `design-refs/purchase-suppliers.png` |
| `/sales` | `/sales` | Yes | Yes | done | `design-refs/sales.png` |
| `/sales/return` | `/sales/return` | Yes (stub) | Yes | missing | `design-refs/sales-return.png` |
| `/sales/order` | `/sales/order` | Yes (stub) | Yes | missing | `design-refs/sales-order.png` |
| `/sales/quotation` | `/sales/quotation` | Yes (stub) | Yes | missing | `design-refs/sales-quotation.png` |
| `/sales/delivery-note` | `/sales/delivery-note` | Yes (stub) | Yes | missing | `design-refs/sales-delivery-note.png` |
| `/sales/return-delivery-note` | `/sales/return-delivery-note` | Yes (stub) | Yes | missing | `design-refs/sales-return-delivery-note.png` |
| `/sales/payments` | `/sales/payments` | Yes (stub) | Yes | missing | `design-refs/sales-payments.png` |
| `/sales/customers` | `/sales/customers` | Yes | Yes | done | `design-refs/sales-customers.png` |
| `/accounting` | `/accounting` | Yes | Yes | done | `design-refs/accounting.png` |
| `/accounting/chart-of-accounts` | `/accounting/chart-of-accounts` | Yes (stub) | Yes | missing | `design-refs/accounting-chart-of-accounts.png` |
| `/accounting/bank-accounts` | `/accounting/bank-accounts` | Yes (stub) | Yes | missing | `design-refs/accounting-bank-accounts.png` |
| `/accounting/cheques` | `/accounting/cheques` | Yes (stub) | Yes | missing | `design-refs/accounting-cheques.png` |
| `/reports` | `/reports` | Yes — local is a full report catalog with search; live renders nearly empty | Yes | done | `design-refs/reports.png` |
| `/reports/inventory-valuation` | `/reports/inventory-valuation` → **404 on live** | Yes, fully built locally | Yes | done | `design-refs/reports-inventory-valuation-404.png` |
| `/configurations` | `/configurations` → live redirects straight to Company Profile | Yes — local shows a card-grid overview (consistent with Inventory/Purchase/Sales/Accounting landing pattern) instead of redirecting | Yes | done¹ | — |
| `/settings/company-info` | `/configurations/general/company-configuration` (moved) | Yes, at a new path | Yes | done | `design-refs/configurations-company-profile.png` |
| `/configurations/general/product-configuration` | `/configurations/general/product-configuration` | Yes, fully built | Yes | done | `design-refs/configurations-product-configuration.png` |
| `/configurations/general/payment-terms` | `/configurations/general/payment-terms` | Yes, fully built | Yes | done | `design-refs/configurations-payment-terms.png` |
| `/configurations/general/cost-terms` | `/configurations/general/cost-terms` | Yes, fully built | Yes | done | `design-refs/configurations-cost-terms.png` |
| `/configurations/general/document-template` | `/configurations/general/document-template` | Yes, fully built | Yes | done | `design-refs/configurations-document-template.png` |
| `/configurations/users/group-management` | `/configurations/users/group-management` ("User Roles") | Yes, fully built | Yes | done | `design-refs/configurations-user-roles.png` |
| `/configurations/users/user-management` | `/configurations/users/user-management` | Yes, fully built | Yes | done | `design-refs/configurations-user-management.png` |
| `/configurations/users/permission-management` | `/configurations/users/permission-management` (stub on live) | Yes, fully built locally (exceeds live) | Yes | done | `design-refs/configurations-permission-management.png` |
| `/settings/billing-plans` | `/configurations/billing-plans` (moved) | Yes, at a new path | Yes | done | `design-refs/configurations-billing-plans.png` |
| — (Settings modal → Profile, no dedicated route) | Settings modal → Profile | Yes, as a modal panel | Yes | done | `design-refs/settings-profile.png` |
| `/settings/notification` (+ Settings modal → Notifications) | Settings modal → Notifications | Yes | Yes | done | `design-refs/settings-notifications.png` |
| — (Settings modal → Appearance, no dedicated route) | Settings modal → Appearance | Yes, as a modal panel | Partial — the Light/Dark/System mode switch is a hand-rolled 3-button segmented control instead of `components/ui/tabs` | outdated | `design-refs/settings-appearance.png` |
| `/settings/user-activities` (+ Settings modal → User Activities) | Settings modal → User Activities | Yes | Yes | done | `design-refs/settings-user-activities.png` |

¹ Structural difference only (grid overview vs. auto-redirect to first sub-page) — a product decision, not flagged as a defect.

## Local-only pages (no live counterpart found)

These exist in the codebase but have no matching screen on the live reference — either genuinely ahead of it, or scaffolding/demo routes:

| Route | Notes |
|---|---|
| `/configurations/general/tds-type` | Fully built locally; not present in live's "General Setting" nav at all |
| `/configurations/general/transaction-numbering` | Fully built locally; not present in live's "General Setting" nav at all |
| `/configurations/general/branch-management` | Not present in live's "General Setting" nav |
| `/inventory/stock-transfer-2` (+ `create`, `[transferId]`, `[transferId]/edit`) | Parallel/alternate stock-transfer flow kept alongside the original; no live equivalent |
| `/onboarding/company`, `/onboarding/plan`, `/onboarding/payment/checkout`, `/onboarding/payment/return`, `/onboarding/branches`, `/onboarding/users` | Signup/onboarding flow — the live deployment is pre-authenticated as an existing tenant, so this flow isn't reachable there |
| `/signin`, `/signup`, `/verification`, `/branch-selector` | Auth-adjacent screens, same reason as above |
| `/inv_demo`, `/inv_demo/[invoiceId]` | Looks like a scratch/demo route, not part of the main nav |
| `/suppliers`, `/customers` | Thin redirects to `/purchase/suppliers` and `/sales/customers` respectively — not separate screens |

## Live-only items, out of scope

The signed-in user menu on live also lists **My Agents**, **Usage**, and **API Keys** — these look like leftover items from whatever SaaS starter template the deployment was built on, not ERP features, and have no local equivalent. No action suggested unless you know these are meant to be real product features.

## Design-system audit summary (local codebase)

Repo-wide check for ad-hoc styling (inline `style={{}}`, raw `<table>`/`<button>`/`<input>` outside the shared primitives, hardcoded hex colors) found the codebase largely disciplined. Two confirmed violations of the repo's own `.cursor/rules/ui-tabs.mdc` rule ("use only `@/components/ui/tabs`, no one-off tab bars"):

1. `components/dashboard/home/dashboard-widget-tabs.tsx` — hand-rolled tab bar, used by the Home dashboard's Transactions and Payable Ageing widgets.
2. `components/settings/appearance-settings-panel.tsx` — hand-rolled Light/Dark/System segmented control.

Everything else flagged by the initial greps (dynamic inline styles for computed values like chart colors/progress widths, raw `<table>` markup in spreadsheet-style/detail-view components that reuse the shared `data-table` style tokens, hex colors only in the chart lib and the Google brand icon) turned out to be legitimate on inspection.
