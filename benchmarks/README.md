# Benchmarks

Three stages, cheapest first. The cheap one runs every commit; the expensive ones
are milestone-gated. Built to be able to **disprove** koan's value, not only confirm it.

| Stage | What it answers | Cost | When |
|---|---|---|---|
| **0 — selfcheck** | Did a change make the kit bigger without making it better? | free, offline | every commit (`hooks/pre-commit`) |
| **1 — behavior** | Does a rule actually change what the agent does? | API | when content stabilizes |
| **2 — continuity** | Can a fresh agent resume from the wrapped docs alone? | API | milestone |

## Stage 0 — `node benchmarks/selfcheck.mjs`
Skill-token budgets (`budgets.json`) + growth vs `size-history.json` · the
generation canary · `koan-lint` on koan's own docs (dogfood). Exit `0/1/2`.
`--record` appends current sizes to the history (run on release/main).

**This is the anti-bloat gate.** Over a ceiling ⇒ error. Grew but under ⇒ warning
to justify. The regression rule pairs it with Stage 1: *tokens up + behavior flat = cut it.*

## Stage 1 — `node benchmarks/behavior/run.mjs`
Does a rule actually **change behavior**? Each probe is built so the baseline
FAILS and koan PASSES; that delta is the proof the rule took. `--selftest` proves
the graders discriminate offline. A rule whose gate the baseline already passes
isn't earning its tokens. A **core seat** needs the flip replicated — ≥2 of 3
runs on the promotion model (D-022); one flip is provisional. When reading
replicates, **variance is a second signal**: passing runs that converge on one
shape mean the wording binds; scattered interpretations mean fix the *form* of
the rule, not the sample count (superpowers ingest — see `ingest/distill.md`
"Form follows failure").

The **outcome** arm (loc-counting probes on pinned tasks) was deleted 2026-08-05:
it converged on every model it ever ran and decided nothing in seven ingests. Its
run records stay in `results/`. Behavior is the arm that decides things.

## Stage 2 — `node benchmarks/continuity/run.mjs`
`--selftest` (offline, proves the fixture is fair + discriminating) → real run
(cold-resume Q&A judged). The lose-less axis ponytail can't measure.

## Results
Dated snapshots in `results/` are the over-time record. Note supersessions
explicitly (a contaminated or superseded run stays, marked) — see `results/TEMPLATE.md`.
