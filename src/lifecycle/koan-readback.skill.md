---
name: koan-readback
description: >-
  Cold-start sanity check: play your understanding of the project back for the
  human to correct before acting on stale context. Use on
  "/koan-readback", when resuming after a long gap, or on the first session after
  working in another tool (Windsurf, Cursor, Copilot). Catches misread context
  before it becomes wrong work. Read-only.
---

# Koan readback

## Do this
1. Read `CLAUDE.md` (or `AGENTS.md`), `docs/DECISIONS.md`, and `docs/HANDOFF.md`.
   Follow read triggers for the current task, including local status and evidence.
   Open the archive only when the task touches an archived ID.
2. Cross-check against git: `git log --oneline -10` + `git status`. Where
   HANDOFF's Current state disagrees, git wins — flag the mismatch.
3. Play it back, in **≤10 bullets** with a blank line between each (readability
   beats density here):
   - the **Objective** and current state (from HANDOFF),
   - the Shape line, what proves a change (Checks) + hard constraints (from CLAUDE.md),
   - the live decisions you must not silently reverse (top DECISIONS entries),
   - the dead ends In progress records — what not to retry.
4. Close with two headed sections:
   - **`### Recommended Next Steps`** — a short numbered list: what you'd do
     next, and which canonical example you'd follow.
   - **`### Open questions`** — anything only
     the human can answer (HANDOFF's open questions, mismatches you can't
     resolve). Omit the section if there are none.
5. Invite corrections. Continue with already-authorized work unless an unresolved
   discrepancy changes its scope or correctness. Stop and wait for that answer,
   or when the user explicitly asks to confirm the readback before proceeding.

## Then
Once blocking questions are resolved, proceed. For a large delegation, do ONE small task first and
check it matches the canonical examples before going further. This skill makes no
edits — it only reads and reflects back.
