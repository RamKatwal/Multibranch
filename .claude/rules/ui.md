---
paths:
  - "components/**"
  - "app/**/page.tsx"
  - "app/**/layout.tsx"
---
# UI rules

## Three tiers — every piece of UI fits exactly one
1. `components/ui` — Radian primitives, added with `npx radianui@latest add <name>`, never
   hand-written. Some files here are still shadcn until design-system.md §4 is all ✅: migrate them
   (the `migrate-primitive` skill), don't extend them.
2. Shared patterns — `components/layout`, `components/data-table`, `components/shared`:
   domain-agnostic compositions (`PageHeader`, `DataTableCard`, the shell). Built only from
   `components/ui` and tokens; data comes in through props; no imports from module folders.
3. Modules — `components/<module>/` (purchase, sales, inventory, reports, settings…): ERP-specific
   pages, forms, table columns and dialogs.

Decision order: a Radian component exists → use it (add it with the CLI if the repo doesn't have it
yet). Otherwise compose a pattern. Build something custom only if neither fits, and say so in the PR.

## Files and imports
- File names are kebab-case (what the Radian CLI generates); components are PascalCase exports;
  hooks are `use-x.ts` exporting `useX`.
- Import primitives from `@/components/ui/<name>`. Never import a headless library (`@base-ui/react`,
  `@radix-ui/*`, `cmdk`, `vaul`) outside `components/ui` (lint error).
- Edit a Radian file in `components/ui` only to add a variant, adjust tokens, or add a small prop that
  call sites already depend on, and log it in design-system.md §9.

## Styling
- Radian tokens and Tailwind scale values only (design-system.md §3). No hex, no default palette
  (`text-gray-500`), no arbitrary values (`p-[13px]`). State variants such as `data-[state=open]:` are fine.
- New code uses Radian token names (`text-fg-secondary`), not the shadcn aliases (`text-muted-foreground`).
- Size Radian controls with `size` (`"28"`–`"48"`), never with height, padding or text classes. Icons
  inside a Radian `Button`, `IconButton` or `Badge` get no size or color classes.

## Pages
- `app/(dashboard)/**/page.tsx` stays thin: it renders one module page component, wrapped in
  `Suspense` when that component reads search params. Data and logic live in `components/<module>`.
- Headers use `PageHeader` (`components/layout/page-header`): title, optional count chip and badge,
  actions on the right. Lists use `DataTableCard` with `useDataTable` (`components/data-table/data-table`).
- Status and filter rows follow `.cursor/rules/ui-tabs.mdc` (active = primary, inactive = outline).
- Lists have an empty state; submit buttons show pending and disabled states; form errors sit inline
  under their field.

## Accessibility and copy
- Icon-only buttons (`IconButton`) need an `aria-label`. Keep visible focus.
- Copy is sentence case with plain verbs, and the action name carries from button to toast
  ("Create supplier" → "Supplier created").
