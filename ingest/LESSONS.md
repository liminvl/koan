# Lessons

> **FROZEN 2026-08-05.** Seven external ingests produced **zero** `src/` changes —
> the fit-test held every time, and the last three found third parties
> re-deriving gates koan already had. This is a read-only record, not an active
> pipeline; `distill.md` describes how to restart one if a source ever justifies
> it. Stage 0 no longer budgets these files.

Craft techniques distilled from ingested repos, per `distill.md`. Each entry:
**technique · source · status** where status is `adopted` (already in `src/`),
`proposed` (worth applying — needs human triage), `deferred`, or `rejected`
(logged so it isn't re-proposed). The bar: a lesson must make koan *shorter,
clearer, stickier, or measurably better* — not just longer.

## Provenance

| Source | Version/path | Ingested | What it is |
|--------|--------------|----------|-----------|
| **ponytail** | v4.8.4 | 2026-06-30 | Build-less + benchmarking foundation |
| **handoff** | user-level skills | 2026-06-30 | Lose-less discipline foundation |
| **first-year** | live field deployment | 2026-07-04 | 15-session deploy; archive lifecycle proof |
| **vibe-shield** | 103-commit production | 2026-07-04 | 31/43 archived; keep-if-cited validated |
| **rtime** | 138-commit cross-tool | 2026-07-04 | Docs-only; two harnesses, one continuity |
| **9arty** | sibling-seeded deploy | 2026-07-04 | Retired-ritual rot in scaffolding; never-run-code bug class |
| **iams** | 24-commit internal line-of-business app | 2026-07-05 | Build-less reasoning in the wild; check-11 field proof |
| **handoff-kit** | parallel kit, same author | 2026-07-04 | Greenfield interview + fit-test + human sign-off |
| **agent-skills** | Addy Osmani's 24-skill SDLC | 2026-07-10 | Trigger-surface check via TF-IDF + hook evidence |
| **superpowers** | Prime Radiant's SDLC plugin | 2026-07-11 | Form-follows-failure + description-workflow hazard + compact matcher |
| **mattpocock-skills** | Matt Pocock's 20+ skills | 2026-07-11 | Ephemeral handoff (third continuity confirmation); leading-words already-embodied |
| **caveman** | Julius Brussee's output voice | 2026-07-11 | Honesty-discipline convergence from different axis; bidirectional fit-test reject |
| **agent-handoff** | WeirdSky924 third-party lose-less | 2026-07-11 | Snapshot-not-diary independently re-derived; 2-budgeted-docs > 8-docs-reordered |
| **skillgrade** | mgechev's eval framework | 2026-07-11 | Normalized Gain formalizes D-013; workspace-outcome focus |
| **agent-rules-books** | mattpocock/agent-rules-books | 2026-07-11 | Decision-equivalence target naming; delta-gate sixth-independent arrival |
| **rtk** | rtk-ai/rtk v0.28.2 | 2026-07-20 | Token-proxy hook; first mechanical *complement* (orthogonal, not a rival) |

## Index

- [ponytail](lessons/ponytail.md) — Build-less discipline + testing/benchmarking foundation
- [handoff](lessons/handoff.md) — Lose-less discipline foundation
- [first-year](lessons/first-year.md) — Field validation; archive lifecycle; budget pressure
- [vibe-shield](lessons/vibe-shield.md) — Archive end-to-end under pressure; keep-if-cited rule
- [rtime](lessons/rtime.md) — Cross-tool validation; stale-claim lint; header-alone doesn't prune
- [9arty](lessons/9arty.md) — Retired-ritual rot in scaffolding; never-run-code finds bugs
- [iams](lessons/iams.md) — Build-less reasoning in the wild; check-11 field proof
- [handoff-kit](lessons/handoff-kit.md) — Greenfield interview + fit-test one-liner + human sign-off
- [agent-skills](lessons/agent-skills.md) — Trigger-surface check (TF-IDF) + hook evidence + copies-model ceiling
- [superpowers](lessons/superpowers.md) — Form-follows-failure + variance-as-signal + description-shortcut hazard
- [mattpocock-skills](lessons/mattpocock-skills.md) — Ephemeral handoff + context-vs-cognitive-load vocabulary
- [caveman](lessons/caveman.md) — Honesty-discipline on different axis; Auto-Clarity carve-outs
- [agent-handoff](lessons/agent-handoff.md) — Snapshot-not-diary independently re-derived; lifecycle efficiency
- [skillgrade](lessons/skillgrade.md) — Normalized Gain formalizes delta gate; outcome-focused grading
- [agent-rules-books](lessons/agent-rules-books.md) — Decision-equivalence naming + delta-gate convergence + build-better vs build-less
- [rtk](lessons/rtk.md) — Orthogonal token economy (complements D-024); wrap-vs-truncation caveat; single-source hook = D-002

---

## Queued (historical — never ingested; the pipeline froze first)
Kept as the record of what was triaged and not taken. Each names the koan surface
it would have tested; restart per `distill.md` only if a source clears the bar the
seven no-change ingests set.

1. **skilljack-evals** (`olaservo/skilljack-evals`) — CLI measuring skill **discoverability / instruction-adherence / output-quality** across models + SDKs, runnable as a GitHub Action. Same eval axis as skillgrade (the live axis — koan actively builds Stage 0/1/2 + `triggers.mjs`, likeliest to yield a real free-channel technique). Take only if a second eval-tool datapoint is wanted; skillgrade likely already covers the axis (demote/skip candidate).
2. **skill-memory-bank** (`fockus/skill-memory-bank`) — the maximalist lose-less foil: a 12-file `.memory-bank/` (status/roadmap/backlog+ADRs/append-only progress/lessons…) + 29 slash-commands + code-graph. Fit-test stress test against koan's one-fact-one-home + budgets; after agent-handoff expect positioning + at most one convergent lesson (its `lessons.md`/ADR split), low src-change odds.
3. **ai-memory** (`akitaonrails/ai-memory`) — *one* representative of the MCP-memory cluster (also `thedotmack/claude-mem`, `parcadei/Continuous-Claude-v3`, `jayzeng/agentmemory`): auto-capture + LLM-compiled narratives + SQLite/embeddings/git-wiki — the architectural *opposite* of koan's curated-git-prose. One positioning datapoint for the "compound-don't-compact" auto-capture school vs koan's curated school (D-024); not skill text. Ingest one, not four.

_Note: after six consecutive convergence-only third-party ingests (agent-skills, superpowers, mattpocock, caveman, agent-handoff, skillgrade, agent-rules-books), the queue is thin and skewed to convergence. The fit-test is holding; consider pausing external ingests until a field deployment or a real authoring problem motivates the next one._
