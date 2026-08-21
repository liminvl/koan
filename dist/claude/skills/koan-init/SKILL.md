---
name: koan-init
description: >-
  Set up the koan continuity workflow in a project that doesn't have it yet —
  the CLAUDE.md (or AGENTS.md) constitution plus the docs/HANDOFF.md and
  docs/DECISIONS.md files, from templates. Use on "/koan-init", "set up koan
  here", or starting a fresh project that wants session-continuity scaffolding.
  Re-running is safe.
---

# Koan init

Stand up the three-file structure, then seed it from the actual repo so it isn't
empty. The whole point is that a cold session reads these and resumes.

## 1. Create the files if missing
- **CLAUDE.md** (or AGENTS.md) — the constitution: stack, how to run, **Checks**
  (the type/lint/test commands that define "done"), gotchas, canonical examples.
- **docs/HANDOFF.md** — rolling state (Objective · Current state · Next steps · …).
- **docs/DECISIONS.md** — lean, auto-loaded decision log.
- **docs/DECISIONS-archive.md** — full text of settled decisions (NOT auto-loaded).

Use this skill's `templates/` as the starting shape. **Do not overwrite** any file
that already exists — ask first.

### 1a. Backfill into an existing setup
If the constitution exists, don't overwrite — but ADD any template section it's
missing (additive, never touch existing content): a **Checks** section if absent;
an **Objective** section in HANDOFF; the proactive-ritual note in "Start here".
List each backfill in the report.

## 2. Wire the import
CLAUDE.md/AGENTS.md imports **only the lean active log** so it rides along:
```
@docs/DECISIONS.md
```
**Do NOT import the archive** — keeping it out of context is the whole point. The
active log keeps a one-line index pointing at the archive for on-demand lookup.

## 3. Seed from reality (don't leave templates blank)
- Read `package.json`/build files → fill "How to run" and the stack section.
- From the same manifest (scripts, Makefile, pyproject, Cargo, CI) → fill **Checks**
  with the project's real commands. Record only commands that exist; an empty
  Checks section is fine — don't invent.
- Scan env usage (`process.env.*`, `.env.example`) → draft the env inventory.
- `git log --oneline -20` → draft "Current state".
- Draft HANDOFF's **Objective** from the user's stated goal (what's built + the
  done-condition). Unclear from repo or conversation? Ask one question, don't guess.
- Set CLAUDE.md's **Phase:** from what the repo shows — a spike with no tests or
  users is `explore`, shipped-and-depended-on is `harden`. Unsure ⇒ `build`.
- Pick 2–4 **canonical example files** (an API route, a component, a data module, a
  test) → list paths under "Canonical examples". Pointers only, never paste code;
  prefer the most recently touched file that follows current conventions.
- Already have a single notes file mixing everything? SPLIT it: constraints →
  CLAUDE.md gotchas; choices-with-rationale → DECISIONS.md; status → HANDOFF.md.
- **Budgets from day one:** DECISIONS ≤ ~30k chars, HANDOFF ≤ ~15k. If the seeded
  DECISIONS already exceeds ~30k, apply `koan-wrap`'s archive rules immediately.

### 3a. Greenfield or unclear intent — interview, don't guess
When there's little to seed from (empty/near-empty repo, or an Objective not
recoverable from the code or conversation), interview the human instead of
inventing one — the front-end mirror of `koan-readback` (which plays
understanding *back*; here you draw it *out* before writing anything):
- Ask, a few at a time: the core problem and its done-condition; who it's for
  (and explicitly who it's not); hard constraints; any decisions already made
  (stack, auth, data model) with their reasons; whether this is still being
  figured out (`explore`) or being built for keeps (`build`).
- Summarize it back as a short spec and let the human correct it before seeding.
- Then seed from the confirmed answers: done-condition → HANDOFF's Objective;
  each settled decision+reason → a `D-00x` entry; hard constraints → gotchas.
Skip this when the repo already answers it — seed from reality per step 3.

### Reference: a filled DECISIONS entry
```
### D-001: Authorization in route handlers, never middleware
- **Decision:** All authz checks live in route handlers, not middleware/proxy.
- **Why:** Middleware runs on the edge without full session context; centralizing
  authz there caused bypass risk. Handlers have the verified session.
- **Alternatives rejected:** edge middleware authz (bypass risk), per-component guards (easy to forget).
- **Status:** accepted · 2026-06-30
- **Revisit if:** the framework gives middleware reliable verified-session access.
```

## 4. Report
List files created and one line each on what you seeded. Note current char counts
of HANDOFF (vs ~15k) and DECISIONS (vs ~30k) so the user knows the headroom.
Suggest they review CLAUDE.md before relying on it.
<!-- koan v0.1.0 · build 3adb1acc -->