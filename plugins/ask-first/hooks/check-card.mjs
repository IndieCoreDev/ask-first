#!/usr/bin/env node
// PreToolUse hook for AskUserQuestion.
// Enforces the rules that are mechanical: one question, and a marked recommendation.
// Judgement rules (is this the right question? does it name the goal?) are not
// checkable here — the Stop hook handles those with an LLM.

let raw = "";
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  let questions;
  try {
    questions = JSON.parse(raw)?.tool_input?.questions;
  } catch {
    process.exit(0); // unreadable input is not the model's fault — never block on it
  }
  if (!Array.isArray(questions) || questions.length === 0) process.exit(0);

  const deny = (msg) => {
    process.stderr.write(
      JSON.stringify({
        hookSpecificOutput: { permissionDecision: "deny" },
        systemMessage: msg,
      }),
    );
    process.exit(2);
  };

  if (questions.length > 1) {
    deny(
      `ask-first: ${questions.length} questions in one card. Ask one question at a time. ` +
        `Send the first one on its own, then ask the next after it is answered — a question ` +
        `that only matters after the first is answered was not ready to be asked.`,
    );
  }

  const options = questions[0]?.options;
  if (!Array.isArray(options) || options.length < 2) process.exit(0);

  const first = String(options[0]?.label ?? "");
  if (!/\(recommended\)\s*$/i.test(first)) {
    const marked = options.findIndex((o) => /\(recommended\)/i.test(String(o?.label ?? "")));
    deny(
      marked > 0
        ? `ask-first: the recommended option is at position ${marked + 1}. Move it first — ` +
            `the reader should meet your recommendation before the alternatives.`
        : `ask-first: no option is marked "(Recommended)". Decide which one you would choose, ` +
            `put it first, and end its label with "(Recommended)". A neutral list hands the ` +
            `judgement back to the user, which is the work you were asked to do.`,
    );
  }
  process.exit(0);
});
