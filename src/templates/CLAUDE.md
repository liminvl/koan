# <Project>

> Constitution. Permanent facts only — stack, how to run, what "done" means,
> gotchas, canonical examples. Now-state lives in docs/HANDOFF.md, not here.

@docs/DECISIONS.md

## Start here
Read docs/HANDOFF.md for current state and next steps. On a cold start or tool
switch, run `/koan-readback` before touching code.

_When to suggest a ritual:_ stopping/switching tasks → `/koan-wrap`. Resuming
after a gap → `/koan-readback`. Docs feel off → `/koan-lint`. About to
`/compact` → checkpoint first (compaction is lossy; HANDOFF isn't).
<!-- multi-tool project? Each tool's local memory is invisible to the others —
     git + these docs are the ONLY shared channel. Route anything a resume
     needs here, never to tool memory. -->

**Phase:** build
<!-- Sets ONE thing: where a choice lands. Name what would move it —
     "build — moves to harden once the auth flow has real users."
     explore · a provisional choice stays a bet in HANDOFF's "Not yet verified".
       No D-id minted; permanence is what you're deferring, not the thinking.
     build   · DEFAULT. A choice worth not re-litigating → docs/DECISIONS.md.
     harden  · as build, plus every `koan:` shortcut needs a disposition.
     UNCHANGED in every phase: the build-less ladder, the safety carve-outs
     (validation, data loss, security, accessibility), the Nevers. explore
     defers permanence, never discipline. Delete this line to get `build`. -->

## Stack
<!-- language, framework, package manager, runtime versions -->

## How to run
<!-- the commands to start dev / build / serve -->

## Checks (what "done" requires)
<!-- the real type/lint/test commands. Delete any the project doesn't have. -->
- types: `<cmd>`
- lint: `<cmd>`
- tests: `<cmd>`
- human sign-off: <what no command can prove — visual/UX, a prod-data migration is
  safe, the copy reads right. Delete if everything here is machine-checkable.>

## Gotchas
<!-- permanent mechanical constraints: "needs the X env var or it no-ops".
     A line with a reason you chose it over an alternative is a decision — move it to docs/DECISIONS.md -->

## Canonical examples
<!-- pointers (paths only) to files that show current conventions -->
- `<path>` — <what it exemplifies>
