# Radian migration — handoff

Use this to continue the work in a new chat. Start the new chat with:
"Read `.claude/tasks/radian-migration.md` and continue the Radian migration with <group>."

Status as of 2026-10-09. `main` is at PR #13 (+ #12). PR #14 (small primitives) is open; everything else below is merged.

## Goal
Make the code use the real **Radian UI** components (radianui.com, added with `npx radianui@latest add`)
so that pages designed in Figma with the Radian library map one to one to code: same component,
Figma variant properties = React props, Figma variables = CSS tokens. Reference project with the
same setup: https://github.com/RamKatwal/Fonepoints-oms.

Read first: `.claude/CLAUDE.md` and `.claude/rules/design-system.md` (tokens, code ↔ Figma mapping,
status table in §4, decisions log in §9). Process: the `migrate-primitive` skill.

## Done (merged)
| PR | What |
|---|---|
| #4 | Foundation: Radian `components.json`, Cool Gray primary, Tailwind default radius, type scale, `eslint.boundaries.mjs`, `.claude` rules/skills/reviewer agent, Stop hook |
| #5 | Button → Radian (`Button`, `IconButton`; 533 call sites) |
| #6 | Tooltip |
| #7 | DropdownMenu (`DropdownMenuSeparator` → `DropdownMenuDivider`; local `variant="destructive"` on items) |
| #8 | Popover (`HoverPopover` helper in `report-list-panel.tsx`) |
| #9 | Dialog (`DialogHeader`/`DialogBody`/`DialogFooter`, close button in `DialogTitle`; `form-dialog` rebuilt on it) |
| #10 | Badge (44 badges at `size="20"`) |
| #11 | Form controls: `input`, `label`, `form`, `checkbox`, `switch`, `textarea` → `text-area`, `native-select` → `select` (33 selects) |
| #12 | Tabs: Radian tabs + local `variant="button"`, `items`, `count` (call sites unchanged) |
| #13 | Card: Radian card + local `size="sm"` through `--card-spacing` (owner chose the compact variant) |
| #14 (open) | Avatar, breadcrumb, collapsible, divider (replaces separator), OTP field, skeleton; `AvatarGroup` → `components/shared/avatar-group` |

Already Radian: `button`, `badge`, `dialog`, `dropdown-menu`, `tooltip`, `popover`, `spinner`,
`carousel`, `chart`, `divider`.

## Decisions already made (don't re-ask)
- Real Radian through the CLI, even though it is Radix-based (reverses the earlier Base UI work).
- **Sheet and Drawer stay on Base UI and are not migrated.** So `@base-ui/react` stays, and the
  `children`-optional edit in `components/ui/button.tsx` stays.
- One primitive (or one tight group) per branch and PR: `fix/<name>-radian`. The owner reviews and
  merges each PR, then says "continue". Don't stack PRs on unmerged branches, and don't delete a
  branch that another open PR is based on (GitHub closes that PR).
- Visual changes that come from Radian/Figma sizing are accepted (14px text on size-32 buttons,
  6px badges, 16px dialog corners).

## Still to migrate
Match = how close the file is to Radian's source today.

| Component | Built on | Match | Used in | Radian target |
|---|---|---|---|---|
| `command` | cmdk | 68% | 12 files | `command`; then delete `input-group` (only `command.tsx` uses it) |
| `button-group` | Base UI | — | 45 files | `ButtonGroup` from `button` — not a drop-in: extract the shared report toolbar first (design-system.md §9, 2026-10-07) |
| `sidebar` | Base UI | 51% | 4 files | `sidebar` — blocked: its mobile view uses `sheet`; ask the owner first |
| `chart` | recharts | 99% | 4 files | re-add with the CLI when convenient |

Keep as they are: `form-dialog` (our wrapper on Radian Dialog), `sonner` (Radian's CLI has no toast),
`sheet`, `drawer`.

## Suggested order
1. ~~Form controls~~ — done in PR #11.
2. ~~`tabs`~~ — done in PR #12. **`button-group`** is next: the 44 report pages repeat the same toolbar
   (`ButtonGroup` > `DropdownMenu`/`Tooltip` > `IconButton`); extract one shared component, then use Radian's `ButtonGroup`.
3. ~~`card`~~ (PR #13) and ~~the small ones~~ (PR #14). Left: `command` (then delete `input-group`), `button-group` (extract the report toolbar first), `sidebar` (needs a decision on its mobile sheet).
4. **Status badge colors:** about 15 files (`components/` and `lib/reports/`) color status badges with
   className maps (`statusBadgeClassName`, `STATUS_BADGE_CLASSNAME`, `badgeToneClass`…), mostly
   default-palette classes. Replace with Radian `variant="soft" color="success|warning|error|info|neutral"`.
5. **Token-name codemod:** ~1,350 shadcn names (`text-muted-foreground` → `text-fg-secondary`…; table in
   design-system.md §3). Settle `--background` and `--muted` first (they differ between light and dark).
6. Follow-ups: fold `className` size overrides on Buttons into `size` (e.g. `size="32" className="size-7"`
   → `size="28"`); strip size/color classes from icons inside Buttons; the two hand-rolled tab bars
   (`dashboard-widget-tabs.tsx`, `appearance-settings-panel.tsx`); Radian `table`/`pagination` for
   `components/data-table`.

## How each migration goes
1. Branch from an up-to-date `main`: `fix/<name>-radian`.
2. Survey the call sites (props used, `render={…}` composition, Base UI-only props).
3. `npx radianui@latest add <name> --overwrite --yes`, then check `git diff`:
   - If the primitive depends on `button`, the CLI rewrites `components/ui/button.tsx`. Save a copy
     first and restore it (it carries the `children`-optional edit).
   - The CLI may reformat `spinner.tsx` with no code change: `git checkout -- components/ui/spinner.tsx`.
4. Codemod the call sites with a script; hand-edit what it reports.
5. `npx tsc --noEmit`, the Stop hook (`echo '{}' | node .claude/hooks/verify.mjs`), `npm run build`.
6. Browser checks against the dev server (the owner usually has one on http://localhost:3000; only one
   `next dev` can run per folder). Screenshots go in `.playwright-mcp/` (git-ignored).
7. Update design-system.md §4 and §9, commit, push, open the PR against `main`.

## Things that bite
- **Radix opens menus on pointerdown.** In scripted tests send a `PointerEvent("pointerdown")` or use a
  real Playwright click; `element.click()` does nothing.
- **Radian's `Button` is `w-fit`.** A button that must fill a grid cell or column needs `w-full`.
- **`asChild` needs exactly one child element.**
- **Base UI-only props to map:** `render={<X/>}` → `asChild` + child; `nativeButton` → remove;
  `--anchor-width` → `--radix-<part>-trigger-width`; `initialFocus={false}` → `onOpenAutoFocus` +
  `preventDefault`; `disablePointerDismissal` → `onInteractOutside` + `preventDefault`; `openOnHover` has
  no Radix Popover equivalent.
- **Lint:** `npm run lint` fails on `main` already (28 errors, ~300 warnings). The bar is "no new
  problems in changed files", which the Stop hook checks against the merge-base with `main`.
- **Line endings:** the repo is CRLF in the working tree, LF in git. Scripts should normalize to LF,
  edit, and write back with the file's original ending.
- **Shell quoting:** put Node scripts in files; inline `node -e` breaks on quotes and backslashes in
  Git Bash.
- **Playwright MCP can be locked** ("Browser is already in use") by another session. Fallback: a Node script using
  `playwright-core` from the npx cache with `chromium.launch({ channel: "chrome" })`.
- **Radix Select:** no empty-value items; a value with no matching item shows a blank trigger (design-system.md §9).
- The Next.js dev badge ("N") covers the user avatar in dev mode and blocks real clicks on it.

## Helper scripts (`.claude/tasks/radian-codemods/`)
- `jsx-scan.mjs` — brace-, string- and JSX-aware tag parser used by the others.
- `codemod-aschild.mjs <repo> <ui module> <Tag,Tag…> [--write]` — `render={<X/>}` → `asChild`.
  Example: `node .claude/tasks/radian-codemods/codemod-aschild.mjs . collapsible CollapsibleTrigger --write`
- `survey-tags.mjs <repo> <Tag,Tag…> [--full Tag] [--attr name]` — counts props and className tokens per component.
- `codemod-form-controls.mjs <repo> [--write]` — the PR #11 codemod (NativeSelect → Select, sizes, TextArea).
- `ui-diff-report.mjs <repo> <radian ui dir>` — regenerates the "still to migrate" table. Needs Radian's
  source: `git clone --depth 1 https://github.com/Radian-os/radianui`, then pass
  `<clone>/apps/website/src/styles/default/ui`.

## Figma
Radian library file key: `TQngn3b7a4jlu8xD6SZiod` (use the Figma MCP `search_design_system` and
`get_variable_defs`). Verified so far: Button (Variant × Color × Size × Icon only), `primary/key` =
`#090a0b`, `rounded - md` = 6, `rounded - lg` = 8. Check each primitive's Figma properties before
mapping its props.
