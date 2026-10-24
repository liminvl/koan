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
**Supporting-doc routing** ([[D-048]], 2026-10-23): init/wrap share an on-demand
reference for procedures, reference, evidence and briefs. Decisions retain rationale;
consumer limits stay unchanged. `koan-lint --context <path>` (repeatable) estimates
core + selected whole-file context, with an advisory 50k threshold. Artifact
ceilings ratcheted after trims; the lint increase pays for diagnostic guidance.
**Native Codex support** ([[D-002]], 2026-10-23): six generated skill bundles
install to `.agents/skills`; `--target claude|codex|both` selects hosts and
`--global` selects user scope. Combined installs preflight both hosts before
writing. Existing instructions and continuity docs are preserved. Claude's
SessionStart hook stays plugin-only; Codex gets explicit lifecycle invocation.
**Refactor review implemented** ([[D-047]], 2026-10-23): install drift checks
compare content; jazz creates its worktree branch; trail requires an actual
choice/rationale entry; onecheck executes tests and mutation checks. Core prefers
maintainable simplicity and sufficient coverage; readback continues authorized
work unless blocked; non-importing hosts get explicit reads; checkpoints have
bounded state and a single owner. Model evidence no longer transfers by tier.
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
  change. `push.mjs --check` compares installed content. `hooks/pre-commit` runs
  `npm test`.
- Stage 0 selfcheck — budgets (10 source ceilings, mirrored for native Codex), canary, dogfood lint + **70
  pinned doc shapes** ([[D-037]]), 17 trigger prompts ([[D-025]]), bundle
  self-containment ([[D-034]]), hook decision table (8 shapes), budget-number
  drift check.
- **Atlas** (2026-10-07) — a visual guide to the whole kit, published as a
  private artifact: https://claude.ai/artifact/Kj5HERZqApQvbg3B8ottg9. Hand-
  authored from `src/` + docs, so it drifts as koan changes; refresh it after a
  decision that moves a part. Not shipped, not public.
- Stage 1 (behavior, 7 probes) and Stage 2 (continuity, 7 questions) harnesses —
  construction in `docs/DECISIONS-benchmarks.md`; pricing in `docs/DECISIONS-method.md`.

## Changes this session (2026-10-23 — supporting knowledge)
- Added shared routing reference to init/wrap in both host bundles; updated
  templates, guide and readback for purpose-based documents and task read triggers.
- Added opt-in selected-context estimates, positive/negative lint fixtures,
  and installation checks for the new references. Consumer limits unchanged.
- Ratcheted build budgets and recorded sizes; lint growth is justified in D-048.
- Roundtable fixes preserve unmanaged instructions, wire both host bridges, accept
  combined log-read instructions, list retained extras, and distinguish the legacy
  generated core from a project constitution. Generated core explicitly reads
  shared docs; no local edit is needed to satisfy lint.
- Commit-hook validation exposed Git environment leakage into scratch worktrees;
  fixture Git calls now clear repository-local variables, with a polluted-index test.
- `npm test` passed: 70 lint shapes, existing behavior/continuity grader selftests,
  and both-host install matrix. Codex discovery found all six skills without errors.
- Read-only ComfyUI check: core + engine findings = 132,429 chars; the diagnostic
  warns while ordinary lint stays quiet about the stored reference's size.
- Claude Opus 5.5 and DeepSeek V4 Pro roundtable complete. Ops and small-code
  forward exercises preserved evidence and avoided needless documents. DeepSeek's
  first creative wrap left a method only in HANDOFF; parent artifact review caught
  it. After explicit pre-snapshot routing, the informed re-run placed it in the
  existing brief. No blocking findings remain. Evidence/limits: benchmarks/README.md.

## In progress
- Nothing half-coded.

## Next steps
What survives is small on purpose; do not repopulate it to feel busy.

1. **Watch the first real auto-compaction** in a field repo (the hook's
   `compact` branch remains unexercised outside fixtures).
2. **Review task retrieval in field repos**: ComfyUI's constitution is now 11.7k,
   but engine findings are 87.4k with a broad trigger. Hostinger has distinct
   inventory/contract/runbook homes; its handoff is 14,997 chars. These are
   read-only observations from 2026-10-23, not requests to change those repos.
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
- Routing scenarios have reviewer forward exercises, including an informed creative
  re-run after an initial failure. No replicated baseline comparison, dedicated
  research-notebook scenario, or fresh-session retrieval evidence yet.
- The task-context diagnostic is a whole-file estimate: core, direct imports and
  explicitly selected files. It does not infer prose triggers or trace host context.
- Revised skill wording has not had a replicated baseline/koan model comparison.
  The new onecheck fixture and stricter trail grades are not comparable with old
  scores. Run `--probes trail,onecheck --arms baseline,koan --model <id>` on an
  explicit model; each invocation records one sample per cell.
- Prompt-trigger discovery cases (`benchmarks/discovery-cases.json`) are prepared
  but not executed. Codex registration/parsing is host-verified; that does not
  establish implicit routing. TF-IDF remains a lexical check.
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
- **Revised Output guidance remains unmeasured across real tasks.** The duration
  correctness guard checks one narrow task; it is not broad code-quality evidence.
- **`shape` is n=1 on one model.** One fable-5-1 flip after [[D-045]]; the
  first run (arm without its bundle) is recorded in the same results file as
  the null it was. [[D-022]]'s 2-of-3 is not met and sonnet-5 is unmeasured.
  Baseline's `ops` "no" is narrow: it seeded the real commands too and missed
  only the restore gap's home — the delta is the *Not yet verified* routing plus
  the pointer file, not shape inference.
- **The 20k constitution warning has fired only from this repo** against the
  five field repos; no consumer session has seen it or acted on it.
- **The pointer-file rule has one application** (hostinger, committed there
  2026-10-04 or earlier). Whether a cold session opens the runbook on its
  read-trigger is the test; nothing has run against the moved docs yet.
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
