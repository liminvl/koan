# 2026-07-02 — Stage 2 cold-resume, first real run

- **koan version:** 0.1.0 (working tree on `eb13e7c` + the koan rename, D-010)
- **Stage:** 2
- **Model(s):** claude-fable-5 (user default via `claude -p`), n=1
- **Arms:** n/a — Stage 2 scores the wrapped docs, not a skill arm

## Headline
**3/5 strict, 5/5 on inspection.** Every answer was present in and derived from
the wrapped docs; both strict misses are scorer artifacts (paraphrase/word
order), not information the wrap dropped.

## Numbers
| Question | Strict | Inspected | Note |
|---|---|---|---|
| single most important next step | yes | yes | quoted "DELETE endpoint" |
| why in-memory, not a database | yes | yes | cited D-001, YAGNI + DATABASE_URL |
| file showing data-access conventions | yes | yes | `src/store.js` via Canonical examples |
| open question needing a human | **no** | yes | said "whether `list()` should return completed…" — expect was "Should list() return completed" (word order) |
| what must never move into middleware | **no** | yes | said "Auth checks … must live in handlers, per D-002" — expect was the literal "Auth in handlers" |

## Regression check (vs previous version)
First real Stage 2 datapoint — this is the baseline. Same-day Stage 0: all
budgets under ceiling after the rename (core skill +54 chars, justified by
D-010, recorded).

## Caveats / supersession
- **Superseded** (same day) by `2026-07-02-stage2-judge.md`: the `judge.md` LLM
  judge is now implemented and scored this fixture 15/15, confirming the
  inspection column above mechanically.
- Scorer is literal case-insensitive `includes()`. Treat the strict score as a
  **floor**; upgrade path is any-of/regex expects or the LLM judge (`judge.md`).
  Do not tune `groundtruth.json` to this run's phrasings (overfitting).
- n=1, one model, five questions — directional, not statistical.
- Runner gained Windows support this run: `claude` is an npm `.cmd` shim
  (needs a shell) and the prompt now travels via stdin to dodge shell quoting.
