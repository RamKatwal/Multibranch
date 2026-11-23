// Compare each components/ui file with Radian's registry source, ignoring formatting
// (the CLI reformats and re-sorts Tailwind classes), and count how many files use it.
import fs from "node:fs";
import path from "node:path";

const root = process.argv[2];
// Radian source: git clone --depth 1 https://github.com/Radian-os/radianui, then pass <clone>/apps/website/src/styles/default/ui
const radianUi = process.argv[3];
const ui = path.join(root, "components/ui");

const tokens = (s) =>
  s
    .replace(/\r/g, "")
    .replace(/@\/styles\/default\/ui\//g, "@/components/ui/")
    .replace(/\/\/[^\n]*/g, "")
    .split(/[^A-Za-z0-9_\-:.\[\]\/@%!&>*=()']+/)
    .filter(Boolean);
const bag = (arr) => {
  const m = new Map();
  for (const t of arr) m.set(t, (m.get(t) || 0) + 1);
  return m;
};
const sim = (a, b) => {
  const A = bag(a), B = bag(b);
  let inter = 0;
  for (const [k, v] of A) inter += Math.min(v, B.get(k) || 0);
  return inter / Math.max(a.length, b.length);
};

const src = [];
const walk = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) {
      if (e.name !== "node_modules" && !e.name.startsWith(".")) walk(p);
    } else if (/\.tsx?$/.test(p)) src.push(p);
  }
};
["app", "components", "lib", "hooks"].forEach((r) => walk(path.join(root, r)));
const texts = src.filter((p) => !p.startsWith(ui)).map((p) => fs.readFileSync(p, "utf8"));

const rows = [];
for (const f of fs.readdirSync(ui).filter((f) => f.endsWith(".tsx")).sort()) {
  const name = f.replace(/\.tsx$/, "");
  const mine = fs.readFileSync(path.join(ui, f), "utf8");
  const engine = /@base-ui\/react/.test(mine) ? "Base UI" : /@radix-ui|from "radix-ui/.test(mine) ? "Radix" : /from "(cmdk|vaul|sonner|embla|recharts)/.test(mine) ? mine.match(/from "(cmdk|vaul|sonner|embla[\w-]*|recharts)/)[1] : "plain";
  const rf = path.join(radianUi, f);
  const uses = texts.filter((t) => t.includes(`@/components/ui/${name}"`)).length;
  let pct = null;
  if (fs.existsSync(rf)) pct = Math.round(sim(tokens(mine), tokens(fs.readFileSync(rf, "utf8"))) * 100);
  const local = (mine.match(/Multibranch[^\n]*/g) || []).length;
  rows.push({ name, engine, pct, uses, local });
}
const fmt = (r) => `${r.name.padEnd(15)} ${r.engine.padEnd(8)} ${(r.pct === null ? "—" : r.pct + "%").padStart(5)}  ${String(r.uses).padStart(4)} files${r.local ? "  (local edits: " + r.local + ")" : ""}`;
console.log("== Same as Radian (≥97%)");
rows.filter((r) => r.pct !== null && r.pct >= 97).forEach((r) => console.log(fmt(r)));
console.log("== Close to Radian (80–96%)");
rows.filter((r) => r.pct !== null && r.pct >= 80 && r.pct < 97).forEach((r) => console.log(fmt(r)));
console.log("== Differs from Radian (<80%)");
rows.filter((r) => r.pct !== null && r.pct < 80).sort((a, b) => b.uses - a.uses).forEach((r) => console.log(fmt(r)));
console.log("== No Radian file with this name");
rows.filter((r) => r.pct === null).sort((a, b) => b.uses - a.uses).forEach((r) => console.log(fmt(r)));
