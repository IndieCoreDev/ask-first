#!/usr/bin/env node
// Stop hook. Catches a question left in prose at the end of a turn.
//
// This started as a `"type": "prompt"` hook, which the plugin-dev docs recommend for
// judgement calls. It never fired, and no plugin on the official marketplace ships one,
// so it is rebuilt here as a deterministic command hook.
//
// It errs towards letting the turn end. A wrong block costs a whole turn, and a hook that
// nags is a hook that gets uninstalled.

import { readFileSync } from "node:fs";

const PHRASES = [
  /\blet me know\b/i,
  /\bshould i\b/i,
  /\bdo you want\b/i,
  /\bwould you like\b/i,
  /\bif you'?d like\b/i,
  /\bwhich would you\b/i,
  /\bwant me to\b/i,
  /\bshall i\b/i,
  /\byour call\b/i,
];

let raw = "";
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    process.exit(0);
  }
  // Never re-block a turn this hook already blocked.
  if (input?.stop_hook_active) process.exit(0);

  let rows;
  try {
    rows = readFileSync(input.transcript_path, "utf8")
      .split("\n")
      .filter(Boolean)
      .map((l) => {
        try {
          return JSON.parse(l);
        } catch {
          return null;
        }
      })
      .filter((r) => r && !r.isSidechain);
  } catch {
    process.exit(0); // no readable transcript — never block on our own failure
  }

  // Walk back to the start of this turn, collecting what the assistant said and used.
  const text = [];
  const tools = [];
  for (let i = rows.length - 1; i >= 0; i--) {
    const r = rows[i];
    if (r.type === "user" && !r.isMeta) break;
    if (r.type !== "assistant") continue;
    for (const b of r.message?.content ?? []) {
      if (b?.type === "text" && b.text) text.unshift(b.text);
      if (b?.type === "tool_use" && b.name) tools.push(b.name);
    }
  }
  // A card was already used this turn — the rule is satisfied.
  if (tools.includes("AskUserQuestion")) process.exit(0);

  const prose = text
    .join("\n")
    .replace(/```[\s\S]*?```/g, "")   // code blocks are not questions to the user
    .replace(/`[^`\n]*`/g, "")
    .trim();
  if (!prose) process.exit(0);

  const asked = /\?/.test(prose) || PHRASES.some((p) => p.test(prose));
  if (!asked) process.exit(0);

  process.stdout.write(
    JSON.stringify({
      decision: "block",
      reason:
        "ask-first: you ended the turn with a question in prose. Put it in an " +
        "AskUserQuestion card instead: one question, 2-4 options, the one you recommend " +
        "first with (Recommended) at the end of its label. If it was not really a question " +
        "for the user, rewrite the line as a statement and finish.",
    }),
  );
  process.exit(0);
});
