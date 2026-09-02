# Security

## What this plugin can do

ask-first ships two hooks. Hooks run on your machine, with your permissions, on every turn:

- `hooks/check-card.mjs` reads the pending `AskUserQuestion` call from stdin.
- `hooks/check-prose.mjs` reads your session transcript at the path the harness passes it.

Neither writes files, makes network requests, or runs anything else. The transcript is read
in-process and never leaves the machine. Both are short and unminified — read them before you
install, as you should with any plugin that ships hooks.

## Reporting a vulnerability

Email **indiecode25@gmail.com** with the details and a way to reproduce it. Please do not
open a public issue for a security problem.

Expect a reply within a week. If the report is valid, you will be credited in the changelog
unless you would rather not be.

## Supported versions

The latest release only. This is a small plugin; fixes ship forward.
