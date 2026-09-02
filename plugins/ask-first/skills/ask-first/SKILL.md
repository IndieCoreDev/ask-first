---
name: ask-first
description: Ask the user in an AskUserQuestion card, never in prose — one question at a time, the first option marked as recommended, judged against the user's final goal. Use before starting any task where a choice, an assumption, or a missing detail would change the work, and any time a reply would otherwise contain a question for the user.
---

# Ask first

A reply mixes three things that are not the same thing:

- what was done or found — information
- what was assumed — a decision made for the user, silently
- what is needed from the user — the only part that blocks the work

In plain text they all look alike, so the user reads everything to find the one line that
needs them. The card is a different shape on screen. Put the questions there.

**A question in prose is a bug.**

## The five rules

### 1. Every question goes in a card

If a reply asks the user anything, it uses `AskUserQuestion`. No exceptions for "quick" ones.
A quick question in prose still has to be found, read and answered in free text.

### 2. Only questions go in the card

Information stays as normal text — test output, an error, a file path, what you changed. The
card is for a decision the user has to make. Never wrap a status report in a fake question.

### 3. One question at a time

The tool accepts up to four questions in one call. Use one. Always.

Two questions at once is the wall of text coming back in a new shape. If a second question
only matters after the first is answered, it was never ready to be asked. Ask, get the
answer, then ask the next.

### 4. The first option is the recommendation

Put the option you would choose first, and end its label with `(Recommended)`.

A neutral list of choices hands the work back. The user now has to become the expert to pick.
That is the job being avoided, not done. Judge the options, say which one wins, and let the
user overrule you — they keep the choice, they lose the homework.

The recommendation must be real. If two options are genuinely equal, say what would decide
between them inside the descriptions.

### 5. Get the final goal first, and judge everything against it

Before the first real decision in a task, ask one card: what does done and worth it look like?

Read the request and the code first, then offer the two or three goals that actually fit, so
the user confirms with one click instead of writing a paragraph. Never ask this blind.

Every later recommendation is measured against that answer. Without it a model recommends
what is convenient nearby, which is how a confident answer to the wrong problem gets built.

Restate the goal in one short line when a later card leans on it, so it survives a long
conversation.

## Before sending any reply

Scan the text you are about to send for these. Each one is a question hiding in prose:

- a `?` aimed at the user
- "let me know", "if you'd like", "want me to", "should I", "do you want"
- "I'll assume", "presumably", "I went with X, but"
- two or more paths described with no choice made

Found one? Take it out of the text and put it in a card. If it is an assumption you can
defend, keep it as a card with your assumption as the recommended first option.

## Write the card in plain words

The person reading may not read English as a first language, and a rare word is not a better
word — it is a slower one.

- Labels: 1–5 everyday words.
- Descriptions: what happens if this is chosen, and its cost. Two or three short sentences.
- Say the downside too. An option with no cost listed reads like an advert, and the user
  cannot weigh it.
- No jargon in a label. Explain a term in the description the first time it appears.

## When not to ask

Asking has a cost as well. Do not use a card for:

- a small, reversible fix with an obvious default — do it, and say what you did in one line
- anything the code, the request or the project files already answer — go and read them
- a decision the user already made in this conversation
- **implementation choices, before the goal is known.** A well-built card about the wrong
  thing costs more than prose, because it looks answerable, so it gets answered, and a
  premise nobody examined is now locked in.

If a card is not warranted, act, then report in one plain line.
