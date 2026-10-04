# Handoff

> Rolling snapshot — what is, what's next. Overwrite stale lines; don't append a
> diary. Budget: ≤ ~15k chars.
> Stable facts belong in the constitution; decision rationale in docs/DECISIONS.md.

## Objective
A single-source skill kit, **koan**, that unifies build-less (ponytail) and
lose-less (handoff) discipline, builds to many LLM coding environments, pushes
into existing projects, and benchmarks itself against regression as it grows.
Done when: the skill is content-complete, builds cleanly, and Stages 0–2 run.

## Current state
**koan fits non-app repos** ([[D-044]], 2026-09-23). The constitution carries a
free-text `**Shape:**` line and a 20k budget (lint check names the largest
section); `koan-init` §0 reads the repo's shape and proof before seeding, with
an init-only `references/project-shapes.md`; Checks means the real proof;
state outside git routes to a pointed-to file with a read-trigger; the
harvester reads IaC, config, `.gd` and `<!-- koan: -->` markers. The core
description now routes any repo-backed work (the "not for prose" exclusion is
gone); the ladder is unchanged.
**Ingest 2026-10-04** ([[D-046]], ECC + context-mode): the hook speaks after a
compaction over unrecorded work; In progress carries dead ends; lint prices the
loaded chain. `npm test` green (two `grew` warnings, justified in D-046; sizes
re-recorded).
**Six skills** — `koan-debt` folded into `koan-lint --debt` ([[D-036]]).
Benchmarks: Stage 1 is **behavior only**; the seventh probe, `shape` (koan-init
arm pair, `ops` + `mvp` variants), **flipped on fable-5-1, n=1** (baseline
seeds `--check --diff` too but files the untested restore nowhere; koan-init
puts it under *Not yet verified* and writes a pointer file). Lifecycle arms now
carry their bundle ([[D-045]]). Deltas remain model-*split* within the frontier
tier ([[D-030]]).
Results: `benchmarks/results/` (outcome runs preserved as a record).
The log holds two domain sets ([[D-033]]): `benchmarks` and `method` — a split
ships a constitution read-trigger line ([[D-042]]). Budgets price the entry
([[D-043]]).
22 field repos consume the user-level plugin. The 2026-09-23 field survey
(all 22 + three non-koan repos) is what D-044 rests on; its per-repo findings
live only in that session's transcript — the durable facts are in the entry.

## What's built
- Core lens (`src/koan.skill.md`) + five lifecycle skills. `lint.mjs` carries 13
  live checks (8 and 13 retired; 15 = constitution budget, [[D-044]]; 3b = the
  loaded chain, [[D-046]]) plus `--debt`; readback cross-checks git and plays
  back the Shape line and the dead ends.
- **Project-phase axis** ([[D-028]]) — `**Phase:**` explore/build/harden sets
  ONE thing: where a choice lands. Absent ⇒ `build`.
- **Shape + proof + pointer file** ([[D-044]]) — `**Shape:**` is orientation,
  never parsed; `## Checks` is the proof; `docs/<name>.md` + a read-trigger holds
  state the repo describes but doesn't hold. Taxonomy ships init-only.
- **`koan-jazz`** ([[D-029]]) — bounded improvisation on a `jazz/<topic>` branch.
- **SessionStart hook + `plugin` target** ([[D-035]]) — runs `lint()` at session
  open; never writes, never blocks, silent unless a koan repo is faulty — or a
  `compact` start finds uncommitted work newer than HANDOFF ([[D-046]]).
- Build system (`build/`) — single source → dist targets ([[D-002]]); `restampDir()`
  hashes each finished skill dir, so the new `references/` dir needed no stamp
  change. `push.mjs --check` dry-runs the stamp compare. `hooks/pre-commit` runs
  `npm test`.
- Stage 0 selfcheck — budgets (now 8 artifacts), canary, dogfood lint + **52
  pinned doc shapes** ([[D-037]]), 17 trigger prompts ([[D-025]]), bundle
  self-containment ([[D-034]]), hook decision table (8 shapes), budget-number
  drift check.
- Stage 1 (behavior, 7 probes) and Stage 2 (continuity, 7 questions) harnesses —
  construction in `docs/DECISIONS-benchmarks.md`; pricing in `docs/DECISIONS-method.md`.

## Changes this session (2026-10-04, twenty-ninth sitting — ECC / context-mode ingest)
- **[[D-046]]** minted; **D-029 archived** (implemented, cited only by D-028's
  Load-bearing line and a What's-built pointer) to make room: DECISIONS 29,264 →
  ~29.8k. At the line again — the next entry must archive first.
- Hook: `session-start.mjs` reads the event `source`; on `compact` it names
  uncommitted files newer than `docs/HANDOFF.md` (mtime — a HANDOFF written after
  the last edit is the checkpoint and stays silent). 4 new hook pins (4 → 8);
  the built CLI driven by hand on a scratch repo for all four shapes.
- `lint.mjs` 3b: the loaded chain (constitution + every resolving `@`-import)
  against `CHAIN_BUDGET` = the two auto-loaded budgets summed; the warning names
  imports by size; the budget line gains `loaded`. 3 new pins (49 → 52). Swept
  all 22 field repos: zero warnings, and no field repo imports anything beyond
  `@docs/DECISIONS.md` today.
- HANDOFF template: In progress asks for dead ends with their reason; wrap §2 and
  readback carry the same line. Stage 2 gains a seventh question (what not to
  retry) in both corpora — selftest fair and discriminating, 1.07× size ratio.
- Ceilings: koan-readback 2050 → 2150 (one bullet; was at 95%). koan-wrap grew
  7402 → 7583 under 7800. Sizes re-recorded.
- GUIDE (budgets, wrap, readback, hook) and README (hook): one sentence each.
- Review record: both repos read in full against the log; everything not adopted
  either duplicates a koan rule or was rejected by a logged decision ([[D-046]]).

## In progress
- Nothing half-coded.

## Next steps
What survives is small on purpose; do not repopulate it to feel busy.

1. **Commit D-046 + this HANDOFF**, push the plugin (`node push.mjs --target
   plugin`) and `/reload-plugins` so the compaction nudge and chain check are
   live; then watch the first real auto-compaction in a field repo.
2. **Review and commit hostinger's move** (`git diff` there: `CLAUDE.md`,
   `docs/HANDOFF.md`, new `docs/PLATFORM-RUNBOOK.md`). Then the other four
   over-20k repos, one at a time — comfyUI (96k, a lab notebook) is the big one.
3. **Replicate `shape`**: two more fable-5-1 runs (`--probes shape --model
   claude-fable-5-1`) for [[D-022]]'s 2-of-3, then one sonnet-5 row for the tier.
4. **Re-measure trail before the next core addition** ([[D-030]]) — unchanged
   from last sitting; the core grew 58 chars of description only.
5. **Watch whether `method` is ever opened** ([[D-033]]'s standing risk).
6. Observed in the field survey, out of scope, not yet triaged: cross-repo
   decision-ID collisions (openwebui offsets IDs ≥30; wp-rag-backend shares an ID
   space; iams-wordpress renumbered 288 citations); stale ritual references
   (`drift-audit`, `/koan-debt`, `/koan-checkpoint`) in five repos — init §1a
   could refresh the ritual line; wp-rag-backend's HANDOFF contradicts itself on
   deploy/auth state (a pointer-file case); four more [[D-027]] correction
   commits (sandwich `52b04de`, vibe-shield `a8fbbf3`, 9arty `2f2c6e3`, iams
   `1c86a2f`) — all in repos whose state lives on a box, which is the
   pointer-file case again, not a new rule.

## Not yet verified
- **The compaction nudge has fired only in fixtures** — selfcheck's 8 pins and
  one scratch repo driven through the built CLI with hand-made events. No real
  auto-compaction has exercised it, and `source`'s values come from Claude
  Code's hook docs, not from an event observed here. mtime is the discriminator,
  so a checkout that rewrites file times could fire it once.
- **The chain warning has zero positives**: all 22 field repos are under the sum
  and none imports anything beyond `@docs/DECISIONS.md` — the shape it exists
  for is unseen in the field. iams-wordpress sits at 49.6k from the two budgeted
  files alone, so the next line in either file trips it there.
- **Dead ends have one Stage 2 question and no run**; no field HANDOFF has been
  read for where its dead ends currently land.
- **koan's Output rule is unmeasured on code quality** ([[D-039]] retired the
  axis). context-mode cites Moonshot's report that far harsher brevity prompts
  ("one word answers are best") cost kimi-k2.5 4–7 points on two coding
  benchmarks; koan's wording is milder and carries the explanation guard, but
  nothing here would see the effect if it existed.
- **`shape` is n=1 on one model.** One fable-5-1 flip after [[D-045]]; the
  first run (arm without its bundle) is recorded in the same results file as
  the null it was. [[D-022]]'s 2-of-3 is not met and sonnet-5 is unmeasured.
  Baseline's `ops` "no" is narrow: it seeded the real commands too and missed
  only the restore gap's home — the delta is the *Not yet verified* routing plus
  the pointer file, not shape inference.
- **The 20k constitution warning has fired only from this repo** against the
  five field repos; no consumer session has seen it or acted on it.
- **The pointer-file rule has one application, by koan's own author-session,
  uncommitted** (hostinger). Whether a cold session there opens the runbook
  on its read-trigger is the test; nothing has run against the moved docs yet.
- **Two `claude -p --safe-mode` dry runs of the built `koan-init` (2026-09-23)
  on scratch clones** — hostinger (koan docs stripped) and runway (own CLAUDE.md
  kept) — both inferred the shape and wrote procedures as Checks, a steady-state
  Objective and a pointer file, **from SKILL.md alone**: `--safe-mode` denied
  the `templates/` reads, so each invented its own decision-entry format that
  lint reads as phantom citations, and hostinger put `**Phase:**` in HANDOFF.
  That is the failure [[D-045]] fixed for the harness; a real install reads the
  templates from the plugin dir, and that path is still unobserved in the field.
- **The widened harvester is field-checked on 22 repos** (no spurious `.md`
  hits; sandwich +5, vibe-agent +2 legitimate), but a repo with many YAML
  `# koan:` mentions that are not shortcuts has not been seen.
- **The §4 read-trigger guidance has no field exposure** ([[D-042]]).
- **The promoted safety rule has no behavior probe** ([[D-040]]).
- **The marketplace install is verified from a clean profile, not a clean
  machine** (2026-08-07).
- **The compressed log is unproven at resume**; the 15k HANDOFF budget is a
  judgement, not a measurement; the hook is proven in one repo on one box
  ([[D-035]]); trail's core seat holds by a single run ([[D-030]]); jazz's null
  is n=1 per model ([[D-032]]); the phase gate is n=3 on one model ([[D-028]]);
  the trigger check validates lexical routing only ([[D-025]]).

## Open questions for the human
- None right now.
