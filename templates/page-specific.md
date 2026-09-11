# Page Spec: <route-name>

## Reference
- Live URL: https://multibranch-kohl.vercel.app/<path>
- Reference screenshot: /design-refs/<route>.png
- Route in new codebase: app/<path>/page.tsx

## Scope
<What this page does, key sections/states (empty, loading, error, populated).>

## Components to reuse
<List from src/components/ui/ — Table, Card, Button variant X, etc. Note any new component needed and why.>

## Out of scope
<Explicitly what NOT to touch — shared layouts, unrelated routes, API contracts.>

## Verification
1. `npm run build` passes
2. `npm run lint` passes
3. Screenshot the built page, compare against reference screenshot — list any differences
4. Confirm no raw hex/spacing values (tokens only)