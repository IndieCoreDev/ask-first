#!/usr/bin/env node
// The gate. Every case here is one a real session got wrong.
//
//   node tests/run.mjs
//
import { execFileSync } from "node:child_process";
import { writeFileSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = mkdtempSync(join(tmpdir(), "ask-first-"));
let failed = 0;

const run = (hook, input) => {
  try {
    const out = execFileSync("node", [join(root, "plugins/ask-first/hooks", hook)], {
      input: JSON.stringify(input),
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return { blocked: out.trim().length > 0, out };
  } catch (e) {
    // exit 2 is a deny; stderr carries the reason
    return { blocked: true, out: (e.stderr ?? "") + (e.stdout ?? "") };
  }
};

const check = (name, got, want) => {
  const ok = got === want;
  if (!ok) failed++;
  console.log(`  ${ok ? "ok  " : "FAIL"}  ${name}${ok ? "" : `  (blocked=${got}, expected ${want})`}`);
};

// --- the card hook: one question, recommendation first -----------------------
const card = (questions) => run("check-card.mjs", { tool_input: { questions } });
const q = (options) => [{ question: "x", options }];
const OK = [{ label: "Do X (Recommended)" }, { label: "Do Y" }];

console.log("check-card.mjs");
check("two questions in one card", card([...q(OK), { question: "y", options: OK }]).blocked, true);
check("no option marked recommended", card(q([{ label: "Do X" }, { label: "Do Y" }])).blocked, true);
check("recommendation in second place", card(q([{ label: "Do X" }, { label: "Do Y (Recommended)" }])).blocked, true);
check("a correct card", card(q(OK)).blocked, false);
check("unparseable input never blocks", run("check-card.mjs", "not-json").blocked, false);

// --- the prose hook: a turn that ends waiting is a question -------------------
const turn = (text, tools = []) => {
  const p = join(dir, `${Math.random().toString(36).slice(2)}.jsonl`);
  const content = [{ type: "text", text }, ...tools.map((name) => ({ type: "tool_use", name }))];
  writeFileSync(
    p,
    [
      JSON.stringify({ type: "user", message: { role: "user", content: "go" } }),
      JSON.stringify({ type: "assistant", message: { content } }),
    ].join("\n"),
  );
  return run("check-prose.mjs", { transcript_path: p, stop_hook_active: false });
};

console.log("check-prose.mjs");
check("a question in prose", turn("Is the branch ready to open as a PR?").blocked, true);
check("hedge phrase, no question mark", turn("I bumped it. Let me know if you want the changelog.").blocked, true);
check("handoff: say go", turn("Say go and I'll push the branch.").blocked, true);
check("handoff: ready when you are", turn("I bumped the version. Ready when you are.").blocked, true);
check("handoff: tell me which", turn("Tell me which branch you saw it on and I will dig in.").blocked, true);
check("a plain report", turn("Done. Tests pass and nothing else changed.").blocked, false);
check("assumption then did the work", turn("Assumption: it is done. I pushed it and opened PR #45.").blocked, false);
check("'will tell me' is a report", turn("The profiler will tell me where the time goes.").blocked, false);
check("'will not tell me whether' is a report", turn("That check will not tell me whether it is finished, so I ran the suite.").blocked, false);
check("question mark inside code", turn('Run: `curl "https://x/?a=1"`').blocked, false);
check("a card was already used", turn("Here are the options.", ["AskUserQuestion"]).blocked, false);
check(
  "loop guard: never re-block",
  run("check-prose.mjs", { transcript_path: join(dir, "missing.jsonl"), stop_hook_active: true }).blocked,
  false,
);

// --- the manifests -----------------------------------------------------------
console.log("manifests");
const json = (p) => JSON.parse(readFileSync(join(root, p), "utf8"));
const mkt = json(".claude-plugin/marketplace.json");
const plg = json("plugins/ask-first/.claude-plugin/plugin.json");
const skill = readFileSync(join(root, "plugins/ask-first/skills/ask-first/SKILL.md"), "utf8");
check("marketplace names the plugin", mkt.plugins?.[0]?.name === "ask-first", true);
check("plugin source path resolves", mkt.plugins?.[0]?.source === "./plugins/ask-first", true);
check("plugin has a version", /^\d+\.\d+\.\d+$/.test(plg.version ?? ""), true);
check("skill frontmatter matches plugin version", skill.includes(`version: ${plg.version}`), true);
check("skill declares a name and description", /^---[\s\S]*?\nname:[\s\S]*?\ndescription:/m.test(skill), true);

console.log(failed ? `\n${failed} failing` : "\nall passing");
process.exit(failed ? 1 : 0);
