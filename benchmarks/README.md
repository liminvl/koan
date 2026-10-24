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
the rule, not the sample count ("form follows failure" — the superpowers
ingest, D-026).

The **outcome** arm (loc-counting probes on pinned tasks) was deleted 2026-08-05:
it converged on every model it ever ran and decided nothing in seven ingests. Its
run records stay in `results/`. Behavior is the arm that decides things.

## Stage 2 — `node benchmarks/continuity/run.mjs`
`--selftest` (offline, proves the fixture is fair + discriminating) → real run
(cold-resume Q&A judged). The lose-less axis ponytail can't measure.

## Results
Dated snapshots in `results/` are the over-time record. Note supersessions
explicitly (a contaminated or superseded run stays, marked) — see `results/TEMPLATE.md`.

## Refactor validation (2026-10-23)

`trail` now requires a written decision; prose claims do not pass. `onecheck`
uses a Node ESM duration fixture with an existing test command. It checks the
implementation against valid and malformed inputs, executes the generated test,
and requires that test to reject both an arithmetic and an input-validation
mutant. A no-op test or broken implementation fails. This changes the task and
grading: historical onecheck/trail scores are not directly comparable.

Each new behavior run saves `metadata.json` (requested model, CLI version, repo
revision/dirty state, grader and system-prompt hashes, samples per cell), raw
answers, generated duration files, and `results.json`. Unresolved default models
are not model-qualified evidence. Independent repetitions remain required for
promotion; passing offline selftests proves graders, not model improvement.

`discovery-cases.json` is a host-level invocation suite, separate from lexical
TF-IDF checks. Run each prompt in a fresh, disposable repo with the six skills
installed, and inspect actual Skill tool invocations. Record host/model versions,
skill hashes, invoked skills and unexpected writes. A synthetic description
ranker does not establish host discovery behavior. Cases allowing multiple
skills express valid combinations rather than forcing a single winner.

## Native installation checks

`npm test` covers project and user-scope Claude/Codex/both installs, idempotence,
resource completeness, executable lint, modified/missing files, preservation of
project docs, and combined-install conflict preflight. Codex artifacts share the
Claude skill size ceilings and generation canaries.

With Codex CLI installed, run `node benchmarks/codex-smoke.mjs` to install into a
disposable directory and ask the real app server to list skills. It asserts all
six local skills are enabled and parse cleanly, then removes the scratch install.
This is host discovery, not a model evaluation: no model calls are made.

## Supporting-document routing scenarios

`routing-cases.json` provides operational, creative and small-code fixtures for
independent forward tests of init/wrap routing. Materialize each in its own
temporary repo; install the built skills for the host under test. Give the
agent only the task and fixture, not the review criteria. Inspect written docs
against those criteria, then ask a fresh session to find the next action,
governing choice and relevant evidence without SESSION-NOTES.md. Record host,
model, skill revision, artifact paths, failures and sample count. A successful
review is not a replicated baseline/skill delta.

Artifact budgets cover both hosts and the shared routing references. Lower
ceilings after tested trims to roughly 5% headroom; increases need an explicit
reason. This does not ratchet the consumer continuity budgets down.

### Roundtable results — 2026-10-23

Two rounds used Claude Opus 5.5 (T3 Claude provider) and DeepSeek V4 Pro
(T3 OpenCode provider) against the working source and generated bundles. Each
reviewer performed its first scratch wrap before inspecting scenario criteria.
These are reviewer exercises, not controlled baseline comparisons.

- Claude ops: `/tmp/koan-review-wrap` preserved the failed restore evidence,
  reused the procedure, and left production recovery unverified; lint clean.
- Claude small-code: `/tmp/koan-wrap-scratch-CdTj` kept the unverified bug and
  next action without decisions or new documents; lint clean. This scratch
  directory was not a git repo, so it did not exercise git evidence gathering.
- DeepSeek creative, first run: `/tmp/opencode/koan-scratch-wrap` retained
  settings and rationale but left the reusable method only in HANDOFF. Parent
  inspected the artifacts and rejected the reviewer's claimed full pass.
- DeepSeek creative, informed re-run: `/tmp/opencode/koan-scratch-wrap-r2`
  put the method in the existing brief under Continuity review, reachable by
  its existing trigger; evidence and pending approval survived; lint clean.
  Parent inspected these files too. Original failed artifacts remain intact.

Fixes from the review include explicit routing before snapshot, host-neutral
wording, dual-host bridges, preserved unmanaged instructions, named extra files,
and recognition of the legacy generated core as skill guidance rather than a
project constitution. The legacy-core regression is pinned with synthetic lint
fixtures and an actual install/lint/check cycle. Final offline suite and Codex
discovery pass. No remaining blocking review finding; no claim of replicated
model improvement or fresh-session retrieval success. Temp artifact paths are
local evidence locations, not shipped fixtures or permanent archives.
