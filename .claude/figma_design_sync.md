# Providhy — Code to Figma Design System Sync

## Context

- **Product**: Providhy — ERP for Nepal-based multi-branch, single-PAN businesses (includes a Stock Transfer module).
- **Live app**: https://multibranch-kohl.vercel.app/ (Multibranch/Omniverse codebase).
- **Tech**: Frontend built with mixed UI libraries; **Radian UI** (radianui.com — React components + matching Figma kit) is the main library.
- **Figma state**: A design system has already been set up using RadianUI's premade Figma kit.
  - It currently lives on **one page** inside a working file.
  - It has also been **published as a separate Figma library file**, so other files can consume its components via that published library.

## Current goal

Transfer the app's page designs into Figma, using the already-published design system as the single source of components — not by rebuilding components from scratch in each new file.

This is a **code → Figma** direction: reading what's built in the codebase, matching it to the published design system, then assembling new Figma pages from those matched components.

## Workflow

1. **Read the codebase.** Inventory every UI component actually used per page/screen, grouped by source library (Radian UI vs. other libraries vs. custom-built). Note file paths.
2. **Read the published Figma design system.** Pull the component list, variants, and states from the published library file (not the working file — the published one is the source of truth for consumption).
3. **Map code components to design-system components.** For each component found in the codebase, find its match in the published library. Flag anything with no match (custom/non-Radian components with no Figma equivalent yet).
4. **Resolve unmapped components.** Per case: either treat it as a one-off (build directly on the new page) or add it to the design-system file first if it's a reusable pattern.
5. **Assemble new pages in Figma.** Using the mapped components from the published library (instanced, not detached/rebuilt), recreate each app page/screen as a new Figma page — matching the real layout, states, and content from the live app.
6. **Wire up Code Connect** between the published design-system components and their real code counterparts, so this mapping stays inspectable and doesn't need to be redone manually next time.

## Working rules for Claude Code

- Always pull components from the **published design-system library**, not by duplicating/rebuilding component instances by hand.
- When a page needs a component not yet in the design system, pause and flag it rather than silently creating a one-off — the mapping table (from the workflow above) should be the record of these gaps.
- Use the `figma-generate-design` skill when assembling full pages/screens from code — load it before calling `use_figma` for these tasks.
- Reference file: [add published library file link here]
- Reference file: [add working/design-system-source file link here]

## Non-negotiable build rules (fixes: pages built with no autolayout / no design-system reuse)

Every page build MUST follow this sequence — do not generate raw frames/shapes first and structure them later.

1. **Search the design system before drawing anything.** For every element on the page, check the published library first (via component search / `get_code_connect_suggestions`-style lookup or manual browse of the library file). If a matching component exists, **place an instance of it** — never redraw it as a plain frame, rectangle, or detached copy.
2. **Autolayout is mandatory, not optional.** Every frame that groups more than one element — rows, cards, sections, the page itself — must use Figma Auto Layout (padding, gap, alignment set to match the design system's spacing tokens). No manually-positioned/absolute-positioned groups. This applies at every nesting level, not just the outer page frame.
3. **When no matching component exists:**
   - Do not build it as a one-off group buried in the page.
   - Build it properly as a **new main component** — with variants/properties if it has states (hover, disabled, filled/outline, etc.), following the same construction pattern (autolayout, naming, token usage) as existing design-system components.
   - Place the new main component **on the design-system page**, not on the content page, then use an **instance** of it on the actual page.
   - Log it in the mapping table as a new addition so the codebase side can be reconciled later (build the matching React component, or confirm one already exists and just wasn't matched).
4. **Naming must match the code-side naming convention** (see naming-as-mapping approach above) so the new component is traceable back to its code counterpart.
5. **Before marking a page done, verify:**
   - [ ] No detached/one-off shapes standing in for a design-system component that already exists.
   - [ ] Every multi-element frame uses Auto Layout.
   - [ ] Every new component was created as a proper main component (not a raw group) and placed on the design-system page.
   - [ ] New components are logged in the mapping table.

## Open items

- [ ] Confirm published library file link and working file link (fill in above).
- [ ] Confirm which pages/screens are in scope for this first pass.
- [ ] Component mapping table — to be generated as part of step 3 and kept up to date here or in a linked file.
