// Codemod: Base UI render prop → Radix asChild, for the given trigger components.
// Usage: node codemod-aschild.mjs <repoRoot> <ui module> <Tag,Tag…> [--write]
import fs from "node:fs";
import path from "node:path";
import { parseOpenTag, findClose } from "./jsx-scan.mjs";

const root = process.argv[2];
const WRITE = process.argv.includes("--write");
const MODULE = process.argv[3];
const TAGS = process.argv[4].split(",");
const SKIP = new Set([`components/ui/${MODULE}.tsx`, "components/ui/sidebar.tsx"]);

const lineStart = (s, i) => s.lastIndexOf("\n", i - 1) + 1;
const lineIndent = (s, i) => s.slice(lineStart(s, i)).match(/^[ \t]*/)[0];
// Re-indent a multi-line JSX block so its first line sits at `to`.
function reindent(text, from, to) {
  return text
    .split("\n")
    .map((l, k) => {
      if (k === 0) return to + l.trimStart();
      if (!l.trim()) return "";
      return to + (l.startsWith(from) ? l.slice(from.length) : l.trimStart());
    })
    .join("\n");
}
// Indent of a block's first line as it sits in the source (for a block starting at index i).
const blockIndent = (s, i) => {
  const before = s.slice(lineStart(s, i), i);
  return /^\s*$/.test(before) ? before : lineIndent(s, i);
};
// Element text with given children inserted (element must be self-closing).
function withChildren(src, el, children, ind) {
  const t = parseOpenTag(src, el.start);
  // Keep a multi-line tag's ">" on its own line, as the repo writes it.
  const open = src.slice(el.start, t.end).replace(/\/>$/, ">").replace(/ +>$/, ">");
  const kids = children.trim()
    ? "\n" + reindent(children.replace(/^\n/, "").replace(/\n[ \t]*$/, ""), minIndent(children), ind + "  ") + "\n" + ind
    : "";
  return `${open}${kids}</${t.name}>`;
}
const minIndent = (text) => {
  const ls = text.split("\n").filter((l) => l.trim());
  const ws = ls.map((l) => l.match(/^[ \t]*/)[0]);
  return ws.length ? ws.reduce((a, b) => (b.length < a.length ? b : a)) : "";
};


// Opening tag with asChild: one attribute per line when the other attributes are multi-line.
const openTag = (tag, others, ind) => {
  const lead = others.match(/^\s*/)[0];
  return lead.includes("\n") ? `<${tag}${lead}asChild${others}\n${ind}>` : `<${tag} asChild${others}>`;
};

const files = [];
const walk = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) {
      if (e.name !== "node_modules" && !e.name.startsWith(".")) walk(p);
    } else if (p.endsWith(".tsx")) files.push(p);
  }
};
["app", "components", "lib", "hooks"].forEach((r) => fs.existsSync(path.join(root, r)) && walk(path.join(root, r)));

const manual = [];
const stats = { files: 0, simple: 0, nested: 0, provider: 0 };

for (const abs of files) {
  const rel = path.relative(root, abs).split(path.sep).join("/");
  if (SKIP.has(rel)) continue;
  const raw = fs.readFileSync(abs, "utf8");
  if (!raw.includes(`@/components/ui/${MODULE}"`)) continue;
  const crlf = raw.includes("\r\n");
  let src = raw.replace(/\r\n/g, "\n");
  let guard = 0;

  // Process triggers that still use `render`, one at a time, rescanning after each edit.
  for (const TAG of TAGS) for (;;) {
    if (++guard > 400) throw new Error(rel + ": loop");
    let i = -1, t = null;
    let from = 0;
    while ((i = src.indexOf("<" + TAG, from)) !== -1) {
      if (/[\s/>]/.test(src[i + 1 + TAG.length] || "")) {
        const pt = parseOpenTag(src, i);
        if (pt && pt.attrs.some((a) => a.name === "render")) { t = pt; break; }
      }
      from = i + 1;
    }
    if (!t) break;
    const line = src.slice(0, i).split("\n").length;
    const rA = t.attrs.find((a) => a.name === "render");
    const others = t.attrs.filter((a) => a !== rA).map((a) => src.slice(a.start, a.end)).join("");
    const close = t.selfClosing ? null : findClose(src, t.end, TAG);
    const end = t.selfClosing ? t.end : close.end;
    const children = t.selfClosing ? "" : src.slice(t.end, close.start);

    // The render value: an element (<X …/> or <X>…</X>) or an expression.
    const valStart = src.indexOf("{", rA.start) + 1;
    const valText = rA.value;
    const elStart = src.indexOf("<", valStart);
    const isEl = valText.startsWith("<");

    // Is this trigger itself the `render` of an enclosing element (e.g. DropdownMenuTrigger)?
    let parent = null;
    const back = src.slice(Math.max(0, i - 120), i);
    if (/render=\{\s*$/.test(back)) {
      for (let k = i - 1; k > Math.max(0, i - 800); k--) {
        if (src[k] === "<" && /[A-Z]/.test(src[k + 1] || "")) {
          const p = parseOpenTag(src, k);
          if (p && p.attrs.some((a) => a.name === "render" && a.start < i && a.end > i)) {
            parent = { start: k, tag: p };
            break;
          }
        }
      }
    }

    if (parent) {
      // <P render={<TooltipTrigger render={E} />}>kids</P>  →  <TooltipTrigger asChild><P render={E}>kids</P></TooltipTrigger>
      if (!t.selfClosing || children.trim()) { manual.push(`${rel}:${line} nested trigger with children`); break; }
      const p = parent.tag;
      const pR = p.attrs.find((a) => a.name === "render");
      const pClose = p.selfClosing ? null : findClose(src, p.end, p.name);
      const pEnd = p.selfClosing ? p.end : pClose.end;
      const ind = lineIndent(src, parent.start);
      const attrInd = blockIndent(src, pR.start + src.slice(pR.start).search(/\S/));
      const eInd = blockIndent(src, elStart);
      const eText = isEl ? reindent(src.slice(elStart, rA.end - 1).trimEnd(), eInd, attrInd + "  ") : null;
      const newRender = isEl
        ? src.slice(pR.start, pR.start + src.slice(pR.start).search(/\S/)) + `render={\n${eText}\n${attrInd}}`
        : src.slice(pR.start, pR.start + src.slice(pR.start).search(/\S/)) + `render={${valText}}`;
      const pText = src.slice(parent.start, pR.start) + newRender + src.slice(pR.end, pEnd);
      const out = `${openTag(TAG, others, ind)}\n${reindent(pText, ind, ind + "  ")}\n${ind}</${TAG}>`;
      src = src.slice(0, parent.start) + out + src.slice(pEnd);
      stats.nested++;
      continue;
    }

    // Plain trigger: <TooltipTrigger render={E}>kids</TooltipTrigger> → <TooltipTrigger asChild><E>kids</E></TooltipTrigger>
    const ind = lineIndent(src, i);
    let child;
    if (isEl) {
      const elTag = parseOpenTag(src, elStart);
      const eInd = blockIndent(src, elStart);
      if (elTag.selfClosing) {
        child = children.trim()
          ? withChildren(src, { start: elStart }, children, eInd)
          : src.slice(elStart, elTag.end);
      } else {
        if (children.trim()) { manual.push(`${rel}:${line} render element and trigger both have children`); break; }
        child = src.slice(elStart, findClose(src, elTag.end, elTag.name).end);
      }
      child = reindent(child, eInd, ind + "  ");
    } else {
      if (children.trim()) { manual.push(`${rel}:${line} render expression with children`); break; }
      child = `${ind}  {${valText}}`;
    }
    const out = `${openTag(TAG, others, ind)}\n${child}\n${ind}</${TAG}>`;
    src = src.slice(0, i) + out + src.slice(end);
    stats.simple++;
  }

  // TooltipProvider: Radian's Tooltip wraps its own provider.
  if (MODULE === "tooltip" && /TooltipProvider/.test(src)) {
    const before = src;
    src = src.replace(/^([ \t]*)<TooltipProvider>([\s\S]*?)\n\1<\/TooltipProvider>/gm, (m, ind, body) =>
      body.replace(/^\n/, "").split("\n").map((l) => (l.startsWith(ind + "  ") ? ind + l.slice(ind.length + 2) : l)).join("\n"),
    );
    src = src.replace(/<TooltipProvider>([^\n]*?)<\/TooltipProvider>/g, "$1");
    src = src.replace(/\n\s*TooltipProvider,/g, "").replace(/,\s*TooltipProvider\s*\}/g, " }").replace(/\{\s*TooltipProvider\s*\}/g, "{}");
    src = src.replace(/^import \{\s*\} from "@\/components\/ui\/tooltip"\n/m, "");
    if (/TooltipProvider/.test(src)) manual.push(`${rel}: TooltipProvider left`);
    if (src !== before) stats.provider++;
  }

  if (src !== raw.replace(/\r\n/g, "\n")) {
    stats.files++;
    if (WRITE) fs.writeFileSync(abs, crlf ? src.replace(/\n/g, "\r\n") : src);
  }
}
console.log(JSON.stringify(stats));
console.log(`manual (${manual.length}):`);
manual.forEach((m) => console.log("  " + m));
