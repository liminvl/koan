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
**Review + refactor** ([[D-049]], 2026-10-25): a `claude plugin eval` discovery
suite (`benchmarks/evals/`, ten cases, mirrored into `dist/claude/evals/`) now
measures the shipped path — does the installed plugin fire from its descriptions?
First run: every skill fired, mean Δ +0.33, 9/10 cases; the miss is trail
(no D-entry on the ordinary task), the same null [[D-030]] tracks. The core is
frozen until trail is re-measured on sonnet-5. `push.mjs` requires `--target`.
The CLAUDE.md template carries a compaction-preservation line and names tool
memory as per-machine. D-027/D-030 compressed, D-040 archived. The review's
external evidence is recorded in `benchmarks/results/2026-10-25-…`: context
files move correctness ≈0 on frontier models, vendors are shedding
anti-gold-plating prompt lines, no host writes a handoff, and required rules
still belong in checked-in files — lose-less holds its ground, build-less is
insurance for the tier below the newest model.
**Supporting-doc routing** ([[D-048]], 2026-10-23): init/wrap share an on-demand
reference for procedures, reference, evidence and briefs; `koan-lint --context
<path>` estimates core + selected whole-file context against an advisory 50k.
**Native Codex support** ([[D-002]], 2026-10-23): six generated bundles install
to `.agents/skills`; `--target claude|codex|both`, `--global` for user scope;
combined installs preflight both hosts. Claude's SessionStart hook stays
plugin-only; Codex gets explicit lifecycle invocation.
**Refactor review implemented** ([[D-047]], 2026-10-23): install drift checks
compare content; jazz creates its worktree branch; trail requires an actual
choice/rationale entry; onecheck executes tests and mutation checks; readback
continues authorized work unless blocked; checkpoints have a single owner.
**koan fits non-app repos** ([[D-044]], 2026-09-23): `**Shape:**` line, 20k
constitution budget, Checks as the real proof, pointer files with read-triggers,
init-only `references/project-shapes.md`.
**Ingest 2026-10-04** ([[D-046]]): the hook speaks after a compaction over
unrecorded work; In progress carries dead ends; lint prices the loaded chain.
**Six skills** — `koan-debt` folded into `koan-lint --debt` ([[D-036]]).
Benchmarks: Stage 1 is behavior only (7 probes, lifecycle arms carry their
bundle [[D-045]]); Stage 2 is cold-resume continuity; discovery evals are
host-level routing. Deltas are model-*split* within the frontier tier
([[D-030]]). Results: `benchmarks/results/`.
The log holds two domain sets ([[D-033]]): `benchmarks` and `method`.
22 field repos consume the user-level plugin; the 2026-09-23 field survey
is what D-044 rests on — durable facts are in the entry.

## What's built
- Core lens (`src/koan.skill.md`) + five lifecycle skills. `lint.mjs` carries 13
  live checks (8 and 13 retired; 15 = constitution budget, [[D-044]]; 3b = the
  loaded chain, [[D-046]]) plus `--debt`.
- **Project-phase axis** ([[D-028]]) — `**Phase:**` sets where a choice lands.
- **Shape + proof + pointer file** ([[D-044]]).
- **`koan-jazz`** ([[D-029]]) — bounded improvisation on a `jazz/<topic>` branch.
- **SessionStart hook + `plugin` target** ([[D-035]]) — runs `lint()` at session
  open; silent unless faulty, or a `compact` start finds unrecorded work ([[D-046]]).
- Build system (`build/`) — single source → dist targets ([[D-002]]); `restampDir()`
  hashes each finished skill dir; `push.mjs --check` compares installed content;
  `hooks/pre-commit` runs `npm test`.
- Stage 0 selfcheck — budgets, canary, dogfood lint + 70 pinned doc shapes
  ([[D-037]]), 17 trigger prompts ([[D-025]]), bundle self-containment
  ([[D-034]]), hook decision table (8 shapes), budget-number drift check.
- **Discovery evals** ([[D-049]]) — `benchmarks/evals/`, run with `claude plugin
  eval ./dist/claude …` (see `benchmarks/evals/README.md`); API spend, not in
  `npm test`.
- **Atlas** (2026-10-07) — a visual guide, private artifact:
  https://claude.ai/artifact/Kj5HERZqApQvbg3B8ottg9. Hand-authored from `src/` +
  docs; refresh after a decision that moves a part. Not shipped.
- Stage 1 (behavior, 7 probes) and Stage 2 (continuity, 7 questions) harnesses —
  construction in `docs/DECISIONS-benchmarks.md`; pricing in `docs/DECISIONS-method.md`.

## Changes this session (2026-10-25 — review + refactor)
- Added `benchmarks/evals/` (10 cases, 2 shared `_fixtures/*.sh`, README);
  `build/targets/claude.mjs` mirrors it into `dist/claude/evals/`; results dir
  gitignored. Deleted `benchmarks/discovery-cases.json` (superseded).
- `push.mjs`: `--target` required, HELP rewritten; install selftest asserts the
  bare call exits 2. README's "legacy default" paragraph replaced.
- `src/templates/CLAUDE.md` + this repo's CLAUDE.md: compaction-preservation
  line; template comment names tool memory as per-machine. GUIDE FAQ: auto memory
  vs HANDOFF. README: evidence table across all probes.
- `lint.mjs`: the check-8 and check-13 tombstone comments reduced to one-line
  pointers (D-036, D-027 hold the reasoning).
- DECISIONS: D-027 and D-030 compressed to five fields; D-040 and D-043 archived verbatim;
  D-049 added. 29.9k → 26.6k.
- Checks: `npm test` green after every change; `claude plugin validate
  ./dist/claude` passes (one warning: no icon). Eval suite ran once ($2.06),
  recorded in `benchmarks/results/2026-10-25-discovery-and-research.md`.

## In progress
- Nothing half-coded.

## Next steps
What survives is small on purpose; do not repopulate it to feel busy.

1. **Re-measure trail on sonnet-5** — `--probes trail --arms baseline,koan
   --model <sonnet-5 id>` ×3 ([[D-022]]) — before any core addition. The eval
   suite's `lens-ordinary-task` null and the 2026-08-07 fable null both point
   here; sonnet-5 is the seat's only remaining support ([[D-030]]).
2. **Run the discovery suite promotion-grade**: `--runs 3 --model <id>`; the
   tool does not record the agent model, so pin it. Then try the suite on Linux
   (scaffold scripts have only run under Git Bash).
3. **Watch the first real auto-compaction** in a field repo (the hook's
   `compact` branch and the new template line are unexercised outside fixtures).
4. **Replicate `shape`**: two more fable-5-1 runs, then one sonnet-5 row.
5. **Review task retrieval in field repos** (ComfyUI's 87.4k engine findings
   behind a broad trigger; Hostinger's 15k handoff) — read-only observations.
6. **Watch whether `method` is ever opened** ([[D-033]]'s standing risk).
7. Field-survey items not yet triaged: cross-repo decision-ID collisions
   (openwebui offsets IDs ≥30; wp-rag-backend shares an ID space; iams renumbered
   288 citations); stale ritual references in five repos (init §1a could refresh
   the ritual line); four more [[D-027]] correction commits in repos whose state
   lives on a box — the pointer-file case, not a new rule.
8. Distribution, when wanted: list on skills.sh (`npx skills add`), add a plugin
   icon (validate warns), and keep the README evidence table current.

## Not yet verified
- **Discovery evals are n=1 per arm, agent model unrecorded by the tool**, and
  `lint-read-only` grades routing only (no Bash grant, so the engine never ran).
- **The compaction nudge and the new "when compacting, preserve" line have fired
  only in fixtures** — no real auto-compaction has exercised either.
- **Revised Output guidance remains unmeasured across real tasks**; the duration
  correctness guard checks one narrow task.
- **`shape` is n=1 on one model** ([[D-022]] unmet; sonnet-5 unmeasured).
- **The chain warning has zero positives** across 22 field repos; iams-wordpress
  sits at 49.6k and would trip it on the next line.
- **The pointer-file rule has one application** (hostinger); whether a cold
  session opens the runbook on its read-trigger is untested.
- **The promoted safety rule has no behavior probe** ([[D-040]], archived) —
  canary-verified presence only.
- **The marketplace install is verified from a clean profile, not a clean
  machine** (2026-08-07). `push.mjs --target` becoming required is unannounced
  to existing consumers beyond the README.
- The 15k HANDOFF budget is a judgement, not a measurement; the hook is proven
  in one repo on one box ([[D-035]]); trail's core seat holds by a single run
  ([[D-030]]); jazz's null is n=1 per model ([[D-032]]); the phase gate is n=3
  on one model ([[D-028]]); the trigger check validates lexical routing only
  ([[D-025]]).

## Open questions for the human
- None right now.
