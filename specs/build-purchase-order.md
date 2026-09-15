# Page Spec: Purchase Order (build from scratch, real fields, prototype data)

## Step 0 — Discover real fields (do this first)
- Use Claude in Chrome to open https://uat-iam.providhy.com/ (already authenticated
  in the browser session) and navigate to its Purchase Order module (list view and
  create/edit view).
- Extract: exact field list, field types (text/select/date/number/etc.), status values,
  table columns, and any line-item structure. Screenshot both views into
  design-refs/uat-purchase-order-list.png and design-refs/uat-purchase-order-form.png.
- Do NOT copy their visual styling — only the data shape and functional structure.
  Styling comes from this codebase's own components/ui + patterns below.

## Context
- This is a design prototype — no real backend/API integration needed. Once real
  fields are known (Step 0), populate the UI with realistic mock data matching that
  shape.
- Route: purchase/order
- Structural/styling reference pages (already done in this codebase):
  purchase/suppliers, purchase/return, inventory/stock-transfer

## Scope
1. **List view** (purchase/order): table using the real columns discovered in Step 0,
   styled per this codebase's existing list pattern (purchase/suppliers). Populate
   with realistic dummy rows.
2. **Create/Edit form**: fields exactly matching what Step 0 discovered, laid out
   using this codebase's existing form pattern (purchase/return or
   inventory/stock-transfer). On submit: local/mock state only, no real persistence.

## Components to reuse
- List/table components from purchase/suppliers or purchase/return
- Form components from purchase/return or inventory/stock-transfer
- Do not invent new primitives

## Out of scope
- No real API/backend integration
- Do not touch purchase/suppliers, purchase/return, or any other existing page
- Do not build the dynamic detail/edit sub-route in this pass
- Do not copy uat-iam.providhy.com's visual styling — structure/fields only

## Verification
1. `npm run build` passes
2. `npm run lint` passes
3. Screenshot list + form, confirm they match this codebase's existing design language
   (not Providhy's)
4. Confirm every discovered field from Step 0 is represented
5. Confirm every UI element traces to an existing shared component — justify any new one
6. Confirm no hardcoded colors/spacing