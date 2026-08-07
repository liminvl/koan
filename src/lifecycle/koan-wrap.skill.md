---
name: koan-wrap
description: >-
  Close out a coding session cleanly so a fresh session can resume. Use at the
  end of a work session, on "wrap up", "/koan-wrap", "update the handoff", "I'm
  stopping here", or before switching tasks. Produces one artifact: a
  docs/HANDOFF.md a cold session can start from. ALSO handles mid-session
  CHECKPOINTS — on "checkpoint", "save progress", "/koan-checkpoint", run the
  lightweight checkpoint mode instead of the full wrap.
---

# Koan wrap

You are fighting context entropy. Every line that survives this wrap
costs permanent tokens in every future session — so it has to earn its place.
Leave the project in a state where a brand-new session, with zero memory of this
conversation, picks up correctly.

> **One fact, one home. Snapshot, not diary.** Those two koans decide every
> call below.

## 0. Mode: checkpoint or full wrap?

**CHECKPOINT** (saving progress, NOT stopping): refresh **Current state**, **In
progress**, **Next steps**, append to **Changes this session**. **No pruning, archiving
or budget enforcement** — entropy is fought once, at the real wrap. Earlier checkpoints
from THIS session are not a "previous session"; never delete them. Report one line, never
in place of the end-of-session wrap.

**FULL WRAP** (session ending): everything below, in order.

## 1. Gather evidence — don't trust your memory of the session
- `git log --oneline <last-handoff-commit>..HEAD` — what actually shipped.
- `git status --short` — uncommitted work.
- For anything you'll mark **done**: the evidence is the project's **Checks**
  (types/lint/tests) green *this session*. Didn't run or didn't pass ⇒ it's "Not
  yet verified", not done.

## 2. Update docs/HANDOFF.md — prune FIRST, then write
Read at the start of EVERY session, so its size is a permanent tax.
**Budget: ≤ ~15k chars** — count with `koan-lint`, never `wc -c`: the gate counts
characters, `wc` counts bytes, and `—`/`·` fake an overrun. Over or close ⇒ prune under.

**Prune first.** Delete: the previous session's "Changes this session" (git is the
record); verified lines in "Not yet verified"; resolved "Open questions";
intra-file duplicates (one fact, one home applies *within* the file too).

**Then write the snapshot.** Overwrite stale lines — don't append. Section set is
FIXED (no inventing sections; run commands live in CLAUDE.md):
Objective · Current state · What's built (optional, one line/subsystem + decision
ID) · Changes this session (commit hash = evidence) · In progress · Next steps ·
Not yet verified · Open questions for the human.

A good snapshot is tight:
```
## Current state
Auth flow live: login + refresh working; logout half-wired (see In progress).
## Next steps
1. Finish logout token revocation (src/auth/session.ts) — see D-008.
2. Rate-limit the refresh endpoint.
```
A bad one is a diary ("Then I tried X, it didn't work, so I…"). Delete that.

**Never in Current state:** facts git owns (HEAD hash, clean/uncommitted — your copy dies
on the next commit, *including the one saving it*; hashes go in **Changes**, as
evidence), or present-tense environment claims (write "staging verified 2026-06-30 on
`a1b2c3d`", not "is serving" — that goes silently false on the next deploy).

## 3. Append durable decisions to docs/DECISIONS.md — choice + why only
Only **choices a future session shouldn't silently re-litigate** (architecture,
security posture, conventions). A mechanical constraint with no real alternative
is NOT a decision — it's a CLAUDE.md gotcha.

Route each line before writing it:

| The line is about… | Home |
|---|---|
| the choice + why + alternatives + what would reopen it | **DECISIONS.md** |
| built / tested / verified / pending — a *now*-state | **HANDOFF.md** |
| a permanent mechanical constraint | **CLAUDE.md** gotchas |
| a rule the project's spec/contract docs own | **the spec doc**; DECISIONS gets only the why + a pointer |

Entry = **Decision / Why / Alternatives rejected / Status (one line) / Revisit-if**
(+ optional **Load-bearing:** naming what cites it). Do NOT append a verification
tail or `Note:`/`Limitation:` blocks — those belong to HANDOFF or CLAUDE.md.
**Status uses one leading token** (greppable): `proposed`·`accepted`·
`implemented`·`superseded`. Format: `- **Status:** implemented · _2026-06-30_`.
Grep the archive and any domain set before calling something new — supersede,
don't duplicate.

## 4. Keep docs/DECISIONS.md lean — archive settled decisions
Auto-loaded every session via `@docs/DECISIONS.md`, so size is a permanent tax.
**Budget: ≤ ~30k chars** (hard stop 45k). Over or close ⇒ archive under.

**Move main → archive when ALL hold:** Status is `implemented`/`superseded`;
nothing open in HANDOFF depends on it; it records how a *finished* feature was
built. **Keep in main if ANY hold:** cited by ≥2 others *where the citation
carries reasoning* — a mention of an ID inside an example or a fixture is not a
citation; defines a cross-cutting invariant; is the active frontier. Unsure ⇒ keep.

**Nothing archivable and still over?** The log may have grown on merit. Split a
**domain decision set**: `docs/DECISIONS-<domain>.md` for live entries that only
bind one area (e.g. `benchmarks/`). Move what governs *how a thing is built*;
keep what governs *what ships*. Never `@`-import a set — on-demand is the point —
and list its IDs under `## Domain decision sets` so citations resolve. Split at
≥5 such entries; below that, archive or compress.

**Mechanics:** move the **full entry verbatim** (never trim reasoning, never
delete). Leave a one-line stub in **Archived decisions index**: `- **D-0NN** —
<title> — <status> · archived`. **IDs are permanent — never renumber**; a gap is
correct. Same mechanics for a domain set, listed under its own heading.

## 5. Sanity check before finishing
> If `koan-lint` is available, run it and confirm what it flags.

- HANDOFF free of git-owned facts? (check 11 sees "uncommitted", not a stale hash.)
- Anything this session contradict a DECISIONS entry (main or archive)? Supersede it.
- HANDOFF still a snapshot, not a diary? No `<details>` archives.
- Both budgets met (HANDOFF ≤15k, DECISIONS ≤30k)?
- Skim CLAUDE.md/AGENTS.md for any line this session falsified — fix or flag.
- Any fact now in two of CLAUDE.md / HANDOFF.md / DECISIONS.md? Delete the twin.
- Index ↔ archive parity: every stub has one full entry and vice versa; every
  domain-set ID is listed in the main log, and nothing listed there is missing.

## Report
One template, always:
```
Wrapped: HANDOFF <chars>/15k · DECISIONS <chars>/30k · archived <IDs or none> · checks <green/none>
Next session starts at: <one line>
```
Do not commit unless asked — and if asked, nothing you just wrote should need correcting.
