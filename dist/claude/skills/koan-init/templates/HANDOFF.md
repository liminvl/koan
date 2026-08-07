# Handoff

> Rolling snapshot — what is, what's next. Read at the start of every session.
> Overwrite stale lines; don't append a diary. Budget: ≤ ~15k chars.
> Stable facts belong in the constitution; decision rationale in docs/DECISIONS.md.

## Objective
<!-- the target this work drives toward + its done-condition -->

## Current state
<!-- one or two lines: what's live/working, what's half-done. NO facts git already
     owns — no HEAD hash, no branch tip, no "working tree clean"/"uncommitted".
     git log and git status answer those better, the readback checks them anyway,
     and a hand-copied version is wrong the instant the next commit lands,
     including the commit that saves this file. Hashes live in Changes, as
     evidence. Environment state (deploys, external services) goes in as a DATED
     VERIFICATION — "staging verified 2026-06-30 on a1b2c3d" stays true forever;
     "staging is serving a1b2c3d" becomes a lie on the next deploy, silently.
     Same clock, same trap for REVIEW STATUS: "awaiting review", "ready to merge",
     "two sittings pending sign-off" describe a queue no reader here can see, and
     they rot the moment someone acts. Say what the work IS and what it NEEDS —
     "the migration is written; a human must run it against staging" — never where
     it sits in a pipeline. -->

## What's built
<!-- optional cold-start map: ONE line per subsystem + its decision ID -->

## Changes this session
<!-- bullet per change + hash as evidence. Two traps when you wrap+commit:
     (1) never name this sitting's OWN commit hash — it doesn't exist until you
     commit, and amending to add it changes it again; name commits already in
     history, let the next session promote this one. (2) the version you commit
     reads as committed, not "uncommitted" — a live self-claim goes stale the
     instant you commit, and koan-lint check 11 flags it. -->

## In progress
<!-- anything half-done, with enough detail to resume -->

## Next steps
<!-- priority-ordered, concrete enough to act on without the last session;
     tag steps only the human can do with (human) -->

## Not yet verified
<!-- claims not yet proven + what would prove them. In the explore phase this is
     also where a provisional choice lives — "bet: X — unproven at Y, Z settles
     it" — instead of minting a permanent D-id for something a week may reverse.
     At the phase change, promote the survivors into docs/DECISIONS.md as real
     entries and delete the rest. -->

## Open questions for the human
<!-- decisions you can't make alone -->
