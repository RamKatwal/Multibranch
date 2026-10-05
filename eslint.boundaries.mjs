// Architecture and styling rules for Multibranch (Omniverse). Spread at the END of
// eslint.config.mjs. Adapted from Fonepoints OMS.
//
// Each file glob appears in exactly one no-restricted-imports block, because in flat config a
// later block replaces (not merges) an earlier block's options for the same file. The same
// holds for no-restricted-syntax: the styling block below is the only one.

const HEADLESS = {
  group: [
    "@base-ui/react",
    "@base-ui/react/*",
    "@radix-ui/*",
    "radix-ui",
    "radix-ui/*",
    "cmdk",
    "vaul",
  ],
  message:
    "Headless primitives live in components/ui only. Import the Radian component from @/components/ui/<name>.",
};

// Radian primitives depend on nothing but lib/utils and each other. The hooks/use-mobile and
// lib/motion exceptions are legacy shadcn customizations (sidebar, dialog, sheet); drop them
// when those primitives move to Radian.
const UI_DEPS = {
  regex: "^@/(?!components/ui/|lib/utils$|hooks/use-mobile$|lib/motion$)",
  message:
    "components/ui holds Radian primitives only; they import nothing but @/lib/utils and other @/components/ui files.",
};

const restrict = (files, patterns, ignores = []) => ({
  files,
  ignores,
  rules: { "no-restricted-imports": ["error", { patterns }] },
});

// Hex colors anywhere in a string. esquery regexes cannot contain backslashes, so no \b / \s / \[.
const HEX = "#[0-9a-fA-F]{3,8}([^0-9a-zA-Z_-]|$)";
// Tailwind arbitrary values (`w-[240px]`, `text-[13px]`) and arbitrary properties
// (`[grid-template-columns:...]`). State variants like `data-[state=open]:` are allowed.
const ARBITRARY =
  "(^|[ :])(?!data-|aria-|group-|peer-|has-|supports-)[a-z0-9-]*-[[]|(^| )[[][a-z-]+:";
// Tailwind's default palette (`bg-red-500`, `text-gray-400`). Radian has its own OKLCH palette
// (`bg-red`, `text-red-text`, `bg-error-accent`) and semantic tokens (`text-fg-secondary`).
const PALETTE =
  "(^|[ :])(bg|text|border|ring|outline|fill|stroke|from|via|to|divide|decoration|placeholder|caret|accent|shadow)-(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)-[0-9]{2,3}";

const styleRule = (pattern, message) => [
  { selector: `Literal[value=/${pattern}/]`, message },
  { selector: `TemplateElement[value.raw=/${pattern}/]`, message },
];

const styling = [
  ...styleRule(HEX, "No hex colors — use Radian tokens."),
  ...styleRule(
    ARBITRARY,
    "No Tailwind arbitrary values — use Radian tokens and the Tailwind scale.",
  ),
  ...styleRule(
    PALETTE,
    "No default Tailwind palette colors — use Radian tokens (text-fg-secondary, bg-error-accent…).",
  ),
];

const boundaries = [
  restrict(["components/ui/**"], [UI_DEPS]),

  restrict(["**/*.{ts,tsx}"], [HEADLESS], ["components/ui/**"]),

  // Styling is a warning while legacy code still has violations (baseline in
  // .claude/rules/design-system.md). The Stop hook blocks any increase in files you touch.
  {
    files: ["**/*.{ts,tsx}"],
    ignores: ["components/ui/**"],
    rules: { "no-restricted-syntax": ["warn", ...styling] },
  },

  // Radian primitives come from the CLI and stay identical to upstream. Their upstream hook
  // patterns trip the React Compiler lint rules; we don't fork them.
  {
    files: ["components/ui/**"],
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "react-hooks/refs": "off",
      "react-hooks/exhaustive-deps": "off",
    },
  },
];

export default boundaries;
