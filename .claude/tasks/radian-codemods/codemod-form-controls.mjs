// Codemod: form controls → Radian (Input sizes, Textarea → TextArea, NativeSelect → Select,
// Checkbox/Switch sizes and CheckedState handlers).
// Usage: node codemod-form-controls.mjs <repoRoot> [--write]
import fs from "node:fs";
import path from "node:path";
import { parseOpenTag, findClose } from "./jsx-scan.mjs";

const root = process.argv[2];
const WRITE = process.argv.includes("--write");

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

const lineStart = (s, i) => s.lastIndexOf("\n", i - 1) + 1;
const lineIndent = (s, i) => s.slice(lineStart(s, i)).match(/^[ \t]*/)[0];
const minIndent = (text) => {
  const ws = text.split("\n").filter((l) => l.trim()).map((l) => l.match(/^[ \t]*/)[0]);
  return ws.length ? ws.reduce((a, b) => (b.length < a.length ? b : a)) : "";
};
const reindent = (text, to) => {
  const from = minIndent(text);
  return text
    .split("\n")
    .filter((l, k, all) => l.trim() || (k > 0 && k < all.length - 1))
    .map((l) => (l.trim() ? to + l.slice(from.length) : ""))
    .join("\n");
};
const attrText = (a) => {
  if (a.name === "...") return a.raw;
  if (a.kind === "bool") return a.name;
  return a.kind === "string" ? `${a.name}="${a.value}"` : `${a.name}={${a.value}}`;
};
// Opening tag from a list of attribute strings: one line if short, else one attribute per line.
const buildOpen = (name, attrs, ind, selfClosing = false) => {
  const end = selfClosing ? " />" : ">";
  const one = `<${name}${attrs.map((a) => " " + a).join("")}${end}`;
  if (!attrs.length || (ind.length + one.length <= 80 && !one.includes("\n"))) return one;
  return `<${name}\n${attrs.map((a) => `${ind}  ${a}`).join("\n")}\n${ind}${selfClosing ? "/>" : ">"}`;
};
// Rewrite a tag's attributes in place, keeping its layout: `change(attrs)` returns the new list.
const retag = (src, t, start, attrs, name = t.name) => {
  const multi = /\n/.test(src.slice(start, t.end));
  const ind = lineIndent(src, start);
  const strs = attrs.map((a) => (typeof a === "string" ? a : src.slice(a.start, a.end).trim()));
  if (!multi) return `<${name}${strs.map((a) => " " + a).join("")}${t.selfClosing ? " />" : ">"}`;
  return `<${name}\n${strs.map((a) => `${ind}  ${a}`).join("\n")}\n${ind}${t.selfClosing ? "/>" : ">"}`;
};

const report = [];
const counts = {};
const bump = (k) => (counts[k] = (counts[k] || 0) + 1);

const SELECT_IMPORT = `import {\n  Select,\n  SelectContent,\n  SelectItem,\n  SelectTrigger,\n  SelectValue,\n} from "@/components/ui/select"`;

function convertSelect(src, start, t, rel) {
  const line = src.slice(0, start).split("\n").length;
  const close = findClose(src, t.end, "NativeSelect");
  if (!close) return report.push(`${rel}:${line} NativeSelect: no closing tag`), null;
  let from = start;
  let to = close.end;
  // <div className="relative"> … <ChevronDownIcon …/> </div> wrapper
  const before = src.slice(0, from);
  const wrap = /<div className="relative">\s*$/.exec(before);
  if (wrap) {
    const after = /^\s*<ChevronDownIcon\b[^>]*\/>\s*<\/div>/.exec(src.slice(to));
    if (after) {
      from = wrap.index;
      to += after[0].length;
    } else report.push(`${rel}:${line} NativeSelect: "relative" wrapper without the expected chevron — check by hand`);
  }
  let inForm = false;
  const fc = /<FormControl>\s*$/.exec(src.slice(0, from));
  if (fc) {
    const after = /^\s*<\/FormControl>/.exec(src.slice(to));
    if (after) {
      inForm = true;
      from = fc.index;
      to += after[0].length;
    }
  }
  const ind = lineIndent(src, from);

  const rootAttrs = [];
  const triggerAttrs = [];
  let hasField = false;
  for (const a of t.attrs) {
    if (a.name === "...") {
      if (a.raw === "{...field}") hasField = true;
      else report.push(`${rel}:${line} NativeSelect: spread ${a.raw} — map by hand`);
    }
  }
  const explicit = new Set(t.attrs.map((a) => a.name));
  if (hasField) {
    rootAttrs.push("name={field.name}");
    if (!explicit.has("value")) rootAttrs.push("value={field.value}");
    if (!explicit.has("onChange")) rootAttrs.push("onValueChange={field.onChange}");
    if (!explicit.has("disabled")) rootAttrs.push("disabled={field.disabled}");
    triggerAttrs.push("ref={field.ref}", "onBlur={field.onBlur}");
  }
  for (const a of t.attrs) {
    if (a.name === "...") continue;
    if (a.name === "value" || a.name === "defaultValue" || a.name === "name" || a.name === "disabled") {
      if (hasField && a.name === "name") continue;
      rootAttrs.push(attrText(a));
    } else if (a.name === "onChange") {
      if (/^[\w.]+$/.test(a.value)) rootAttrs.push(`onValueChange={${a.value}}`);
      else {
        const m = /^\((\w+)\)\s*=>/.exec(a.value);
        if (!m) {
          report.push(`${rel}:${line} NativeSelect: onChange not understood — map by hand`);
          rootAttrs.push(`onValueChange={${a.value}}`);
        } else {
          const ev = m[1];
          let body = a.value.slice(m[0].length).replace(new RegExp(`\\b${ev}\\.target\\.value\\b`, "g"), "value");
          if (new RegExp(`\\b${ev}\\b`).test(body)) report.push(`${rel}:${line} NativeSelect: onChange still uses the event — fix by hand`);
          rootAttrs.push(`onValueChange={(value) =>${body}}`);
        }
      }
    } else if (a.name === "className") {
      if (a.kind !== "string") {
        report.push(`${rel}:${line} NativeSelect: className expression — check by hand`);
        triggerAttrs.push(attrText(a));
      } else {
        const rest = a.value.split(/\s+/).filter((c) => c && !/^(pr-\d+|h-9|text-sm)$/.test(c));
        if (rest.length) triggerAttrs.push(`className="${rest.join(" ")}"`);
      }
    } else if (a.name === "ref" || a.name === "onBlur") {
      if (!hasField) triggerAttrs.push(attrText(a));
    } else triggerAttrs.push(attrText(a));
  }

  // children: the empty option becomes the placeholder, the others become items
  let kids = src.slice(t.end, close.start);
  let placeholder = null;
  kids = kids.replace(/[ \t]*<option value=""(?: disabled)?>([\s\S]*?)<\/option>[ \t]*\n?/, (_, text) => {
    const body = text.trim();
    placeholder = body.startsWith("{") ? `{${body.slice(1, -1).replace(/\s+/g, " ").trim()}}` : JSON.stringify(body);
    return "";
  });
  if (/<option value=""/.test(kids)) report.push(`${rel}:${line} NativeSelect: second empty option — fix by hand`);
  kids = kids.replace(/<option>([^<{]+)<\/option>/g, (_, text) => `<SelectItem value="${text.trim()}">${text.trim()}</SelectItem>`);
  kids = kids.replace(/<option\b/g, "<SelectItem").replace(/<\/option>/g, "</SelectItem>");

  const i1 = ind + "  ";
  const i2 = i1 + "  ";
  const value = placeholder ? `<SelectValue placeholder=${placeholder} />` : "<SelectValue />";
  const trigger = (at) =>
    `${at}${buildOpen("SelectTrigger", triggerAttrs, at)}\n${at}  ${value}\n${at}</SelectTrigger>`;
  const out =
    `${buildOpen("Select", rootAttrs, ind)}\n` +
    (inForm ? `${i1}<FormControl>\n${trigger(i2)}\n${i1}</FormControl>\n` : `${trigger(i1)}\n`) +
    `${i1}<SelectContent>\n${reindent(kids.replace(/^\n/, "").replace(/\n[ \t]*$/, ""), i2)}\n${i1}</SelectContent>\n` +
    `${ind}</Select>`;
  bump("NativeSelect → Select");
  return { start: from, end: to, text: out };
}

for (const file of files) {
  const rel = path.relative(root, file).replace(/\\/g, "/");
  if (rel.startsWith("components/ui/")) continue;
  const raw = fs.readFileSync(file, "utf8");
  const crlf = raw.includes("\r\n");
  let src = raw.replace(/\r\n/g, "\n");
  const uses = (n) => new RegExp(`from "@/components/ui/${n}"`).test(src);
  if (!["input", "textarea", "native-select", "checkbox", "switch"].some(uses)) continue;
  const has = { input: uses("input"), textarea: uses("textarea"), select: uses("native-select"), checkbox: uses("checkbox"), sw: uses("switch") };

  const edits = [];
  const re = /<(Input|Textarea|NativeSelect|Checkbox|Switch)(?=[\s/>])/g;
  let m;
  while ((m = re.exec(src))) {
    const t = parseOpenTag(src, m.index);
    if (!t) continue;
    const line = src.slice(0, m.index).split("\n").length;
    const names = new Set(t.attrs.map((a) => a.name));
    const cls = t.attrs.find((a) => a.name === "className");
    const attrs = [...t.attrs];
    const setClass = (keep) => {
      const i = attrs.indexOf(cls);
      if (keep.length) attrs[i] = `className="${keep.join(" ")}"`;
      else attrs.splice(i, 1);
    };

    if (t.name === "NativeSelect" && has.select) {
      const e = convertSelect(src, m.index, t, rel);
      if (e) edits.push(e);
    } else if (t.name === "Input" && has.input) {
      if (!cls || cls.kind !== "string") continue;
      const tokens = cls.value.split(/\s+/).filter(Boolean);
      const h = tokens.find((c) => /^h-(7|8|8\.5|9|10)$/.test(c));
      if (!h || names.has("size")) continue;
      const size = { "h-7": "28", "h-8": "32", "h-8.5": "32", "h-9": "36", "h-10": "40" }[h];
      // the Radian size brings its own type size
      setClass(tokens.filter((c) => c !== h && !/^text-(xs|sm)$/.test(c)));
      if (size !== "36") attrs.unshift(`size="${size}"`);
      edits.push({ start: m.index, end: t.end, text: retag(src, t, m.index, attrs) });
      bump(`Input ${h} → size ${size}`);
      if (h === "h-8.5") report.push(`${rel}:${line} Input h-8.5 (34px) → size 32`);
    } else if (t.name === "Textarea" && has.textarea) {
      if (cls && cls.kind === "string" && /\bresize-none\b/.test(cls.value)) {
        setClass(cls.value.split(/\s+/).filter((c) => c && c !== "resize-none"));
        attrs.push("resizable={false}");
      }
      if (!t.selfClosing) report.push(`${rel}:${line} Textarea with children — fix the closing tag by hand`);
      edits.push({ start: m.index, end: t.end, text: retag(src, t, m.index, attrs, "TextArea") });
      bump("Textarea → TextArea");
    } else if (t.name === "Checkbox" && has.checkbox) {
      if (names.has("size")) continue;
      const on = attrs.find((a) => a.name === "onCheckedChange");
      if (on) {
        const fixed = on.value.replace(/^\((\w+)\) => ((?:table|row)\.\w+)\(\1\)$/, "($1) => $2($1 === true)");
        if (fixed !== on.value) {
          attrs[attrs.indexOf(on)] = `onCheckedChange={${fixed}}`;
          bump("Checkbox handler → value === true");
        }
      }
      attrs.unshift('size="sm"');
      edits.push({ start: m.index, end: t.end, text: retag(src, t, m.index, attrs) });
      bump("Checkbox size sm");
    } else if (t.name === "Switch" && has.sw) {
      if (names.has("size")) continue;
      attrs.unshift('size="20"');
      edits.push({ start: m.index, end: t.end, text: retag(src, t, m.index, attrs) });
      bump("Switch size 20");
    }
  }

  let out = src;
  edits.sort((a, b) => b.start - a.start);
  for (let i = 1; i < edits.length; i++) {
    if (edits[i].end > edits[i - 1].start) report.push(`${rel}: overlapping edits — check by hand`);
  }
  for (const e of edits) out = out.slice(0, e.start) + e.text + out.slice(e.end);

  if (has.textarea) out = out.replace(/import \{ Textarea \} from "@\/components\/ui\/textarea"/, 'import { TextArea } from "@/components/ui/text-area"');
  if (has.select) {
    out = out.replace(/import \{ NativeSelect \} from "@\/components\/ui\/native-select"/, SELECT_IMPORT);
    // the wrapper's chevron is gone: drop the import when nothing else uses it
    if (!/<ChevronDownIcon\b/.test(out)) out = out.replace(/^[ \t]*ChevronDownIcon,\n/m, "").replace(/\bChevronDownIcon, /, "").replace(/, ChevronDownIcon\b/, "");
    if (/NativeSelect|<option\b/.test(out)) report.push(`${rel}: NativeSelect or <option> left over`);
  }
  if (out !== src) {
    bump("files");
    if (WRITE) fs.writeFileSync(file, crlf ? out.replace(/\n/g, "\r\n") : out);
  }
}

console.log(counts);
console.log(report.length ? "\nBy hand:\n" + report.join("\n") : "\nNothing to do by hand.");
