# Multibranch (Omniverse)

ERP for Nepal-based multi-branch businesses: inventory, purchase, sales, accounting and reports.
Live at https://multibranch-kohl.vercel.app/.

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Radian UI (radianui.com) · TanStack Table ·
react-hook-form + zod · Lucide icons

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Scripts

- `npm run dev` — dev server
- `npm run build` — production build
- `npm run lint` — ESLint, including the architecture and styling rules in `eslint.boundaries.mjs`
- `npx tsc --noEmit` — type check
- `npx radianui@latest add <name>` — add a Radian UI component to `components/ui`

## Design system

UI is built with **Radian**: the React components in `components/ui` come from the Radian CLI and match
the Radian Figma library one to one (same components, props and tokens), so pages designed in Figma
map directly to code. The move from the older shadcn components is in progress, one primitive per PR.

- `.claude/rules/design-system.md` — tokens, components, the code ↔ Figma mapping, migration status and
  the decisions log. Read first.
- `.claude/CLAUDE.md` and `.claude/` — Claude Code rules, skills, agents and hooks.
- `.cursor/rules/` — Cursor rules (Radian Figma library, tabs).
