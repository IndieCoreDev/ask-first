# Changelog

Notable changes to ask-first. Versions follow [semver](https://semver.org/), and each entry
says what a real test found, because every rule here exists because something got past one.

## 0.6.0

- Catch a turn that ends *waiting* for the user, not just one with a question mark. Blocked
  from asking in prose, the model rewrote its questions as assumptions and finished with
  "Say go and I'll push the branch" — no question mark, no hedge phrase, still a question.
- Narrow the escape in the block message: a stated assumption only counts if the work
  continues in the same turn.
- Lookbehind on the `tell me which` pattern, so "the profiler will tell me where the time
  goes" reads as a report rather than a handoff.

## 0.5.0

- Rebuild the prose check as a deterministic command hook. It was a `"type": "prompt"` hook,
  which the official hook-development docs recommend for judgement calls — it never fired,
  and no plugin on the official marketplace ships one.
- The Stop hook now never blocks on input it cannot parse, and honours `stop_hook_active`.

## 0.4.0

- Add hooks. Three rewordings of the skill text narrowed the one-question gap without closing
  it; a `PreToolUse` hook closed it on the first try, against a user actively asking for two
  questions at once.
- Reject a card with more than one question, or whose first option is not marked
  `(Recommended)` — naming the position when the recommendation is merely misplaced.

## 0.3.0

- Find out cheaply before asking. Told to make a script faster, the model profiled it first
  and found the local work was 60 ms against a 249 ms network call. A goal question asked
  before those numbers existed would have made the user choose blind.
- Put the goal *in* the question rather than asking which change to make.

## 0.2.0

- Ask for the goal only when the request does not say why. Rule 5 and "never ask what the
  request already answers" genuinely conflict, and a goal card after a clear request is the
  same reading tax this skill exists to remove.
- Add option previews.

## 0.1.0

- First release. Five rules: every question in a card, only questions in the card, one at a
  time, the recommendation first and marked, and the final goal judged against.
