# Design System — Radian

> Every Claude Code session reads this file (it is imported from CLAUDE.md). Values were read from
> the code and from the Radian Figma library on 2026-10-05. When code changes, update them here;
> never guess.

## 1. What Radian is
- **Radian UI** (radianui.com) is open-code React components (Tailwind v4 + Radix) added to the
  repo with its CLI, plus a matching **Figma kit**. Agent docs: https://radianui.com/llms.txt.
- **Figma:** the published Radian library "Design System ❖ Version 0.3" (file key
  `TQngn3b7a4jlu8xD6SZiod`). Product files consume it; see `.cursor/rules/providhy-radian-design-system.mdc`.
- **Goal:** a page built in Figma from Radian instances maps one to one to code: the same component,
  Figma variant properties = React props, Figma variables = CSS tokens.
- **Config:** `components.json` (Radian schema, style `default`, icons `lucide`, no `src/`). Add a
  primitive with `npx radianui@latest add <name>`; inspect with `npx radianui@latest info`.

## 2. Where things live
- **Tokens:** `styles/utility.css` (raw Radian OKLCH scales, `red`…`rose` and `neutral`, each with
  `-accent/-focus/-border/-hover/-text/-fg`), `styles/themes.css` (semantic tokens, light and `.dark`,
  the shadcn alias bridge, and appearance themes through `html[data-theme-color]`), `app/globals.css`
  (`@theme inline` mapping for Tailwind, the Radian type scale, fonts through `html[data-font]`).
- **Tier 1, primitives:** `components/ui` (Radian; see §4 for what is migrated).
- **Tier 2, shared patterns:** `components/layout` (`DashboardShell`, `AppSidebar`, `AppNavbar`,
  `PageHeader`…), `components/data-table` (`DataTableCard`, `useDataTable`…), `components/shared`.
- **Tier 3, modules:** `components/<module>` (purchase, sales, inventory, reports, settings…).
  Routes in `app/(dashboard)` stay thin and render a module page component.
- **Navigation:** `config/navigation.ts` (plus the settings, configurations and users-permissions
  navigation files next to it).
- **Icons:** Lucide (`lucide-react`), which is Radian's and the Figma kit's icon set. `@hugeicons/react`
  (15 files) is legacy: swap to Lucide when you touch the file. Sidebar nav uses the duo set in
  `components/icons/duo`.

## 3. Tokens (use these, never raw values)
### Color
Use them as Tailwind classes (`bg-*`, `text-*`, `border-*`, `ring-*`). Each has a light and a `.dark` value.
| Figma variable (◑ Theme Colors) | Class | Use |
|---|---|---|
| `background/bg` | `bg-bg` | Cards, panels, inputs |
| `background/bg-fill1`…`fill4` | `bg-fill1`…`bg-fill4` | App canvas, table headers, hover and pressed fills |
| `bg elevation/bg-elevation-1`, `-2` | `bg-elevation-level1` (= `bg-card`), `bg-elevation-level2` (= `bg-popover`) | Raised surfaces, overlays |
| `text/text`, `text/text-secondary` | `text-fg`, `text-fg-secondary` | Body text; labels and muted text |
| (tertiary, disabled, inverse) | `text-fg-tertiary`, `text-fg-disabled`, `text-fg-inverse` | Hints, disabled, text on inverse |
| `border/border` | `border-border` | Every border and divider (also the default border color) |
| `primary/key`, `/text`, `/accent`, `/focus`, `/border`, `/hover` | `bg-primary`, `text-primary-text`, `bg-primary-accent`, `ring-primary-focus`, `border-primary-border`, `bg-primary-hover`, `text-primary-fg` | Primary actions and active states |
| status | `info-*`, `success-*`, `warning-*`, `error-*` with the same steps | Feedback, statuses |

**Primary is Gray** (the `neutral` scale = Figma **Cool Gray**; `primary/key` is `#090a0b`). Appearance
themes remap `primary-*` through `html[data-theme-color]`. Never use Tailwind's default palette
(`bg-red-500`); Radian's scales are `bg-red`, `bg-red-accent`, `text-red-text`…

**Legacy shadcn names** (still in ~1,350 places) are aliases defined in `themes.css`. In new code use
the Radian name; the token codemod will replace the rest:
`text-foreground` → `text-fg` · `text-muted-foreground` → `text-fg-secondary` ·
`bg-muted`/`bg-accent`/`bg-secondary` → `bg-fill2` · `*-accent-foreground`/`*-card-foreground` → `text-fg` ·
`border-input` → `border-border` · `ring-ring` → `ring-primary-border` · `destructive` → `error` ·
`text-primary-foreground` → `text-primary-fg` · `bg-background` → see the dark-mode note in §9.

### Typography
- **Family:** Geist Sans (Figma "Body Font Family: Geist"); Inter or Roboto can be picked in
  Settings → Appearance (`html[data-font]`). Mono: Geist Mono.
- **Radian type scale** (`app/globals.css`, = Figma text styles): `heading-1`…`heading-6`, `body-15`,
  `text-sm-p`, `body-13`. Controls set their own type through `size`.
- **In the app today:** `text-sm` for body, tables and controls; `text-xs` for captions and badges;
  `text-base font-semibold` for page titles (`PageHeader`). `tabular-nums` for amounts and counts.

### Spacing, sizes, radius
- **Spacing:** Tailwind's default scale, 1 step = 4px. Figma spacing variables are px and map one to
  one (`gap-2` = `8px`). Prefer `gap-*` on flex/grid parents over margins.
- **Control sizes:** Radian controls take `size` = height in px (`"28"`, `"32"`, `"36"`, `"40"`, `"44"`,
  `"48"`), the Figma "📏 Size" property. It sets padding, gap, font size, icon size and radius, so don't
  add those classes. 28: 13px text, 16px icons, radius 6 · 32: 14px, 18px, radius 6 · 36–44: 14–16px,
  20px, radius 8 · 48: 16px, 24px, radius 8. Use 32 in toolbars, tables and filters.
- **Radius:** Tailwind's defaults, which are Figma's radius variables: `rounded-md` 6 (controls up to
  32, badges, chips), `rounded-lg` 8 (36+ controls), `rounded-xl` 12 (cards), `rounded-2xl` 16,
  `rounded-full` (avatars, dots). Don't remap the scale.

## 4. Components: migration status
✅ Radian (CLI output, identical to upstream) · 🟡 close to Radian (85%+ the same; check the diff, then
re-add with the CLI) · ⏳ shadcn on Base UI (migrate) · ➖ no Radian equivalent

| Here (`components/ui`) | Status | Radian target | Notes |
|---|---|---|---|
| `spinner` | ✅ | `spinner` | |
| `button` | ⏳ | `button` (`Button`, `IconButton`, `ButtonGroup`, `CompactButton`) | Pilot: `fix/button-radian` |
| `badge`, `input`, `checkbox`, `switch`, `avatar`, `breadcrumb`, `collapsible`, `label`, `skeleton` | ⏳ | same name | |
| `textarea` | ⏳ | `text-area` | |
| `native-select` | ⏳ | `select` | |
| `tabs` | ⏳ | `tabs`, plus `toggle-group` for filter rows | Keep the `ui-tabs.mdc` look |
| `dialog`, `drawer`, `dropdown-menu`, `popover`, `tooltip`, `sidebar` | ⏳ | same name | Triggers switch from `render={…}` to `asChild` |
| `sheet` | ⏳ | `drawer` | |
| `separator` | ⏳ | `divider` | |
| `command` (69%), `form` (75%) | ⏳ | same name | |
| `card`, `carousel`, `chart`, `divider`, `otp-field` | 🟡 | same name | 87–98% the same |
| `button-group` | ➖ | `ButtonGroup` in `button`, or `toggle-group` | |
| `input-group` | ➖ | check Radian `input` slots when migrating it | |
| `form-dialog` | ➖ | — | Local composite; belongs in tier 2 |
| `sonner` | ➖ | — | Radian has no registry item. Keep it and centralize `toast` here |

**Not in the repo yet** (add with the CLI when a page needs one): accordion, alert, alert-dialog,
aspect-ratio, banner, calendar, code-area, context-menu, currency-input, empty, file-upload,
hover-card, menubar, navigation-menu, pagination, progress, radio-group, resizable, scroll-area,
select, slider, stepper, table, text-area, toggle, toggle-group.

## 5. Code ↔ Figma mapping
- Figma component = code export; Figma variant property = prop; values in lower case.
- **Button** (checked 2026-10-05, Figma `Button-Primary` set): 🎛️ Variant `Strong | Soft | Outline | Ghost`
  → `variant="strong|soft|outline|ghost"` · 🎨 Color `Primary | Neutral | Destructive` →
  `color="primary|neutral|error"` · 📏 Size `28…48` → `size="28…48"` · ⭐ Icon Only Button = True →
  `<IconButton>` · 📌 State → hover/focus/`disabled`. `Button-Link` → `variant="link"`,
  `Button-Compact` → `CompactButton`, `Button-Group` → `ButtonGroup`.
- Figma "◑ Theme Colors" variables = the semantic tokens in §3; "⁂ Colors Primitives" = the raw scales
  in `utility.css`.
- A value that isn't a token has no Figma variable, so hex and arbitrary values are lint warnings.

## 6. Migration rules (until every row in §4 is ✅)
- One primitive per PR, with the `migrate-primitive` skill: add it with the CLI, codemod the call
  sites, verify, screenshot, then update §4 and the decisions log.
- Don't `npx radianui@latest add` a primitive that exists here unless that PR migrates it: it
  overwrites the shadcn file and breaks its callers. Primitives the repo doesn't have yet: add freely.
- Radian files stay identical to the CLI output. Allowed edits: a new variant or a token
  adjustment, logged in §9. Transitional edits are listed in §9 too.
- Until the overlays migrate, Base UI triggers (`render={<Button/>}`) and Radix triggers (`asChild`)
  coexist. Follow whatever the trigger's own primitive uses.

## 7. Lint baseline (`npm run lint`, 2026-10-05)
- 28 errors (mostly `react-hooks/set-state-in-effect` in module code) and 300 warnings, 280 of them
  styling: 241 arbitrary values, 35 default palette colors, 4 hex colors.
- The Stop hook fails when a file you changed has more of these than on `main`. Lower the numbers
  when you can. When styling reaches 0, make it `"error"` in `eslint.boundaries.mjs`.

## 8. Don'ts
- No hex, rgb, default Tailwind palette (`bg-red-500`) or arbitrary values (`text-[13px]`, `w-[240px]`)
  outside `components/ui`.
- No headless library imports (`@base-ui/react`, `@radix-ui/*`, `cmdk`, `vaul`) outside `components/ui`
  (lint error).
- No new UI library without a decisions-log entry. No duplicate components.
- No custom size or color classes on icons inside Radian `Button`/`Badge`; their `size` handles it.
- No ALL CAPS copy. Sentence case, plain verbs.

## 9. Decisions log
- 2026-10-05: **Adopt real Radian UI through its CLI** (Radix-based) and replace the shadcn base-mira
  (Base UI) primitives one per PR. Radian's props and tokens match the Radian Figma library one to one
  (checked on Button: Variant × Color × Size × Icon only); shadcn's don't, so Figma pages couldn't map
  to code. This reverses the 2026-09-18 "Radian = 100% Base UI" direction in `design-system-map.md`:
  Radix comes back through Radian. Fonepoints OMS uses the same setup.
- 2026-10-05: **Gray primary = Figma Cool Gray.** The `neutral` scale in `utility.css` uses the Cool
  Gray steps, the same values as Fonepoints (light: key L4 = Figma `primary/key` `#090a0b`, accent L97,
  focus L94, border L88, hover L8, text L16, fg L97; dark: key L100, accent L8, focus L16, border L16,
  hover L97, text L97, fg L16). Primary buttons get darker; `primary-text` goes from mid gray to dark gray.
- 2026-10-05: **Radius = Tailwind's default scale**, as in Figma (`rounded - md` 6, `rounded - lg` 8).
  The shadcn `--radius: 0.625rem` scale is gone, so `rounded-sm`…`rounded-2xl` corners are 2px
  smaller than before (md 8 → 6, lg 10 → 8, xl 14 → 12).
- 2026-10-05: Radian type scale utilities (`heading-1`…`6`, `body-15`, `text-sm-p`, `body-13`) added to
  `app/globals.css`.
- 2026-10-05: `components.json` uses the Radian schema (style `default`, Lucide, no `src/`). The old
  shadcn base-mira config is still in `components.shadcn.json`; don't run the shadcn CLI.
- 2026-10-05: Lint boundaries in `eslint.boundaries.mjs`: headless libraries only inside
  `components/ui`, and `components/ui` imports only `@/lib/utils` and other ui files (errors; legacy
  exceptions `hooks/use-mobile`, `lib/motion`); styling rules are warnings with a ratchet; React
  Compiler rules are off in `components/ui` because it's upstream code.
- 2026-10-05: Claude Code setup adapted from Fonepoints OMS: this file, `rules/ui.md`, the
  `migrate-primitive` and `new-page` skills, the `reviewer` agent, and the Stop hook
  (`hooks/verify.mjs`: tsc plus a lint ratchet against the merge-base with `main`).
- 2026-10-05: Known token differences from Radian, kept for now: dark `--border` is L 0.35 (Radian
  0.275) and dark `--fg-tertiary` 0.569 (Radian 0.59); `--background` is `fill1` in light but `bg` in
  dark, and `--muted` is `fill2` in light but `fill1` in dark. Check Figma's dark mode before changing
  them, and settle `--background`/`--muted` in the token codemod.
- 2026-10-05: `toast()` is **not** centralized: `components/ui/sonner.tsx` exports only `Toaster`, and
  97 files import `toast` from `sonner` directly (`design-system-map.md` said otherwise).
