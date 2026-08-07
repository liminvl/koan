# 2026-07-11 — Stage 2, cold-resume on Opus 4.8

- **koan version:** 0.1.0 (`cae1639`)
- **Stage:** 2 (continuity / lose-less)
- **Model(s):** resume agent Opus 4.8 (`claude-opus-4-8`); judge sonnet-4-6
  (pinned, D-011). n=1 — first Stage 2 run with `--model` (prior Stage 2 was
  unpinned, 2026-07-02).
- **Arms:** single-fixture cold-resume (not an A/B — see caveats).

## Headline
A fresh Opus 4.8 agent, given **only** the wrapped fixture docs
(CLAUDE.md + HANDOFF + DECISIONS), resumed **perfectly**: judge **15/15**, all
five continuity questions correct and complete. This is the counterpoint to the
same-day Stage 1 null — where koan's build-less half showed no delta on Opus,
the **lose-less half delivers**: the wrap format carries every load-bearing fact
a cold agent needs.

## Numbers
| # | question | strict floor | judge |
|---|---|---|---|
| 0 | most important next step | yes | 3/3 |
| 1 | why in-memory store (YAGNI + DATABASE_URL trigger) | yes | 3/3 |
| 2 | which file shows data access | yes | 3/3 |
| 3 | open question for the human | no* | 3/3 |
| 4 | what must never move to middleware | no* | 3/3 |

**Total: strict 3/5 (floor), judge 15/15.**

\* The two strict-floor "no"s are literal substring-match artifacts, not misses,
both confirmed correct by the judge and the visible answers:
- Q3 key `"Should list() return completed"` vs answer `"list() should return
  completed todos or only open ones"` — reordered, so the literal substring
  fails.
- Q4 key `"Auth in handlers"` vs answer `"Auth checks… must live in the route
  handler, never in middleware"` — same fact, different words.
This is the two-layer design working as intended (D-011): the strict floor is a
free conservative gate; the judge scores meaning so paraphrases aren't misses.

## Regression check (vs previous version)
No skill-token change. Read alongside the same-day Stage 1 (`…-stage1-opus-new-probes.md`):
on Opus 4.8, **build-less converges (no delta) but lose-less scores perfect** —
the measurable, differentiating value of koan on a frontier model is the
continuity axis.

## Caveats / supersession
- **Single-arm fixture test**, not a koan-vs-nothing A/B. What it proves: the
  koan-wrapped fixture contains all five load-bearing facts in a form a cold
  Opus agent extracts cleanly, and the fixture is discriminating (a wrap that
  *dropped* a fact would show as a miss — the selftest asserts this). What it
  does **not** prove: that koan-wrapped docs beat un-wrapped notes in general.
- **n=1**, one fixture, one model. Directional, not a distribution.
- Does not supersede the 2026-07-02 Stage 2 run (that predates D-012 isolation
  and the `--model` axis); this is the first pinned-model cold-resume.
