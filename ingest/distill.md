# Distilling a repo into koan lessons

> **The pipeline is paused (2026-08-05)** — see `LESSONS.md`. Seven ingests, no
> `src/` change. Follow this only if a candidate source clears the bar below on
> its own merits; don't ingest on a schedule.

How koan gets better over time: ingest a useful repo, extract the *craft
techniques* that survive scrutiny, and feed them into the next build. Human-in-loop
by design — no extractor script. A lesson is only worth adding if it changes the
source; a lesson that doesn't is noise (koan's own YAGNI, applied to itself).

## Procedure
1. **Add the repo** under `ingest/sources/<name>/` (clone or symlink; gitignored).
2. **Read its skill/rule files** — `SKILL.md`, `AGENTS.md`, rule files, any
   benchmark or template. Read for *technique*, not features.
3. **Extract candidate lessons.** For each, write one `ingest/lessons/<source>.md` entry:
   - the technique, in one line;
   - the source (`<repo> · <file>`);
   - what in koan it would change (a section, a rule, a metric) — or "nothing yet".
   Add a pointer line to the `LESSONS.md` index if this is a new source.
4. **Triage with the human.** Each lesson is `adopt` / `reject` / `defer`. Reject
   anything that adds words without changing behavior, or duplicates a rule koan
   already has. A rejected lesson stays logged (so it isn't re-proposed).
5. **Apply the adopted ones to `src/`** in a single change, then `npm run build`
   and `npm run selfcheck`. If selfcheck flags a budget grow with no outcome
   change, the lesson didn't earn its tokens — revert it.

## The bar
A lesson must make koan **shorter, clearer, stickier, or measurably better** —
not just longer. "It's a good idea" is not the bar; "it changes a line and the
benchmark agrees" is.

**The fit-test:** if a feature would still earn its tokens in a project that
never has a second session and never risks over-building, it isn't koan's to
carry — it belongs to a general prompting cookbook, not this kit. koan's job is
narrower: catch build-less and lose-less failures. A lesson has to serve one of
those two, not "be generally useful."

**Form follows failure:** when a lesson does earn skill tokens, match the
wording form to the observed baseline failure before writing it (superpowers,
wording-tested): a rule *skipped under pressure* → blunt prohibition; a
*wrong-shaped output* → a positive recipe stating what the output IS
(prohibitions measurably backfire here — worse than no guidance at all); a
*missing element* → a required slot in the template; *condition-dependent
behavior* → a conditional on an observable predicate. No nuance clauses —
"don't X unless it matters" reopens the negotiation; a real exception is its
own conditional. When a delta probe won't flip, suspect the form before adding
words.
