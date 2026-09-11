# Page Spec: Purchase Order (build from scratch)

## Context
- No live reference exists for this page — erp-tan-rho.vercel.app/purchase/order is
  also a stub ("This module is ready for implementation"). This must be designed
  following this codebase's own existing patterns, not ported from anything external.
- Route: purchase/order
- Structural reference pages (already done, use as pattern source):
  - purchase/suppliers — list view pattern (table, filters, search, row actions)
  - purchase/return — closest functional sibling (a purchase-flow document with line items)
  - inventory/stock-transfer — another document-with-line-items pattern, if useful

## Scope
Build a standard Purchase Order module with:
1. **List view** (purchase/order):
   - Table of purchase orders: Order No., Supplier, Order Date, Status, Total Amount
   - Search/filter consistent with how purchase/suppliers or purchase/return do it
   - "Create" action leading to the create flow
   - Row actions consistent with existing list patterns (view/edit, matching how
     purchase/suppliers or purchase/return handle row actions)
2. **Create/Edit form** (can be a route, drawer, or modal — follow whichever pattern
   purchase/return or inventory/stock-transfer already use for its create/edit flow):
   - Supplier (select)
   - Order Date
   - Line items: Product, Quantity, Unit Cost (repeatable row, add/remove)
   - Status (Draft/Ordered/Received/Cancelled, or match whatever status vocabulary
     other document types in this app already use)
   - Remarks/notes field
   - Total calculation (sum of line items)

## Components to reuse
- components/ui/table (or whatever the list pages use)
- components/ui/tabs — only if needed, and only the shared component, per CLAUDE.md
- Form components already used in purchase/return or inventory/stock-transfer's create flow
- Do not invent new list/table/form primitives — this module should look and behave
  like a sibling of the existing done modules, not a new design language.

## Out of scope
- Do not touch purchase/suppliers, purchase/return, or any other existing page.
- Do not build the detail/edit dynamic sub-route in this pass — list + create/edit only.
  (Matches the audit note that dynamic detail routes were excluded from comparison.)
- No backend/API work beyond what's needed to wire the form — if no API endpoint exists
  yet, stub the submission and flag it clearly rather than guessing at a contract.

## Verification
1. `npm run build` passes
2. `npm run lint` passes
3. Screenshot the list view and the create/edit form
4. Side-by-side comparison against purchase/return and purchase/suppliers — confirm the
   same table style, spacing, button placement, and form conventions were followed
5. Confirm every UI element traces back to an existing shared component — list any
   new components created and justify each one in the PR description
6. Confirm no hardcoded colors/spacing