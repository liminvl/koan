# koan

> Zen-discipline skill kit for coding agents: **build less** + **lose less**,
> generated from one source to many LLM coding environments. This repo dogfoods
> itself — it uses koan's own continuity docs.

@docs/DECISIONS.md

## Start here
Read docs/HANDOFF.md for current state and next steps. On a cold start, run
`/koan-readback`. Stopping → `/koan-wrap`. Docs feel off → `npm run selfcheck`.
About to `/compact` → checkpoint first (compaction is lossy; HANDOFF isn't).
Touching `benchmarks/`? Read `docs/DECISIONS-benchmarks.md` first. Changing the
tooling, a gate, or how a change is judged? Read `docs/DECISIONS-method.md` —
both are deliberately outside the auto-loaded log ([[D-033]]).

**Phase:** harden
<!-- Both shortcuts dispositioned (D-038): build.mjs's "add an adapter" note was
     never debt — two targets is the intended set, since Cursor/Copilot/Codex read
     AGENTS.md natively — and the continuity fixture's DB stub cites D-001, which
     is what accepting a shortcut now means. In `harden`, a choice lands on the
     safe side: prefer the boring fix, and new surface needs a reason, not just a use. -->

## Stack
Node.js ≥ 22 (ESM, `.mjs`, no dependencies). Plain Markdown skill sources. No
build framework — the build is a handful of `.mjs` scripts.

## How to run
- Build all targets: `npm run build` (src → dist/)
- Push into a project: `node push.mjs <path> [--target claude|agents]`; refresh
  the user-level skills: `node push.mjs --target user`. Add `--check` to any of
  these to report drift and write nothing (exit 1 if a copy is stale).
- Install as a plugin (the only target that ships the SessionStart hook):
  `node push.mjs [<path>] --target plugin` — no path ⇒ `~/.claude/skills/koan/`.
- Self-regression check: `npm run selfcheck`
- Shortcut ledger: `npm run debt` (= `lint.mjs --debt`; there is no koan-debt skill)

## Checks (what "done" requires)
- build: `npm run build` (includes the generation canary)
- selfcheck: `npm run selfcheck` (budgets + canary + dogfood lint)
- tests: `npm test` (build + selfcheck + benchmark selftests, all offline)
- human sign-off: that a rule change still reads as koan — voice, and whether a new
  rule earns its tokens. No command can price a skill line; only a benchmark run or
  your judgement can.

## Gotchas
- The single source of truth is `src/`. **Never hand-edit `dist/`** — it's generated.
- The Checks run at commit time via `hooks/pre-commit`; wiring is one-time per
  clone: `git config core.hooksPath hooks`.
- The compact `<!-- koan:core:start/end -->` markers in `src/koan.skill.md` define
  what AGENTS.md ships. Rules outside them reach the full Claude skill only.
- Benchmark Stage 1/2 runners spend API credits; their `--selftest` paths are offline.
- Files under `hooks/` don't hot-reload the way a `SKILL.md` does — after pushing the
  plugin target, restart Claude Code or `/reload-plugins`.
- Budget counts are **line-ending dependent**: `lint()` counts characters of the file
  as it sits on disk, so a Windows checkout with `autocrlf` reports ~1 char per line
  more than the same content on Linux (HANDOFF reads ~8.8k here, ~8.6k in git). It's
  under 2% and threatens no ceiling, but don't compare a number across machines.
  Build stamps are NOT affected — `restampDir` normalizes newlines before hashing.

## Canonical examples
- `src/koan.skill.md` — the core skill source + the core markers.
- `build/build.mjs` — how a target is generated; add an adapter under `build/targets/`.
- `src/lifecycle/lint.mjs` — the deterministic lint engine (shipped + reused by selfcheck).
- `benchmarks/selfcheck.mjs` — Stage 0, the anti-bloat gate.
- `build/lib.mjs` `restampDir()` — hash the finished dir, don't hand-list what it ships.
