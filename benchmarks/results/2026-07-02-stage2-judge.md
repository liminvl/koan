# 2026-07-02 — Stage 2 cold-resume, judged scorer

- **koan version:** 0.1.0 (`9d43c31` + the judge-scorer upgrade)
- **Stage:** 2
- **Model(s):** answers claude-fable-5 (user default via `claude -p`); judge
  claude-sonnet-4-6 (pinned, `judge.md`), n=1
- **Arms:** n/a — Stage 2 scores the wrapped docs, not a skill arm

## Headline
**Strict 3/5 (floor), judge 15/15.** The judged scorer confirms the first run's
inspection: both strict misses were paraphrase artifacts, not dropped
information. The wrapped docs carry every answer.

## Numbers
| Question | Strict | Judge | Fact the judge named |
|---|---|---|---|
| single most important next step | yes | 3/3 | DELETE endpoint |
| why in-memory, not a database | yes | 3/3 | YAGNI until a deploy target; DATABASE_URL |
| file showing data-access conventions | yes | 3/3 | src/store.js |
| open question needing a human | no | 3/3 | Should list() return completed |
| what must never move into middleware | no | 3/3 | Auth stays in handlers |

All 5 questions passed judge calibration (synthetic known-good ranked above
known-bad) — no `untrusted` fallbacks.

## Regression check (vs previous version)
Scorer change only — no skill-content change, so no tokens-vs-outcome question.
Judge total becomes the Stage 2 headline going forward; strict stays reported
as the free floor. Same-day Stage 0: clean.

## Caveats / supersession
- Supersedes `2026-07-02-stage2-cold-resume.md` as the scoring method of
  record; that run's "5/5 on inspection" is now the mechanical "judge 15/15".
- Groundtruth untouched (no overfitting); the fix was judging meaning, not
  adding phrasings.
- Judge temperature isn't settable through the CLI — scores are near- but not
  fully deterministic (noted in `judge.md`).
- n=1, one answer model, five questions — directional, not statistical.
