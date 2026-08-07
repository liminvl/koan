# 2026-07-02 — Stage 1 first real run (behavior gates + outcome A/B)

- **koan version:** 0.1.0 (working tree on `9b9c3bc`)
- **Stage:** 1
- **Model(s):** claude-fable-5 (user default via `claude -p`), n=1
- **Arms:** baseline (empty system), rival (85-char "be concise" one-liner), koan (dist/agents/AGENTS.md, ~4.5k chars via `--append-system-prompt`)

## Headline
**Mixed, honest.** Outcome: all arms pass both gates, and koan is the leanest
on both tasks — safeJoin **15 loc vs 27 (baseline) / 25 (rival)**, so the
"be concise" one-liner did NOT capture koan's loc edge there. Behavior: the
**trail** rule manifests under koan but also under rival; **onecheck never
manifested in any arm** (koan's rule didn't take); **explanation** is passed by
everyone, including baseline — by our own standard, not earning its tokens.

## Numbers

Behavior gates (does the rule change behavior?):

| probe | rule | baseline | rival | koan |
|---|---|---|---|---|
| trail | lose-less: real choice → logged decision | no | yes | yes |
| onecheck | build-less: non-trivial logic → one runnable check | no | no | **no** |
| explanation | requested write-up given in full | **yes** | yes | yes |

Outcome A/B (gates + loc; lower loc only counts when the gate passes):

| arm | task | loc | gate |
|---|---|---|---|
| baseline | safeJoin | 27 | pass |
| baseline | sumAmounts | 11 | pass |
| rival | safeJoin | 25 | pass |
| rival | sumAmounts | 9 | pass |
| koan | safeJoin | **15** | pass |
| koan | sumAmounts | **9** | pass |

## Regression check (vs previous version)
First real Stage 1 datapoint — this is the baseline. Two candidate cuts flagged
by the anti-bloat rule, both n=1 so flag-not-convict:
- **explanation** probe: baseline already passes → the underlying rule may not
  be earning its tokens (or the probe is too easy — it asks for the write-up
  explicitly, which any model honors).
- **onecheck**: koan carries the rule and it did NOT manifest. Either the rule
  text is too weak, the probe's task is too small to trigger it, or the grader
  (assert/test-pattern regex) misses the form the check took. This run's
  behavior answers were not preserved (that landed after); the runner now keeps
  them in `benchmarks/runs/behavior-<date>/` — inspect on the next run before
  touching the rule.

## Caveats / supersession
- n=1, one model, 3 probes + 2 tasks — directional, not statistical.
- Two instrument bugs were found and fixed DURING this run (TDZ crash in the
  runner; safeJoin gate rejected safe-by-refusal implementations that throw on
  traversal). The outcome table above is the post-fix re-score of the preserved
  answers in `benchmarks/runs/outcome-2026-07-03/` (`--rescore`, zero re-spend).
  The behavior table is from the first (pre-fix) run — those 9 calls were
  unaffected by either bug.
- The outcome prompt now forbids import/require (the grader's sandbox is bare);
  the first outcome attempt conflated "used node:path" with "unsafe" and was
  discarded as instrument error.
- rival's 85 chars vs koan's ~4.5k: on this evidence rival buys trail+concision
  cheaply; koan's edge is the extra loc reduction with gates still green.
