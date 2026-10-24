---
name: koan-init
description: >-
  Set up the koan continuity workflow in a project that doesn't have it yet —
  the CLAUDE.md (or AGENTS.md) constitution plus the docs/HANDOFF.md and
  docs/DECISIONS.md files, from templates. Works for any repo-backed work: an
  app, an ops estate, a data pipeline, an AI system, a manuscript. Use on
  "/koan-init", "set up koan here", or starting a fresh project that wants
  session-continuity scaffolding. Re-running is safe.
---

# Koan init

Share one handoff and decision log across hosts. Reuse the existing constitution;
a second host entrypoint points to it rather than copying facts.

## 0. Read the shape first — before writing anything
Inspect what's here: manifests, IaC, CI, scripts, docs, prompt/eval files,
`git log --oneline -20`. Answer two things: **what is this repo** (an app? an
estate of VMs? a config workspace for a live tool? a manuscript?) and **what
proves a change is done here** (a test suite, a plan/diff, a health check, an
eval, a human viewing it). Play it back in ≤3 lines — "I read this as X because
Y; proof looks like Z" — and ask only where you're unsure or safety rides on it.
`references/project-shapes.md` has the clues per shape and what each one seeds.

## 1. Create the files if missing
- **CLAUDE.md** (or AGENTS.md) — the constitution: stack, how to run, **Shape**,
  **Checks** (the real proof, from §0), gotchas, canonical examples.
- **docs/HANDOFF.md** — rolling state (Objective · Current state · Next steps · …).
- **docs/DECISIONS.md** — lean, auto-loaded decision log.
- **docs/DECISIONS-archive.md** — full text of settled decisions (NOT auto-loaded).

Use `templates/` for missing files. Preserve existing content; if another host
has a constitution, create only the bridge in §2.

### 1a. Backfill into an existing setup
If the constitution exists, don't overwrite — but ADD any template section it's
missing (additive, never touch existing content): a **Checks** section if absent;
an **Objective** section in HANDOFF; the current ritual line and a **Shape**
line in "Start here". List each backfill in the report.

## 2. Wire the import
CLAUDE.md imports the active log: `@docs/DECISIONS.md`.
AGENTS.md explicitly says: `Read docs/DECISIONS.md at session start.`
Never auto-load the archive.

When adding a second host, keep the existing constitution:
- AGENTS.md primary → new CLAUDE.md contains `@AGENTS.md`.
- CLAUDE.md primary → new AGENTS.md says:
  `Read CLAUDE.md and docs/DECISIONS.md at session start.`
If both exist, preserve their content and reconcile wiring; don't duplicate facts.
Without lifecycle skills, replace slash commands with the corresponding plain steps.

## 3. Seed from reality (don't leave templates blank)
- The manifest or its equivalent (`package.json`, Makefile, pyproject, a playbook,
  `main.tf`, a build script) → "How to run" and the stack section.
- **Checks** = the proof §0 found: real commands where they exist, real procedures
  where they don't. Record only what exists; an empty Checks section is fine —
  never invent a suite, a backup, or an eval set.
- Env usage (`process.env.*`, `.env.example`), where the shape has any → the env inventory.
- `git log --oneline -20` → draft "Current state".
- Draft HANDOFF's **Objective** from the user's stated goal (what's built + the
  done-condition; work with no finish line → the steady state to hold). Unclear
  from repo or conversation? Ask one question, don't guess.
- Set **Phase:** from what the repo shows — a spike with no tests or users is
  `explore`, shipped-and-depended-on is `harden`. Unsure ⇒ `build`.
- Write the **Shape:** line from §0, in plain words.
- Pick 2–4 **canonical artifacts** — whatever shows how this repo's work is done:
  a route and a test, a playbook role, a runbook, a chapter → paths under
  "Canonical examples". Pointers only, never paste; prefer the most recently
  touched one that follows current conventions.
- Mixed notes or durable material beyond the core three files? Read
  [document routing](references/document-routing.md). Reuse existing procedures,
  references, evidence and briefs; create a home only for concrete content with
  a distinct read trigger. Preserve evidence and decision rationale when moving.
- **Budgets from day one:** DECISIONS ≤ ~30k chars, HANDOFF ≤ ~15k, constitution
  ≤ ~20k. If the seeded DECISIONS already exceeds ~30k, apply `koan-wrap`'s
  archive rules immediately.

### 3a. Greenfield or unclear intent — interview, don't guess
When there's little to seed from (empty/near-empty repo, or an Objective not
recoverable from the repo or conversation), interview the human instead of
inventing one — the mirror of `koan-readback`: draw understanding *out* before
writing anything.
- Ask, a few at a time: the core problem and its done-condition; who it's for
  (and explicitly who it's not); what evidence proves a change is done; hard
  constraints; any decisions already made (stack, auth, data model) with their
  reasons; whether this is still being figured out (`explore`) or being built
  for keeps (`build`).
- Summarize it back as a short spec and let the human correct it before seeding.
- Then seed from the confirmed answers: done-condition → HANDOFF's Objective;
  proof → Checks; each settled decision+reason → a `D-00x` entry; hard
  constraints → gotchas.
Skip this when the repo already answers it — seed from reality per step 3.

## 4. Report
Report files created/backfilled, Shape, and HANDOFF/DECISIONS sizes (vs ~15k/~30k).
Suggest reviewing the constitution before relying on it.
<!-- koan v0.1.0 · build b69ba406 -->