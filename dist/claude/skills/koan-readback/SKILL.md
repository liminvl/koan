---
name: koan-readback
description: >-
  Cold-start sanity check: play your understanding of the project back for the
  human to correct, BEFORE doing any work. Use on
  "/koan-readback", when resuming after a long gap, or on the first session after
  working in another tool (Windsurf, Cursor, Copilot). Catches misread context
  before it becomes wrong code. Read-only.
---

# Koan readback

Before touching code on a cold start or a tool switch, confirm you actually
understand the project — don't just trust that the injected context landed right.
A misread that becomes code is the expensive kind.

## Do this
1. Read `CLAUDE.md` (or `AGENTS.md`), `docs/DECISIONS.md`, and `docs/HANDOFF.md`.
   Open `docs/DECISIONS-archive.md` only if a current task touches an archived ID.
2. Cross-check against git: `git log --oneline -10` + `git status`. Where
   HANDOFF's Current state disagrees, git wins — flag the mismatch.
3. Play it back, in **≤10 bullets**:
   - the **Objective** and current state (from HANDOFF),
   - the architecture + hard constraints (from CLAUDE.md),
   - the live decisions you must not silently reverse (top DECISIONS entries),
   - the **next step** you'd take, and which canonical example you'd follow.
4. Ask the human to correct any bullet. **Stop and wait** — don't start work yet.

## Then
Once they confirm, proceed. For a large delegation, do ONE small task first and
check it matches the canonical examples before going further. This skill makes no
edits — it only reads and reflects back.
<!-- koan v0.1.0 · build 98912f6a -->