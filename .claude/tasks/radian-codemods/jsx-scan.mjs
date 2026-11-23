// ---------- scanning helpers ----------
// Skip a JS string/template starting at i (src[i] is the quote). Returns index after it.
function skipString(src, i) {
  const q = src[i];
  let j = i + 1;
  while (j < src.length) {
    const ch = src[j];
    if (ch === "\\") {
      j += 2;
      continue;
    }
    if (q === "`" && ch === "$" && src[j + 1] === "{") {
      j = skipBraces(src, j + 1);
      continue;
    }
    if (ch === q) return j + 1;
    j++;
  }
  return j;
}
// src[i] === "{": return index after the matching "}" (handles strings, templates, JSX).
function skipBraces(src, i) {
  let depth = 0;
  let j = i;
  while (j < src.length) {
    const ch = src[j];
    if (ch === '"' || ch === "'" || ch === "`") {
      j = skipString(src, j);
      continue;
    }
    if (ch === "<" && /[A-Za-z]/.test(src[j + 1] || "")) {
      j = skipJsxElement(src, j);
      continue;
    }
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return j + 1;
    }
    j++;
  }
  return j;
}
// Parse an opening tag at i ("<Name ..."). Returns { name, attrs, end, selfClosing, nameEnd }.
function parseOpenTag(src, i) {
  const m = /^<([A-Za-z][\w.]*)/.exec(src.slice(i, i + 80));
  const name = m[1];
  let j = i + 1 + name.length;
  const nameEnd = j;
  const attrs = [];
  while (j < src.length) {
    const wsStart = j;
    while (/\s/.test(src[j])) j++;
    if (src[j] === "/" && src[j + 1] === ">") return { name, attrs, end: j + 2, selfClosing: true, nameEnd };
    if (src[j] === ">") return { name, attrs, end: j + 1, selfClosing: false, nameEnd };
    if (src[j] === "{") {
      // spread attribute {...x}
      const e = skipBraces(src, j);
      attrs.push({ name: "...", raw: src.slice(j, e), start: wsStart, end: e, value: null });
      j = e;
      continue;
    }
    const nm = /^[A-Za-z_$][\w$.:-]*/.exec(src.slice(j, j + 100));
    if (!nm) return null; // not a JSX tag we understand
    const attrName = nm[0];
    j += attrName.length;
    let value = null;
    let kind = "bool";
    if (src[j] === "=") {
      j++;
      if (src[j] === '"' || src[j] === "'") {
        const e = skipString(src, j);
        value = src.slice(j + 1, e - 1);
        kind = "string";
        j = e;
      } else if (src[j] === "{") {
        const e = skipBraces(src, j);
        const inner = src.slice(j + 1, e - 1).trim();
        const sm = /^(["'])([^"']*)\1$/.exec(inner);
        if (sm) {
          value = sm[2];
          kind = "string";
        } else {
          value = inner;
          kind = "expr";
        }
        j = e;
      }
    }
    attrs.push({ name: attrName, kind, value, start: wsStart, end: j });
  }
  return null;
}
// Skip a whole JSX element starting at i. Returns index after it.
function skipJsxElement(src, i) {
  const t = parseOpenTag(src, i);
  if (!t) return i + 1;
  if (t.selfClosing) return t.end;
  const close = findClose(src, t.end, t.name);
  return close ? close.end : t.end;
}
// Find the closing tag for `name` starting after position i (balanced on same-name tags).
function findClose(src, i, name) {
  let depth = 1;
  let j = i;
  while (j < src.length) {
    const ch = src[j];
    if (ch === "{") {
      j = skipBraces(src, j);
      continue;
    }
    if (src.startsWith(`</${name}>`, j)) {
      depth--;
      if (depth === 0) return { start: j, end: j + name.length + 3 };
      j += name.length + 3;
      continue;
    }
    if (ch === "<" && /[A-Za-z]/.test(src[j + 1] || "")) {
      const t = parseOpenTag(src, j);
      if (t && t.name === name && !t.selfClosing) {
        depth++;
        j = t.end;
        continue;
      }
      if (t) {
        j = t.end;
        if (!t.selfClosing) {
          const c = findClose(src, t.end, t.name);
          if (c) j = c.end;
        }
        continue;
      }
    }
    j++;
  }
  return null;
}


export { skipString, skipBraces, parseOpenTag, skipJsxElement, findClose };
