# Multibranch (Omniverse) — Design System Rules

## Project
- This codebase: Multibranch, branded **Omniverse**, deployed at https://multibranch-kohl.vercel.app/
- Design reference (live target to match/exceed): https://erp-tan-rho.vercel.app/
- These are two different deployments — do not confuse reference screenshots from one with the other.

## Sources of truth (in priority order — if these conflict, higher wins)
1. `components/ui/**` at repo root — the real, shared component library. Not `src/components/ui`.
2. Existing rule files in `.cursor/rules/*.mdc` — e.g. `ui-tabs.mdc` requires all tabs to use `components/ui/tabs`, no one-off tab bars. Check this folder for other rules before building.
3. Already-done reference pages in this repo, e.g. `purchase/suppliers`, `sales/customers`, `configurations/general/product-configuration` — these are confirmed matching the design system.
4. `design-refs/*.png` — screenshots of the live reference app, used when porting an unbuilt page.

## Before creating any component
1. Search `components/ui/` for something that already does this.
2. Check `.cursor/rules/` for a rule governing this UI pattern (tabs, tables, forms, etc.) before building it yourself.
3. If close-but-not-exact, extend/add a variant — don't fork.
4. Only create new if nothing fits. State why in the PR description.
5. Never hand-roll a pattern that already has a shared primitive (e.g. no custom tab bars — see violation history below).

## Known past violations (don't repeat these patterns)
- `components/dashboard/home/dashboard-widget-tabs.tsx` — hand-rolled tab bar instead of `components/ui/tabs`.
- `components/settings/appearance-settings-panel.tsx` — hand-rolled segmented control instead of `components/ui/tabs`.

## Workflow
- One page/fix = one branch = one PR. Branch name: `page/<route-name>` or `fix/<component-name>`.
- Before marking work done: run `npm run build`, `npm run lint`, take a screenshot, and compare
  against the relevant reference screenshot in `design-refs/` (only when porting a live page —
  design-violation fixes don't need this, just visual consistency with the rest of the app).
- Don't touch files outside the current task's scope unless explicitly asked.
- Never build against a page that's still a stub ("This module is ready for implementation")
  on the live reference — there's nothing real to copy yet. Flag it instead of guessing.