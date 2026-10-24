---
name: koan-wrap
description: >-
  Close out a work session cleanly so a fresh session can resume. Use at the
  end of a work session, on "wrap up", "/koan-wrap", "update the handoff", "I'm
  stopping here", or before switching tasks. Refreshes docs/HANDOFF.md and durable
  decisions so a cold session can resume. ALSO handles mid-session
  CHECKPOINTS — on "checkpoint", "save progress", "/koan-checkpoint", run the
  lightweight checkpoint mode instead of the full wrap.
---

# Koan wrap

Leave a snapshot a fresh session can act on.

> **One fact, one home. Snapshot, not diary.** Those two koans decide every
> call below.

## 0. Mode: checkpoint or full wrap?

**CHECKPOINT** (saving progress, NOT stopping): refresh **Current state**, **In
progress**, **Next steps** and **Changes this session**. Replace superseded
checkpoint state; preserve unresolved work, dead ends and evidence. Stay within
the HANDOFF budget below; defer decision archiving to full wrap. Report one line.

**Shared checkout:** one coordinating session owns HANDOFF and DECISIONS updates.
Workers return findings to that owner; they do not rewrite shared snapshots.

**FULL WRAP** (session ending): everything below, in order.

## 1. Gather evidence — don't trust your memory of the session
- `git log --oneline <last-handoff-commit>..HEAD` — what actually shipped.
- `git status --short` — uncommitted work.
- For anything you'll mark **done**: the evidence is the project's **Checks** —
  tests, plan/diff, health, eval or human sign-off, whichever it declares —
  passed *this session*. Didn't run or didn't pass ⇒ "Not yet verified".
  External state counts only as a dated verification with a pointer.

## 2. Update docs/HANDOFF.md — prune FIRST, then write
Read at the start of EVERY session, so its size is a permanent tax.
**Budget: ≤ ~15k chars** — count with `koan-lint`, not `wc -c` (bytes; `—`/`·`
fake an overrun). Over or close ⇒ prune under.

Route reusable procedures and findings to durable homes (§3) before the snapshot;
HANDOFF keeps the next action and pointer, not the only copy of a method.

**Prune first.** Delete: the previous session's "Changes this session" (git is the
record); verified lines in "Not yet verified"; resolved "Open questions";
intra-file duplicates (one fact, one home applies *within* the file too).

**Then write the snapshot.** Overwrite stale lines — don't append. Section set is
FIXED (entry commands live in the constitution; procedures in linked docs):
Objective · Current state · What's built (optional, one line/subsystem + decision
ID) · Changes this session (file paths/checks; commit hashes when available) · In progress · Next steps ·
Not yet verified · Open questions for the human.
**In progress** carries the dead ends too — what was tried, why it failed — so
the next session doesn't retry them; once a choice settles, they move to its
*Alternatives rejected*.

A good snapshot is tight:
```
## Current state
Auth flow live: login + refresh working; logout half-wired (see In progress).
## Next steps
1. Finish logout token revocation (src/auth/session.ts) — see D-008.
2. Rate-limit the refresh endpoint.
```
**Never in Current state:** facts git owns (HEAD hash, clean/uncommitted — your copy dies
on the next commit, *including the one saving it*; hashes go in **Changes**, as
evidence), or present-tense environment claims (write "staging verified 2026-06-30 on
`a1b2c3d`", not "is serving" — that goes silently false on the next deploy).

## 3. Append durable decisions to docs/DECISIONS.md — choice + why only
Only **choices a future session shouldn't silently re-litigate** (architecture,
security posture, conventions). A mechanical constraint with no real alternative
is NOT a decision — it's a constitution gotcha.

Route by purpose: choice + why → DECISIONS; current work → HANDOFF;
project-wide constraints → constitution; repeatable how → procedure;
definitions/identities → reference; observations → dated evidence;
requirements → spec, brief or contract. Reuse the existing home.
When extracting material or choosing a new home, read
[document routing](references/document-routing.md). Don't wait for a size limit.

Entry = **Decision / Why / Alternatives rejected / Status (one line) / Revisit-if**
(+ optional **Load-bearing:** naming what cites it). Keep the choice and its
reason understandable alone; link supporting research or design detail.
Verification belongs in HANDOFF or dated evidence, not an appended diary.
**Status uses one leading token** (greppable): `proposed`·`accepted`·
`implemented`·`superseded`. Format: `- **Status:** implemented · _2026-06-30_`.
Grep the archive and any domain set before calling something new — supersede,
don't duplicate.

## 4. Keep docs/DECISIONS.md lean — archive settled decisions
Read each session via the constitution's import or read instruction, so size is a permanent tax.
**Budget: ≤ ~30k chars** (hard stop 45k). Over or close ⇒ archive under.

**Move main → archive when ALL hold:** Status is `implemented`/`superseded`;
nothing open in HANDOFF depends on it; it records how a *finished* feature was
built. **Keep in main if ANY hold:** cited by ≥2 others *where the citation
carries reasoning* (an ID inside an example or fixture is not a citation);
defines a cross-cutting invariant; is the active frontier. Unsure ⇒ keep.

**Nothing archivable and still over?** Compress before splitting: `koan-lint`
names the largest entries — cut each to its five fields, moving overflow
detail to a linked supporting document. Still over on merit? Split a **domain decision set**:
`docs/DECISIONS-<domain>.md` for ≥5 live entries that only bind one area (e.g.
`benchmarks/` or one film). Keep project-wide constraints and choices in main. Never `@`-import a set — on-demand is the point — and list its IDs
under `## Domain decision sets` so citations resolve. Add a read-trigger to the
constitution: `Touching <area>? Read docs/DECISIONS-<domain>.md first.`.

**Mechanics:** move the **full entry verbatim** (never trim, never delete). Leave
a one-line stub in **Archived decisions index**: `- **D-0NN** — <title> —
<status> · archived`. **IDs are permanent — never renumber**; a gap is correct.
Same mechanics for a domain set, listed under its own heading.

## 5. Sanity check before finishing
> If `koan-lint` is available, run it and confirm what it flags.

- HANDOFF free of git-owned facts? (check 11 sees "uncommitted", not a stale hash.)
- Anything this session contradict a DECISIONS entry (main or archive)? Supersede it.
- HANDOFF still a snapshot, not a diary? No `<details>` archives.
- Budgets met (HANDOFF ≤15k, DECISIONS ≤30k, constitution ≤20k)?
- Skim CLAUDE.md/AGENTS.md for any line this session falsified — fix or flag.
- One authoritative home per fact? A short summary with a pointer is fine.
- Large task references? Check the selected files with `koan-lint --context`
  (one project-relative path per flag); narrow read triggers before trimming evidence.
- Index ↔ archive parity: every stub has one full entry and vice versa; every
  domain-set ID is listed in the main log, nothing listed there is missing, and
  each set has a constitution read-trigger.

## Report
Use:
```
Wrapped: HANDOFF <chars>/15k · DECISIONS <chars>/30k · archived <IDs or none> · checks <passed/failed/not run>
Next session starts at: <one line>
```
Do not commit unless asked.
<!-- koan v0.1.0 · build b58a42ca -->