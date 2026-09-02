# Contributing

## Before you open a PR

```sh
claude plugin validate .                 # the marketplace manifest
claude plugin validate plugins/ask-first # the plugin manifest
```

Both must pass clean. A warning here is what you check first when a skill does not appear.

## Testing a change locally

```sh
claude plugin marketplace add .
claude plugin install ask-first@ask-first
claude                                   # restart: /reload-plugins does NOT load skills
```

After editing, `claude plugin marketplace update ask-first && claude plugin update
ask-first@ask-first`, then restart again.

## Adding a rule

The same bar as any check that blocks work:

- **Add it for something that actually happened**, not for a rule that sounds sensible.
  Every entry in `CHANGELOG.md` names the test that found it.
- **Decide whether it is teachable or enforceable.** A rule with a shape belongs in
  `hooks/`. A rule needing judgement belongs in `SKILL.md`, and lands most of the time.
- **A hook that nags gets uninstalled.** Bias every ambiguous case towards letting the turn
  end, and never block on input the hook cannot parse.
- **Cover the false positive.** "Tell me which branch" is a handoff; "the profiler will tell
  me where the time goes" is a report. If your pattern cannot tell them apart, it is not
  ready.

## Style

Plain words. The people reading a card often do not read English as a first language, and a
rarer word is not a better one.

## The one command

```sh
node tests/run.mjs
```

Run it before every push. CI runs the same file on every push and pull request, so a branch
that fails here cannot merge. Add a case to it for anything you fix.
