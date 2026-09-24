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
gone); the ladder is unchanged. `npm test` is green (five `grew` warnings, all
justified in D-044; sizes re-recorded).
**Six skills** — `koan-debt` folded into `koan-lint --debt` ([[D-036]]).
Benchmarks: Stage 1 is **behavior only**; a seventh probe, `shape` (koan-init
arm pair, `ops` + `mvp` variants), is selftest-pinned and **has not had a real
run**. Deltas remain model-*split* within the frontier tier ([[D-030]]).
Results: `benchmarks/results/` (outcome runs preserved as a record).
The log holds two domain sets ([[D-033]]): `benchmarks` and `method` — a split
ships a constitution read-trigger line ([[D-042]]). Budgets price the entry
([[D-043]]).
22 field repos consume the user-level plugin. The 2026-09-23 field survey
(all 22 + three non-koan repos) is what D-044 rests on; its per-repo findings
live only in that session's transcript — the durable facts are in the entry.

## What's built
- Core lens (`src/koan.skill.md`) + five lifecycle skills. `lint.mjs` carries 13
  live checks (8 and 13 retired; 15 = constitution budget, [[D-044]]) plus
  `--debt`; readback cross-checks git and plays back the Shape line.
- **Project-phase axis** ([[D-028]]) — `**Phase:**` explore/build/harden sets
  ONE thing: where a choice lands. Absent ⇒ `build`.
- **Shape + proof + pointer file** ([[D-044]]) — `**Shape:**` is orientation,
  never parsed; `## Checks` is the proof; `docs/<name>.md` + a read-trigger holds
  state the repo describes but doesn't hold. Taxonomy ships init-only.
- **`koan-jazz`** ([[D-029]]) — bounded improvisation on a `jazz/<topic>` branch.
- **SessionStart hook + `plugin` target** ([[D-035]]) — runs `lint()` at session
  open; never writes, never blocks, silent unless a koan repo is faulty.
- Build system (`build/`) — single source → dist targets ([[D-002]]); `restampDir()`
  hashes each finished skill dir, so the new `references/` dir needed no stamp
  change. `push.mjs --check` dry-runs the stamp compare. `hooks/pre-commit` runs
  `npm test`.
- Stage 0 selfcheck — budgets (now 8 artifacts), canary, dogfood lint + **49
  pinned doc shapes** ([[D-037]]), 17 trigger prompts ([[D-025]]), bundle
  self-containment ([[D-034]]), hook decision table, budget-number drift check.
- Stage 1 (behavior, 7 probes) and Stage 2 (continuity, 6 questions) harnesses —
  construction in `docs/DECISIONS-benchmarks.md`; pricing in `docs/DECISIONS-method.md`.

## Changes this session (2026-09-23, twenty-eighth sitting — non-app shapes)
- **[[D-044]]** minted; **D-041 archived** (implemented, uncited) to make room:
  DECISIONS 29,175 → 29,264. At the line — the next entry must archive first.
- Templates: `Shape:` line + comment, Checks/Gotchas/Canonical comments made
  shape-neutral, pointer-file read-trigger comment, Objective "no finish line"
  note; the DECISIONS reference entry moved into the DECISIONS template.
- `koan-init`: §0 "read the shape first", §3 generalized, §3a asks for proof;
  `references/project-shapes.md` (9 shapes + the outside-git rule) ships beside
  `templates/`. Ceiling 5100 → 5750.
- `koan-wrap`: evidence = the declared Checks; routing row for outside-git facts;
  §5 asks for the constitution budget. Ceiling 7550 → 7800 after 87 chars cut.
- `koan-readback`: "before doing work"; plays back Shape + proof.
- Core description: "ANY task inside a repo — code, infra, config, docs,
  content"; persona "tending a repo". AGENTS.md unchanged (5166).
- `lint.mjs` check 15 (constitution > 20k, names the largest section); `debt.mjs`
  harvests tf/hcl/yaml/toml/ini/conf/nix/gd/lua/kt/swift/Dockerfile/Makefile and
  `<!-- koan: -->` in Markdown. 7 new pins (42 → 49). 3 new trigger prompts.
- `shape` probe + selftest pins; Stage 2 question "what evidence proves a change
  is done here?" with a Shape line in the fixture.
- GUIDE: Shape section, pointer-file paragraph, two scenarios (ops estate,
  video-production repo); README one sentence.
- Field re-lint of all 22 repos: verdicts identical to before except the five
  expected check-15 warnings (comfyUI 96k, vibe-shield, iams-wordpress,
  hostinger, divi-5-agent). `--debt` on sandwich now lists its 5 `.gd` shortcuts.

## In progress
- Nothing half-coded.

## Next steps
What survives is small on purpose; do not repopulate it to feel busy.

1. **Commit this session's work** — the pre-commit hook re-runs `npm test`. Then
   refresh the installed plugin: `node push.mjs --target plugin --force` +
   `/reload-plugins`.
2. **Run the `shape` probe for real** (one fable-5 run, then per [[D-022]] if it
   flips): `node benchmarks/behavior/run.mjs --probes shape`. D-044's seat rests
   on selftest pins until then.
3. **Apply the pointer-file move to one over-20k field repo** — hostinger is the
   natural first (its D-023 already built the inventory; the constitution's
   16.3k "Invariants & gotchas" section is the runbook). One repo proves the
   wording lands before the other four are touched.
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
- **D-044 has no real behavior run.** The `shape` grader discriminates on
  pinned shapes; whether koan-init actually seeds `ansible-playbook --check` and
  flags the untested restore where baseline writes `npm test` is unmeasured.
- **The 20k constitution warning has fired only from this repo** against the
  five field repos; no consumer session has seen it or acted on it.
- **The pointer-file rule has no field exposure.** No repo has been moved onto
  it; hostinger's inventory predates the rule and is the closest existing shape.
- **Two `claude -p --safe-mode` dry runs of the built `koan-init` (2026-09-23)
  landed the shape behavior without the reference.** hostinger (koan docs
  stripped): Shape "a config workspace for a live estate"; Checks = a table of
  live probes keyed by change type, "there is no suite"; Objective = a steady
  state; read-triggers for `PLATFORM-INVENTORY.md`/`-CONTRACT.md`; env
  identities, never values. runway (own CLAUDE.md kept, backfilled additively):
  Shape "a creative-production workspace, not an app"; Checks = procedures;
  `docs/environment.md` created as a pointer file marked "query, don't mirror";
  per-project STATUS.md kept as the shot-level home. **Caveat:** `--safe-mode`
  denied both runs the `templates/` and `references/` reads, so the behavior
  came from SKILL.md alone — and without the template each invented its own
  entry format (`## D-003 —` / `**D-001 · date · settled** —`) that lint reads
  as 31/8 phantom citations, and hostinger put `**Phase:**` in HANDOFF, not
  CLAUDE.md.
  A real install reads the templates from the plugin dir; that path is untested.
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
