// Stop hook: type-check the project and lint what this branch changed before Claude finishes.
// Exit code 2 sends the report back to Claude so it fixes the problems before stopping.
//
// Lint is a ratchet, because legacy code still has errors and styling warnings: for every file
// changed on this branch (vs its merge-base with main), a rule may not report more problems
// than it did in the base version of that file. Counted: all errors, plus the styling rules
// (no-restricted-syntax: hex, arbitrary values, default palette), which are warnings in
// eslint.boundaries.mjs. Pre-existing problems don't block; adding to them does.
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const RATCHETED_WARNINGS = new Set(["no-restricted-syntax"]);
const SOURCE = /\.(ts|tsx|js|jsx|mjs|css)$/;
const LINTABLE = /\.(ts|tsx|js|jsx|mjs)$/;
const CACHE = "node_modules/.cache/claude-verify.json";

const sh = (cmd) =>
  execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 << 20 }).trim();
const lines = (s) => s.split("\n").filter(Boolean);

let input = "";
process.stdin.on("data", (c) => (input += c));
process.stdin.on("end", async () => {
  let payload = {};
  try {
    payload = JSON.parse(input || "{}");
  } catch {}

  // Already continuing because of this hook — don't loop forever.
  if (payload.stop_hook_active) process.exit(0);
  if (process.env.CLAUDE_PROJECT_DIR) process.chdir(process.env.CLAUDE_PROJECT_DIR);

  let base;
  try {
    base = sh("git merge-base HEAD origin/main");
  } catch {
    try {
      base = sh("git merge-base HEAD main");
    } catch {
      process.exit(0); // not a git repo with a main branch: nothing to compare against
    }
  }

  // Changed on this branch: committed, uncommitted and untracked. Renames keep their old path
  // so the baseline comes from the right file.
  const oldPath = new Map();
  for (const row of lines(sh(`git diff --name-status -M --diff-filter=ACMR ${base}`))) {
    const [status, a, b] = row.split("\t");
    if (status === "A") oldPath.set(a, null);
    else if (b) oldPath.set(b, a); // renamed or copied: new path → old path
    else oldPath.set(a, a);
  }
  for (const f of lines(sh("git ls-files --others --exclude-standard"))) oldPath.set(f, null);
  const changed = [...oldPath.keys()].filter((f) => SOURCE.test(f) && fs.existsSync(f));
  if (!changed.length) process.exit(0);

  // Skip when nothing changed since the last clean run (e.g. a question-only turn).
  const stamp = (f) => {
    const s = fs.statSync(f);
    return `${f}:${s.size}:${s.mtimeMs}`;
  };
  const fingerprint = createHash("sha1")
    .update(sh("git rev-parse HEAD"))
    .update(sh("git diff HEAD"))
    .update(changed.map(stamp).join("\n"))
    .digest("hex");
  try {
    if (JSON.parse(fs.readFileSync(CACHE, "utf8")).fingerprint === fingerprint) process.exit(0);
  } catch {}

  const report = [];

  try {
    execSync("npx tsc --noEmit", { stdio: "pipe", encoding: "utf8" });
  } catch (e) {
    const out = `${e.stdout ?? ""}${e.stderr ?? ""}`.split("\n").slice(0, 40).join("\n");
    report.push(`$ npx tsc --noEmit\n${out}`);
  }

  const lintable = changed.filter((f) => LINTABLE.test(f));
  if (lintable.length) {
    const { ESLint } = await import("eslint");
    const eslint = new ESLint({ errorOnUnmatchedPattern: false });
    const counted = (m) =>
      m.severity === 2 || (m.severity === 1 && RATCHETED_WARNINGS.has(m.ruleId));
    const tally = (messages) => {
      const t = new Map();
      for (const m of messages.filter(counted)) {
        const k = m.ruleId ?? "(directive)";
        t.set(k, (t.get(k) ?? 0) + 1);
      }
      return t;
    };

    const results = await eslint.lintFiles(lintable);
    for (const result of results) {
      const file = path.relative(process.cwd(), result.filePath).split(path.sep).join("/");
      const now = tally(result.messages);
      if (!now.size) continue;

      let before = new Map();
      const prev = oldPath.get(file);
      if (prev) {
        try {
          const text = sh(`git show ${base}:"${prev}"`);
          const [baseline] = await eslint.lintText(text, { filePath: result.filePath });
          before = tally(baseline.messages);
        } catch {}
      }

      const worse = [...now].filter(([rule, n]) => n > (before.get(rule) ?? 0));
      if (!worse.length) continue;
      const detail = worse.map(([rule, n]) => {
        const hits = result.messages
          .filter((m) => counted(m) && (m.ruleId ?? "(directive)") === rule)
          .slice(0, 8)
          .map((m) => `    ${m.line}:${m.column} ${m.message.split("\n")[0]}`);
        return `  ${rule}: ${before.get(rule) ?? 0} → ${n}\n${hits.join("\n")}`;
      });
      report.push(`${file}\n${detail.join("\n")}`);
    }
  }

  if (report.length) {
    process.stderr.write(
      `Fix these before finishing (lint counts are vs ${base.slice(0, 7)}, the merge-base with main):\n\n` +
        report.join("\n\n"),
    );
    process.exit(2);
  }

  fs.mkdirSync(path.dirname(CACHE), { recursive: true });
  fs.writeFileSync(CACHE, JSON.stringify({ fingerprint }));
  process.exit(0);
});
