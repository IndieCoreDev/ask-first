# ask-first

A Claude Code skill that stops the agent asking you things in the middle of a paragraph.

Every question goes in an `AskUserQuestion` card instead — one question at a time, with the
first option marked as the recommended one, chosen against the goal you said you were working
towards.

## Install

```sh
/plugin marketplace add IndieCoreDev/ask-first
/plugin install ask-first@ask-first
```

## Why

Two costs, both paid on every single reply:

- **Length.** You read a long answer to find the one line that needs you.
- **Difficulty.** The words are harder than they need to be, which slows you down again.

A reply holds three different things at the same weight — what was done, what was assumed,
and what is actually needed from you. In plain text they look alike. A card does not look
like a paragraph, so the part that needs you stops hiding.

## What it does

| Rule | |
| --- | --- |
| 1 | Every question goes in a card, never in prose |
| 2 | Only questions — information stays as normal text |
| 3 | One question at a time, always |
| 4 | The first option is the recommendation, marked as such |
| 5 | Get your final goal when the request does not say why, and judge every recommendation against it |
| 6 | Show the difference with a preview when there is something to look at |

## Questions people ask

### Can I install a Claude skill from a gist?

No. A skill is a folder — `skills/<name>/SKILL.md` — and a gist cannot hold folders, because
gist filenames are not allowed to contain `/`. A gist is a real git repo and it clones fine,
but it can never carry the `.claude-plugin/marketplace.json` that an install needs, so
`claude plugin marketplace add` fails on it.

A gist can still hold a single `SKILL.md` with a `curl` line in the description. That is
copy-and-paste, not an install, and it never updates.

### How do I share a Claude Code skill with other people?

Put it in a git repo shaped as a marketplace:

```
your-repo/
  .claude-plugin/marketplace.json
  plugins/<plugin>/.claude-plugin/plugin.json
  plugins/<plugin>/skills/<skill>/SKILL.md
```

Then anyone runs `/plugin marketplace add <owner>/<repo>`. This repo is that shape, so it
works as a copy-paste starting point.

### Can a skill force Claude to do something?

Not force, no — and the difference is worth knowing:

- **A skill instructs.** It puts rules into the model's context. Strong, but the model is
  still choosing to obey, and that gets weaker as a conversation grows long.
- **A hook enforces.** The harness runs your code, not the model, so it does not depend on
  the model agreeing.

This skill is the instruction layer. If you want the misses caught as well, a hook is the
second layer.

### Why does Claude write such long answers?

Because nothing in a plain reply limits its size. A card has a fixed small shape — a short
label, a line or two of description — so it cannot run long and it cannot bury the choice
inside a paragraph. The format does the work that asking for brevity does not.

### Does it ask about everything now?

No. Asking costs you time too. The skill does not ask for a small reversible fix with an
obvious default, for anything the code already answers, or for a decision you already made.
Those get done, and reported in one line.

## Licence

MIT
