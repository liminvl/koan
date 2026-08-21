# koan

**Zen discipline for coding agents.** One skill that catches two things
before they cost you: **over-building** (build less) and **lost context** (lose
less). Authored once in `src/`, generated to many LLM coding environments, and
benchmarked against its own regression as it grows.

> What you leave out is the work. What you leave behind is the teaching.

**New to koan? Start with [the guide](GUIDE.md)** — why it exists, what each
skill does and when to reach for it, walkthrough scenarios, and an FAQ. The rest
of this README covers installation and development.

## What's in the box
- **`koan`** — the always-on lens: two practices (build-less ladder + lose-less trail).
- **`koan-init / -wrap / -readback / -lint`** — the session-boundary rituals. `koan-lint --debt` also harvests every `koan:` shortcut into a ledger.
- **`koan-jazz`** — a quarantined branch where the ladder is suspended.
- A **SessionStart hook** (plugin installs only) — a deterministic continuity check that speaks *only* if something is wrong: a stale HANDOFF, a blown budget, a citation that resolves to nothing. Never writes, never blocks, completely silent in a healthy project and in any project that doesn't use koan.

## Install

**Claude Code (easiest):** add this repo as a plugin marketplace — no clone, no
runtime needed:

```
/plugin marketplace add liminvl/koan
/plugin install koan@koan
```

That installs all six skills plus the SessionStart hook. Then run `/koan-init`
once in a project to set up the continuity docs.

**Other tools (Cursor, Copilot, Codex, …):** they read `AGENTS.md` natively —
the de-facto cross-tool standard — so drop `dist/agents/AGENTS.md` into the
project root (it's the compact core: the four koans + both practices, under ~5.2k
chars). From a clone, `node push.mjs <project>` does the copy and stamps it.

**From a clone**, `push.mjs` covers every layout:

```bash
node push.mjs <project>                   # AGENTS.md into a project root
node push.mjs <project> --target claude   # skills into <project>/.claude/skills/
node push.mjs --target user               # skills into ~/.claude/skills/ (no hook)
node push.mjs [<project>] --target plugin # full plugin incl. hook; no path ⇒ ~/.claude/skills/koan/
node push.mjs <project> --check           # report drift, write nothing (exit 1 if stale)
```

Generated files carry a build stamp; re-running `push` skips copies that are
already current and names stale ones. Plugin and flat installs provide the same
skills, so `push` refuses to add one on top of the other and names what to
remove. Changes under `hooks/` don't hot-reload the way a `SKILL.md` does —
restart Claude Code or run `/reload-plugins` after pushing.

## The session loop
1. `/koan-init` once — seeds CLAUDE.md, `docs/HANDOFF.md`, `docs/DECISIONS.md` from what the repo already contains (or interviews you, if nothing exists yet).
2. Work — the lens keeps output minimal and routes every durable fact to its one home.
3. `/koan-wrap` when stopping — HANDOFF becomes a pruned snapshot a cold session can resume from; settled decisions get archived.
4. `/koan-readback` when resuming — the agent plays its understanding back for correction *before* touching code.
5. `/koan-lint` any time the docs feel off — deterministic checks, read-only.

## What it looks like
The generated AGENTS.md opens with the four koans:

> - **The best code is the code you never wrote.** Build less.
> - **Leave the next session a map, not a maze.** Lose less.
> - **One fact, one home.** Every fact lives in exactly one place; everywhere else points to it.
> - **Snapshot, not diary.** State what *is*, delete what *was*. History is what git is for.

**Designed for frontier models.** The behavior deltas that earn each rule its
tokens are verified on **frontier-tier** models (current Opus/Fable class) and
degrade partially one tier down; small fast models do not act on standing rules
at all (D-023). On weaker models the docs still help — the rules just don't
self-enforce. The stance is per tier, not per model ID: a new release inherits
its tier's evidence until a run says otherwise.

## Develop it
Edit **`src/`** only — `dist/` is generated; never hand-edit it. Node ≥ 22 is
needed for development and for `koan-lint`'s script; installing or *using* the
skills needs no runtime.

```bash
git config core.hooksPath hooks    # once per clone: wires the pre-commit gate (npm test)
npm run build                      # src/ → dist/ (Claude plugin + AGENTS.md)
npm run selfcheck                  # Stage 0: budgets + canary + dogfood lint
npm test                           # build + selfcheck + benchmark selftests (all offline)
```

## Layout
```
GUIDE.md        the user manual — concepts, when to use what, scenarios, FAQ
src/            the single source of truth (skill + lifecycle + lint engine + templates)
build/          one source → per-environment targets (+ generation canary)
push.mjs        copy a build into an existing project
benchmarks/     Stage 0 (selfcheck) · Stage 1 (behavior) · Stage 2 (continuity)
docs/           koan's own HANDOFF + DECISIONS — it dogfoods itself
```

## How it improves
Every change must pass the **anti-bloat gate**: if a feature grows the skill's
token cost (Stage 0) without changing behavior (Stage 1), it's cut — and the
ceiling is lowered afterwards, so freed budget doesn't quietly fund the next
feature. The gate applies to koan's own tooling too: the 2026-08-05 sweep cut a
whole benchmark arm, a skill, and the ingest pipeline on exactly that rule
(D-036, in `docs/DECISIONS-method.md`).

Lineage: the build-less half descends from
[ponytail](https://github.com/DietrichGebert/ponytail), the lose-less half from a
handoff workflow. Seven external repos and guides were ingested during
development; all seven changed nothing, which is why the ingest pipeline is
closed and its record lives in the development archive, not this tree.

MIT © Saul McClintock
