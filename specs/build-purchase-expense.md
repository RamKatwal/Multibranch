# Page Spec: Purchase Expense (build from scratch, real fields, prototype data)

## Step 0 — Discover real fields (done)
- Crawled https://uat-apps.providhy.com/purchase/expense (list + create views, both
  "With Bill" and "Without Bill" modes) via browser automation, already authenticated
  in the browser session.
- Extracted: list columns (ID, Entry Date, Invoice No, Supplier, Amount, Payment
  Status), status tabs (Approved, Draft, For Approval, Cancelled), and the create
  form's field set for both modes. Screenshots saved to
  design-refs/uat-purchase-expense-list.png and design-refs/uat-purchase-expense-form.png.
- Did NOT copy their visual styling — only the data shape and functional structure.
  Styling comes from this codebase's own components/ui + patterns below.

## Context
- This is a design prototype — no real backend/API integration needed. Populated the
  UI with realistic mock data matching the discovered shape.
- Route: purchase/expense
- Structural/styling reference: purchase/return, purchase/suppliers (both on main);
  purchase/order (same crawl-and-build pattern, not yet merged) for the line-item +
  totals layout.

## Scope
1. **List view** (purchase/expense): table with ID, Entry Date, Invoice No, Supplier,
   Amount, Payment Status columns, status tabs (Approved/Draft/For Approval/Cancelled),
   styled per purchase/return's list pattern.
2. **Create/Edit form** (purchase/expense/create): "With Bill" / "Without Bill" mode
   toggle using `components/ui/tabs` (per `.cursor/rules/ui-tabs.mdc` — no hand-rolled
   segmented control). With Bill: Supplier, Invoice Number, Entry Date, Invoice Date,
   Payment Period, line items (Account, VAT, Amount, Description), Remarks, TDS
   switch, VAT-aware totals. Without Bill: Entry Date, Paid From, line items (Account,
   Amount, Description), Remarks, Quick Payment switch, flat total (no VAT breakdown).
   On submit: local/mock state only, no real persistence.

## Components to reuse
- List/table components from purchase/return
- Form components from purchase/order (Card/CardContent, FormField grid, item-row grid)
- `components/ui/tabs` for both the status filter bar and the With Bill/Without Bill
  mode switch
- `components/ui/switch` for TDS and Quick Payment toggles
- Do not invent new primitives

## Out of scope
- No real API/backend integration
- Do not touch purchase/return, purchase/suppliers, or any other existing page
- No payment-terms module exists yet on `main` — Payment Period options are a local
  mock list in `lib/mock/purchase-expenses.ts`, matching the pattern purchase/order
  used for its own requisition-reference stand-in
- Do not copy uat-apps.providhy.com's visual styling — structure/fields only

## Verification
1. `npm run build` passes
2. `npm run lint` passes
3. Screenshot list + form, confirm they match this codebase's existing design language
   (not Providhy's)
4. Confirm every discovered field from Step 0 is represented
5. Confirm every UI element traces to an existing shared component — justify any new one
6. Confirm no hardcoded colors/spacing
