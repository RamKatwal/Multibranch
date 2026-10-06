---
name: new-page
description: Build or port a dashboard page (route) — a list, form, detail or report view — from the live reference app or from a Radian-based Figma design. Use when asked to build, port or create a page or screen.
---
# New page

1. **Find the source.**
   - From the live reference (https://erp-tan-rho.vercel.app/): open the page and make sure it isn't a
     stub ("This module is ready for implementation"). If it is, stop and flag it. Save a screenshot as
     `design-refs/<module>-<page>.png` if there isn't one.
   - From Figma: read the frame with the Figma MCP (`get_design_context`). Every instance should be a
     Radian component (`.claude/rules/design-system.md` §5); list any that aren't before building.
2. **Mirror the closest finished page:** lists → `purchase/suppliers` or `sales/customers`;
   configuration → `configurations/general/product-configuration`.
3. **Route:** `app/(dashboard)/<module>/<page>/page.tsx` renders one component from
   `components/<module>/`, wrapped in `<Suspense>` when it reads search params. No logic in the route.
4. **Navigation:** add the entry to `config/navigation.ts` (or the settings, configurations or
   users-permissions navigation file). The sidebar, breadcrumbs and command search all read from it.
5. **Build it** from tiers 1 and 2 only: `PageHeader` (title, count, actions), `DataTableCard` with
   `useDataTable` for lists, and Radian primitives for everything else (add missing ones with
   `npx radianui@latest add <name>`). Tokens only: no hex, default palette or arbitrary values.
6. **States:** an empty state for lists, pending and disabled states on submit buttons, and form
   errors inline under their field.
7. **Verify:** `npm run build` and `npm run lint` (no new problems), then screenshots at 1440 and 1024
   wide compared with the reference, then run the `reviewer` agent.
