// Survey: how the given components are used (attribute names, className tokens, selected attribute values).
// Usage: node survey-tags.mjs <repoRoot> <Tag,Tag…> [--full Tag] [--attr name,name]
import fs from "node:fs";
import path from "node:path";
import { parseOpenTag } from "./jsx-scan.mjs";

const root = process.argv[2];
const TAGS = new Set(process.argv[3].split(","));
const fullIdx = process.argv.indexOf("--full");
const FULL = fullIdx > 0 ? new Set(process.argv[fullIdx + 1].split(",")) : new Set();
const attrIdx = process.argv.indexOf("--attr");
const ATTRS = attrIdx > 0 ? new Set(process.argv[attrIdx + 1].split(",")) : new Set();

const files = [];
const walk = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) {
      if (e.name !== "node_modules" && !e.name.startsWith(".")) walk(p);
    } else if (p.endsWith(".tsx")) files.push(p);
  }
};
walk(root);

const stats = {};
const bump = (tag, group, key) => {
  stats[tag] ??= {};
  stats[tag][group] ??= {};
  stats[tag][group][key] = (stats[tag][group][key] || 0) + 1;
};

for (const file of files) {
  const src = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  const rel = path.relative(root, file).replace(/\\/g, "/");
  const re = /<([A-Z][\w.]*)(?=[\s/>])/g;
  let m;
  while ((m = re.exec(src))) {
    if (!TAGS.has(m[1])) continue;
    const t = parseOpenTag(src, m.index);
    if (!t) continue;
    const line = src.slice(0, m.index).split("\n").length;
    bump(t.name, "count", "total");
    for (const a of t.attrs) {
      bump(t.name, "attr", a.name === "..." ? a.raw : a.name);
      if (a.name === "className") {
        if (a.kind === "string") for (const c of a.value.split(/\s+/).filter(Boolean)) bump(t.name, "class", c);
        else bump(t.name, "class", "{expr}");
      }
      if (ATTRS.has(a.name)) console.log(`${rel}:${line} <${t.name}> ${a.name}=${a.kind === "bool" ? "true" : JSON.stringify(a.value)}`);
    }
    if (FULL.has(t.name)) console.log(`${rel}:${line}\n  ${src.slice(m.index, t.end).replace(/\s+/g, " ")}`);
  }
}
for (const [tag, groups] of Object.entries(stats)) {
  console.log(`\n=== ${tag} (${groups.count.total})`);
  for (const g of ["attr", "class"]) {
    if (!groups[g]) continue;
    const entries = Object.entries(groups[g]).sort((a, b) => b[1] - a[1]);
    console.log(`  ${g}: ${entries.map(([k, v]) => `${k}×${v}`).join("  ")}`);
  }
}
