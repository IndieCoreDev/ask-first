# ask-first

**A Claude Code plugin that makes Claude ask you questions in a card instead of burying them
in a paragraph.** One question at a time, with a recommended answer. Ships a skill *and*
hooks, so the rules hold even when the model would rather not.

[![check](https://github.com/IndieCoreDev/ask-first/actions/workflows/check.yml/badge.svg)](https://github.com/IndieCoreDev/ask-first/actions/workflows/check.yml)
[![licence: MIT](https://img.shields.io/badge/licence-MIT-blue.svg)](LICENSE)
[![version](https://img.shields.io/badge/version-0.6.0-green.svg)](CHANGELOG.md)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-plugin-8A3FFC.svg)](https://claude.com/claude-code)

---

### Before

> I read the scheduling code — the calendar lives in `schedule-rule.mjs`, the allocator in
> `schedule.mjs`, and the gate runs inside `build.mjs`. There are a few ways to do this. A
> frontmatter flag would be simplest, though you could also track it in the ledger, or push
> the post to the next free day, which changes how the calendar reports it. Let me know which
> you prefer and I'll get started, or if you'd rather I just pick one, say the word.

You read 60 words to find out that a decision is waiting, and you still have to write a reply
in prose.

### After

```
 ☐ Skip shape

 What should "skip" do to a post that's dated and waiting?

 ❯ 1. skip: in frontmatter (Recommended)
      One line in the post itself. The calendar hands the day back.
   2. Track it in the ledger
      Keeps posts untouched, but the reason lives away from the post.
   3. Push to the next free day
      No new field, but it silently moves a date you chose.
```

One glance, one keypress.

## Install

```
/plugin marketplace add IndieCoreDev/ask-first
/plugin install ask-first@ask-first
```

Then **restart Claude Code**. `/reload-plugins` does not load skills — this catches everyone
once.

Requires Claude Code with plugin support, and Node (already present if you run Claude Code).

<details>
<summary>Updating and uninstalling</summary>

```sh
claude plugin marketplace update ask-first
claude plugin update ask-first@ask-first     # then restart
claude plugin uninstall ask-first@ask-first  # removes the skill and both hooks
```

</details>

## Why

Two costs, both paid on every single reply:

- **Length.** You read a long answer to find the one line that needs you.
- **Difficulty.** The words are harder than they need to be, which slows you down again — and
  most people using a coding agent are not reading their first language.

A reply holds three different things at the same weight: what was done, what was assumed, and
what is actually needed from you. In plain text they look alike, so you read all of it to
find the part that blocks progress. A card does not look like a paragraph. The part that
needs you stops hiding.

## The rules

| | Rule |
| --- | --- |
| 1 | Every question goes in a card, never in prose |
| 2 | Only questions — information stays as normal text |
| 3 | One question at a time, always |
| 4 | The first option is the recommendation, and it is marked |
| 5 | Get your final goal when the request does not say why, and judge every option against it |
| 6 | Show the difference with a preview when there is something to look at |

## What is enforced, and what is only taught

A skill is instruction: it puts rules in the model's context, and the model mostly follows
them. This plugin also ships **hooks**, which run whether the model agrees or not.

| Rule | How |
| --- | --- |
| One question per card | Hook. The call is rejected before it is sent. |
| Recommendation first, marked | Hook. Rejected, naming where the recommendation actually was. |
| No question left in prose | Hook. The turn is blocked until it becomes a card. |
| Only questions in the card | Skill text only. |
| Name the goal, judge against it | Skill text only. |

That split is the honest one, and it came out of testing rather than design. Three rewrites of
the skill text narrowed the one-question gap without closing it. One hook closed it on the
first try, against a user actively asking for two questions at once. But a hook can only check
a *shape* — whether a question named your real goal is a judgement, and the only lever there
is the skill text.

## How it works

```
.claude-plugin/marketplace.json           the marketplace entry
plugins/ask-first/
  .claude-plugin/plugin.json              the plugin manifest
  skills/ask-first/SKILL.md               the rules, loaded into context
  hooks/hooks.json                        wires both hooks
  hooks/check-card.mjs                    PreToolUse on AskUserQuestion
  hooks/check-prose.mjs                   Stop: catches a turn that ends waiting
tests/run.mjs                             22 cases, run by CI on every push
```

Both hooks are short, unminified and dependency-free. They read the pending question and your
session transcript, write nothing, and make no network calls — see [SECURITY.md](SECURITY.md).

## Questions people ask

### Can I install a Claude skill from a gist?

No. A skill is a folder — `skills/<name>/SKILL.md` — and a gist cannot hold folders, because
gist filenames are not allowed to contain `/`. A gist is a real git repo and clones fine, but
it can never carry the `.claude-plugin/marketplace.json` an install needs, so
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

Then anyone runs `/plugin marketplace add <owner>/<repo>`. This repo is exactly that shape, so
clone it as a starting point.

### Can a skill force Claude to do something?

A skill alone cannot. A skill is instruction — it puts rules in the model's context, and
obedience gets weaker as a conversation grows longer. A **hook** is enforcement: the harness
runs your code, so it does not depend on the model agreeing.

This plugin ships both, which is the point. Use skill text for judgement, hooks for anything
with a checkable shape.

### My skill does not show up. Why?

In order of how often it is the cause:

1. **You did not restart.** `/reload-plugins` reports `0 skills` and does not load them.
   Skills are read when a session starts.
2. **Run `claude plugin validate <path>`** on both the plugin folder and the marketplace root.
   It names the problem, and almost nobody mentions it.
3. Check `enabledPlugins` in `~/.claude/settings.json`.
4. Check the installed copy on disk under `~/.claude/plugins/cache/`.

### Why does Claude write such long answers?

Nothing in a plain reply limits its size. A card has a fixed small shape — a short label, a
line or two of description — so it cannot run long and cannot bury the choice inside a
paragraph. The format does the work that asking for brevity does not.

### Does it ask about everything now?

No, and that matters — asking costs you time too. It does not ask for a small reversible fix
with an obvious default, for anything the code already answers, or for a decision you already
made. Those get done and reported in one line.

### Will the hook block normal replies?

It is written not to. It ignores a question mark inside code, a turn that already used a card,
and reports like "the profiler will tell me where the time goes". It never blocks on input it
cannot parse. If it does nag you, that is the bug worth reporting most — open an issue with
the exact text.

## Contributing

Bug reports and rule proposals are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) and the
[Code of Conduct](CODE_OF_CONDUCT.md). The most useful report is a false block: the hook
stopping a reply that was not asking you anything.

Every rule here exists because a real session got past one, and every one has a test.

## Licence

MIT — see [LICENSE](LICENSE).
