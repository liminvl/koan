---
name: koan-jazz
description: >-
  Open a bounded improvisation session — a throwaway branch where the build-less
  ladder is suspended so you can build the speculative thing, try it three ways,
  and find out. Nothing lands on the working branch; the jam's artifact is a
  finding, not code. Use on "/koan-jazz", "jam on this", "let's experiment",
  "spike it", "play with an idea", "try something wild", "prototype without the
  rules", or when someone wants to explore a design they know koan would talk
  them out of. Also handles CLOSING a jam: "end the jam", "what did we learn".
argument-hint: "[topic]"
---

# Koan jazz

Jazz is improvisation over a form, not the absence of one. A jam has a head, a
solo, and a return to the head — and it's the return that makes the solo safe to
take. Koan normally prices every line you write. Here you stop paying, in one
quarantined place, for one question, and settle up on the way out.

> **The jam's artifact is a finding, not code.** If you come back with only a
> branch, the session was a cost. Come back with an answer.

## 0. Mode: opening or closing?

Naming a topic ⇒ **open** (§1–2). "End the jam" / "what did we learn" / the stop
condition met ⇒ **close** (§3). Mid-jam with no branch open ⇒ you're not in a
jam; treat the request normally.

## 1. The head — open the jam

**Isolation is the precondition.** Not a git repo, or you can't branch? Say so
and stop — without a quarantine there is nothing to suspend the ladder *inside*,
and an unbounded jam on a working branch is just over-building with permission.

1. `git status --short` — dirty tree ⇒ commit or stash on the CURRENT branch
   first. Never carry uncommitted work into a jam; it strands real changes on a
   branch you intend to throw away.
2. `git switch -c jazz/<topic>` — or `git worktree add ../<repo>-jazz-<topic>
   jazz/<topic>` if you need the main tree left alone (long builds, a running
   dev server, a second agent working).
3. State three things back, in three lines — and get the question right, because
   everything else is scored against it:
   - **Question:** the one thing this jam answers. "Does X beat Y?" not "try X".
   - **Stop:** what makes it answered. A jam with no stop condition is a rewrite.
   - **Discard:** what you'll delete regardless. Usually all of it.

## 2. The solo — what's suspended

**Off** inside the jam: the build-less ladder (build the abstraction, add the
dependency, write it three ways — that's the point). The trail on every
non-trivial change. Minting `D-nnn`s. `koan:` shortcut comments. The
shortest-diff rule. "No unrequested abstractions."

**Still on, non-negotiable:** the safety carve-outs — input validation at trust
boundaries, error handling that prevents data loss, security, accessibility.
You improvise over the form; you don't improvise over the form. A jam that
touches production data or real credentials isn't a jam.

Don't narrate the suspension. You're not building carefully, so don't explain
carefully either — the explanation budget is spent at the return, once.

## 3. The return — mandatory, and the actual deliverable

Answer the question from §1 in one or two sentences. Then pick exactly one
disposition:

| Disposition | What happens |
|---|---|
| **Finding, no code** | The common case. Answer recorded, branch left or deleted. |
| **Code worth keeping** | It does NOT merge from here. Re-enter through the ladder as a normal change on a normal branch — the jam branch is the sketch, not the delivery. |
| **Null result** | "No" is an answer and worth as much. Record it in one line so nobody jams on it again. |

Where the finding lands follows the project's **Phase** (CLAUDE.md), so a jam
never invents a second routing rule:
- **explore** ⇒ a bullet in HANDOFF's *Not yet verified*. A jam finding is a bet
  by construction — one run, one fixture, one afternoon.
- **build** / **harden** ⇒ still a bet unless it's a choice a future session
  shouldn't re-litigate; then it earns a `D-nnn` via `koan-wrap` §3, and the jam
  branch name is its evidence.

**Never** merge a jam branch to the working branch, and never let one outlive
its question — an unclosed jam becomes a fork nobody dares delete.

## Report
```
Jam <opened|closed>: jazz/<topic> · asked: <question> · <stop condition | answer>
Landed: <bet in HANDOFF | D-nnn | nothing — null result>
```
<!-- koan v0.1.0 · build df9b51d4 -->