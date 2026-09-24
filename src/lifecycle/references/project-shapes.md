# Project shapes — what to look for, what each one seeds

Read by `koan-init` §0 only. Shapes are **lenses for inference and seeding, not
labels**: the constitution gets one plain-words `**Shape:**` line, and the
load-bearing fact — what proves a change is done — goes in `## Checks`. Most
repos are hybrids; name the primary first and the rest in the same sentence.

**The trap, for every shape:** never invent a test suite, a backup, an eval set,
an SLO or a rollback path because the shape usually has one. Record what exists;
a missing proof is a line in HANDOFF's *Not yet verified* ("restore never
exercised — a drill would prove it"), never a claim.

## The shapes

**Application** — web/mobile/CLI/plugin/API.
Clues: a manifest with scripts, a `src/`, tests, a framework. Done: the suite
green + a human pass on what no command judges (UX, copy). Seed: Checks from the
manifest's real scripts; canonical artifacts = a route, a component, a test; env
inventory. Not-yet-verified: anything only a person or a real deploy proves.

**Platform / control plane** — an orchestrator, scheduler, provisioning service,
a repo that manages other systems.
Clues: API for lifecycle ops, reconciliation loops, state stores. Done:
desired = observed (a reconcile/diff is clean), state transitions and partial
failure exercised. Seed: Checks = the diff/reconcile command, the health probe;
gotchas = authority ("production owns the data"), idempotency; a pointer file for
the estate it controls. Not-yet-verified: failure modes never induced.

**Infrastructure / operations** — VMs, containers, DNS, storage, IAM, deploys.
Clues: Terraform/Ansible/compose, inventories, cron/backup scripts, runbooks,
little or no app source. Done: a clean plan/`--check --diff`, a health check
against the live thing, a **tested** restore. Seed: Checks = the plan/apply-check
command, the health script, the restore drill as a procedure; canonical artifacts
= a playbook role, a compose file, a runbook; Objective is often a steady state,
not a finish line. **Pointer file:** `docs/<estate>.md` — hosts, IDs, where
credentials live (never the values); measured facts dated. Not-yet-verified:
"backups run" ≠ "restore works".

**Integration / data** — APIs, webhooks, ETL/ELT, databases, streaming.
Clues: schemas, migrations, contract specs, pipeline DAGs, reconciliation
scripts. Done: contract tests, replay/dry-run, a source↔target reconciliation.
Seed: Checks = schema/data-quality check, the reconciliation command; gotchas =
ordering, retries, auth boundaries; canonical artifacts = a migration, a
contract. Not-yet-verified: lineage claims, untested failure/retry paths.

**AI / ML / agent** — RAG, agents, model routers, prompt+eval systems.
Clues: prompt files, retrieval config, eval datasets, provider manifests, model
version pins. Done: the eval set beats the recorded baseline; tool permissions
and citations verified. Seed: Checks = the eval command or the human-scored
rubric (say which); gotchas = model/prompt/retrieval versions, cost and latency
bounds; canonical artifacts = the eval set, a prompt file. Not-yet-verified:
providers never called for real, nondeterministic behavior seen once.

**Embedded / cyber-physical** — firmware, IoT, robotics, hardware-coupled code.
Clues: toolchain files, board configs, HAL code, timing constraints. Done:
simulation or bench test, hardware-in-loop where it exists, timing/power/memory
within limits. Seed: Checks = the build for the target, the bench procedure;
gotchas = hardware revision, safe limits, calibration. Not-yet-verified: anything
only real hardware shows.

**Research / prototype** — a spike, a feasibility experiment, a creative pipeline.
Clues: notebooks, experiment scripts, dated findings, no users. Done: the
question answered reproducibly — a benchmark, a rendered result, a recorded
finding. Seed: Phase is usually `explore`; Objective = the hypothesis + stop
criterion; Checks = "the run reproduces" or a human judgment, said plainly.
Measured results with dates and retractions are **findings, not gotchas** —
they go in a pointer file (`docs/findings.md`), never the constitution.

**Migration / modernization** — a finite source→target transformation.
Clues: parity scripts, mapping tables, a cutover plan, two systems side by side.
Done: dry run clean, source↔target reconciliation, rollback rehearsed. Seed:
Checks = the parity/reconcile command, the rollback rehearsal as a procedure;
gotchas = which side owns which data during coexistence; Objective = the cutover
condition. Not-yet-verified: rollback never rehearsed, data drift since the last
reconcile.

**Content / production** — a manuscript, a film, a video campaign, a course.
Clues: chapters, briefs, shot lists, asset registers, style guides, approval
gates, spend caps. Done: a continuity/consistency check, a read-through or
viewing, an approval. Seed: Checks = the procedures ("continuity pass against
the style sheet", "user approves the package ID"); gotchas = hard rules (spend
caps, never publish, product truth); canonical artifacts = the chapter or brief
that nails the voice; Objective often a steady state or a series. External
services (accounts, credits, expiring URLs) → a pointer file.

## State outside git — the routing rule

When the repo *describes* a system rather than *being* it — a box, a database, a
live site, a hosted tool, a model's measured behavior — git stops being the
truth for that state. Don't mirror it into HANDOFF (it drifts on every change
that isn't a commit) and don't pile it into Gotchas (they're permanent
constraints, and a constitution over ~20k chars stops landing).

- One pointed-to file, `docs/<name>.md`, named in the constitution's *Start here*
  with a read-trigger: `Operating <thing>? Read docs/<name>.md first.`
- **Identities are recorded** (host, ID, path, account, which file holds the
  credential). **Values are queried** (status, counts, versions, what's running)
  — write the command, not the answer. **Measurements are dated.**
- HANDOFF keeps only dated verifications ("restore drill passed 2026-09-10 on
  `a1b2c3d`") and what the work needs next.

Two field shapes this replaces: an ops repo whose HANDOFF became a 14 KB mirror
of the platform and drifted on every change (fixed with an inventory of IDs +
query commands); a config workspace whose real state was rows in the tool's
database, with nothing in git saying so (fixed with one line: what is versioned,
what is queried, and how).
