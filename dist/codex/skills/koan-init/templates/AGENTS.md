# <Project>

> Constitution. Permanent facts only — stack, how to run, what "done" means,
> gotchas, canonical examples. Now-state lives in docs/HANDOFF.md, not here.

Read docs/DECISIONS.md at session start; open archived entries only when needed.


## Start here
Read docs/HANDOFF.md for current state and next steps. On a cold start or tool
switch, run `$koan-readback` before doing work.

_When to suggest a ritual:_ stopping/switching tasks → `$koan-wrap`. Resuming
after a gap → `$koan-readback`. Docs feel off → `$koan-lint`. About to
`/compact` → checkpoint first (compaction is lossy; HANDOFF isn't).
When compacting, preserve: files changed this session, the Checks command, and
HANDOFF's next step.
<!-- Tool memory (Claude's auto memory, Codex memories) is per machine and
     invisible to other tools and teammates — git + these docs are the ONLY
     shared channel. Route anything a resume needs here, never to tool memory. -->
<!-- Supporting docs are read on demand, for code and non-code work:
     "Restoring a service? Read docs/restore.md first."
     "Reviewing character continuity? Read films/current/brief.md first."
     Reuse existing homes for procedures, reference, evidence and specs/briefs.
     Add a file only for concrete durable content with a distinct read trigger;
     don't create an empty taxonomy. Large docs need section/search pointers.
     Record stable identities; query changing live values. Preserve measurements
     as dated evidence with conditions/version/source, not claims of current state. -->

**Phase:** build
<!-- Sets ONE thing: where a choice lands. Name what would move it —
     "build — moves to harden once the auth flow has real users."
     explore · a provisional choice stays a bet in HANDOFF's "Not yet verified".
       No D-id minted; permanence is what you're deferring, not the thinking.
     build   · DEFAULT. A choice worth not re-litigating → docs/DECISIONS.md.
     harden  · as build, plus every `koan:` shortcut needs a disposition.
     UNCHANGED in every phase: the build-less ladder, the safety carve-outs
     (validation, data loss, security, accessibility), the core constraints. explore
     defers permanence, never discipline. Delete this line to get `build`. -->

**Shape:** <one line — what this repo is, and what proves a change>
<!-- Cold-start orientation, in plain words; nothing parses it. Examples:
     "web app (Next.js) — proof = npm test + a visual pass"
     "ops estate: 3 Proxmox VMs + Ansible — proof = --check --diff + health
      script; restore drill quarterly"
     "novel, Book 1 — proof = continuity check + a read-through"
     Hybrid? Name the primary first, the rest in the same sentence. -->

## Stack
<!-- language, framework, package manager, runtime versions — or the tools
     and platforms the work runs on -->

## How to run
<!-- start / build / apply / deploy / render — whatever "run" means here -->

## Checks (what "done" requires)
<!-- the real proof a change is done: commands where they exist (tests,
     plan/diff, health check, eval), procedures where they don't (restore
     drill, visual pass, playtest). Delete what doesn't apply; never invent
     a suite the project doesn't have. -->
- <check>: `<cmd or procedure>`
- <check>: `<cmd or procedure>`
- human sign-off: <what no command can prove — visual/UX, a prod-data migration is
  safe, the copy reads right. Delete if everything here is machine-checkable.>

## Gotchas
<!-- permanent mechanical constraints: "needs the X env var or it no-ops".
     A line with a reason you chose it over an alternative is a decision — move it to docs/DECISIONS.md.
     A dated measurement, an inventory, or a runbook step is NOT a gotcha —
     route it to a pointed-to file (see Start here). -->

## Canonical examples
<!-- paths only: code, IaC, a runbook, a chapter, an eval set — whatever shows
     how this repo's work is done -->
- `<path>` — <what it exemplifies>
