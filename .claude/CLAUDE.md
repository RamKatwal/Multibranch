# Multibranch (Omniverse)

## Project
- This codebase: Multibranch, branded **Omniverse**, an ERP for Nepal-based multi-branch businesses.
  Deployed at https://multibranch-kohl.vercel.app/
- Design reference (live target to match/exceed): https://erp-tan-rho.vercel.app/
- These are two different deployments — do not confuse reference screenshots from one with the other.
- Design system: **Radian** (radianui.com). The React components come from the Radian CLI and match
  the Radian Figma library one to one, so pages can be designed in Figma and built in code with the
  same components, props and tokens.

## Read before any UI work
@rules/design-system.md

## Sources of truth (in priority order — if these conflict, higher wins)
1. `components/ui/**` at repo root — the shared component library. Not `src/components/ui`.
   It is migrating from shadcn (Base UI) to Radian; the status table in `rules/design-system.md`
   says which primitives are already Radian.
2. `.claude/rules/*.md` and `.cursor/rules/*.mdc` — e.g. `ui-tabs.mdc` requires all tabs to use
   `components/ui/tabs`, no one-off tab bars. Check both folders before building a UI pattern.
3. Already-done reference pages in this repo, e.g. `purchase/suppliers`, `sales/customers`,
   `configurations/general/product-configuration` — confirmed matching the design system.
4. `design-refs/*.png` — screenshots of the live reference app, used when porting an unbuilt page.

## Before creating any component
1. Search `components/ui/` for something that already does this. If the Radian library has it but
   the repo doesn't, add it with `npx radianui@latest add <name>` (never hand-write a primitive).
2. Check the rules folders for a rule governing this UI pattern (tabs, tables, forms, etc.).
3. If close-but-not-exact, extend/add a variant — don't fork.
4. Only create new if nothing fits. State why in the PR description.
5. Never hand-roll a pattern that already has a shared primitive (e.g. no custom tab bars).

## Known past violations (don't repeat these patterns)
- `components/dashboard/home/dashboard-widget-tabs.tsx` — hand-rolled tab bar instead of `components/ui/tabs`.
- `components/settings/appearance-settings-panel.tsx` — hand-rolled segmented control instead of `components/ui/tabs`.

## Workflow
- One page/fix = one branch = one PR. Branch name: `page/<route-name>` or `fix/<component-name>`.
- Migrating a primitive to Radian: use the `migrate-primitive` skill. Building or porting a page:
  use the `new-page` skill. Before calling work done, run the `reviewer` agent.
- Before marking work done: run `npm run build` and `npm run lint`, take a screenshot, and compare
  against the relevant reference screenshot in `design-refs/` (only when porting a live page —
  design-violation fixes don't need this, just visual consistency with the rest of the app).
- `npm run lint` still reports legacy errors and styling warnings (baseline in
  `rules/design-system.md`). The Stop hook (`.claude/hooks/verify.mjs`) type-checks the project and
  fails if a file you changed has more lint problems than it had on `main`. Never add to them.
- Don't touch files outside the current task's scope unless explicitly asked.
- Never build against a page that's still a stub ("This module is ready for implementation")
  on the live reference — there's nothing real to copy yet. Flag it instead of guessing.

## Keeping this file useful
When you make a design or architecture decision that future sessions need to know, add it to the
"Decisions log" in `.claude/rules/design-system.md`. Keep this file under ~100 lines.
