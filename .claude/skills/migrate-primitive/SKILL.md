---
name: migrate-primitive
description: Migrate one components/ui primitive from shadcn (Base UI) to Radian UI with the Radian CLI, including a codemod of its call sites. Use when asked to migrate a component to Radian, or when working through the status table in .claude/rules/design-system.md §4.
---
# Migrate a primitive to Radian

One primitive per branch and PR: `fix/<name>-radian`.

1. **Scope it.** Read its row in `.claude/rules/design-system.md` §4, then find:
   - the call sites (`from "@/components/ui/<name>"`) and how often each prop value is used;
   - other `components/ui` files that import it (they change in the same PR);
   - composition that differs between the engines: Base UI `render={<X/>}` becomes Radix `asChild`
     with the child element; Base UI-only props (`render`, `nativeButton`) go away.
2. **Read the Radian API** before touching code: `https://radianui.com/docs/components/<name>.md`, and the
   Figma component's variant properties (Figma MCP `search_design_system` on the Radian library,
   file key `TQngn3b7a4jlu8xD6SZiod`). Write the old → new prop mapping table into the PR description.
3. **Add it:** `npx radianui@latest add <name> --overwrite --yes`, then read `git diff`. The CLI may
   also add registry dependencies (`button` pulls `spinner`) and npm packages (`@radix-ui/*`). Don't
   edit the generated file, except for a transitional change you log in §9.
4. **Codemod the call sites** with a script, not by hand: map props by the table, rename exports
   (icon-only `Button` → `IconButton`), convert `render={<Link …/>}` + `nativeButton={false}` to
   `asChild` wrapping the `Link`, and fix imports. Make the script print every case it can't map
   (`variant={expr}`, spread props) and do those by hand.
   When mapping sizes, take the control's effective size from its `className` (`size-N`, `h-N`), pick
   the Radian `size` that matches, and delete the override class. Strip size and color classes from
   icons inside Radian `Button`/`IconButton`/`Badge`.
5. **Verify:** `npx tsc --noEmit` and lint on the changed files (the Stop hook runs both), then
   `npm run build`.
6. **Look at it:** run the app and screenshot the 3–4 pages that use the primitive most, light and
   dark, before and after. Size changes are expected where the old size had no exact Radian
   match; list them in the PR.
7. **Record it:** set the §4 row to ✅, add a decisions-log entry (mapping, transitional edits, visual
   changes), and update the counts in `.claude/design-system-map.md`.
