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
- **`koan-init / -wrap / -readback / -lint`** — the session-boundary rituals. `koan-lint --debt` also harvests every `koan:` shortcut into a ledger — from code, IaC, config and Markdown alike.
- **`koan-jazz`** — a quarantined branch where the ladder is suspended.
- A **SessionStart hook** (plugin installs only) — a deterministic continuity check that speaks *only* if something is wrong: a stale HANDOFF, a blown budget (HANDOFF, DECISIONS, or a CLAUDE.md past 20k), a citation that resolves to nothing, or — right after a compaction — uncommitted work the HANDOFF hasn't caught up with. Never writes, never blocks, completely silent in a healthy project and in any project that doesn't use koan.

## Install

**Download from GitHub** (clone or Download ZIP), open a terminal in the extracted
`koan` folder, and choose your host. Generated bundles are included; no build or
`npm install` is needed. The installer and executable checks require Node ≥ 22.

```bash
node push.mjs /path/to/project --target claude
node push.mjs /path/to/project --target codex
node push.mjs /path/to/project --target both
```

- **Claude:** all six skills and resources in `<project>/.claude/skills/`.
- **Codex:** all six native skills and resources in `<project>/.agents/skills/`.
- **Both:** both directories; existing project instructions and continuity docs
  are preserved. Run init in each host to wire its entrypoint, sharing one
  handoff and decision log rather than copying project facts.

For every project on your machine, use `--global` instead of a project path:

```bash
node push.mjs --target claude --global  # ~/.claude/skills/
node push.mjs --target codex --global   # ~/.agents/skills/
node push.mjs --target both --global   # both locations
```

Use `/koan-init` in Claude Code or `$koan-init` in Codex. Codex also lists the
skills under `/skills`; matching requests can activate them implicitly. Restart
the host if new skills do not appear. Avoid installing the same skills at both
project and user scope: hosts may list duplicates.
See [Codex's official skill locations and invocation rules](https://learn.chatgpt.com/docs/build-skills).

**Claude's automatic SessionStart check** requires the plugin install. Native
skill-directory installs (`claude`, `codex`, `both`) provide all six workflows,
including callable lint, but do not register hooks or edit host settings.
For Claude's plugin, use the marketplace:

```
/plugin marketplace add liminvl/koan
/plugin install koan@koan
```

If using that plugin alongside Codex, install only `--target codex` with this
script. Do not add loose Claude skills on top of a plugin. The installer detects
its local plugin layout; marketplace/user-level duplicates should be removed
through the host before installing another copy.

**Update or check an install:**

```bash
node push.mjs /path/to/project --target both --check
node push.mjs /path/to/project --target both --force
node push.mjs --help
```

`--check` writes nothing. It compares content, resources and stamps; a partial
or changed install exits 1. No install at all reports that fact and exits 0.
An ordinary install preserves modified files and reports conflicts before writing
either host. `--force` explicitly overwrites changed files, but never removes
unknown additions or retired skill directories; remaining drift is reported.
Project and `--global` scope are mutually exclusive.

**Manual copying:** copy the six directories under `dist/claude/skills/` or
`dist/codex/skills/` into the corresponding skill location above. Copy entire
skill directories, including templates, references and scripts. Instructions
alone need no Node runtime; `koan-lint` and Claude's hook do.

**Other targets:** `--target agents` installs only the compact core as
AGENTS.md (no skills, no hook — for hosts that read nothing else); `--target
user` aliases Claude `--global`; `--target plugin` installs the local Claude
plugin layout (omitting the project selects user scope). `--target` is always
required; there is no default host.

## The session loop
1. `/koan-init` once — reads what kind of repo this is and what proves a change, then seeds CLAUDE.md, `docs/HANDOFF.md`, `docs/DECISIONS.md` from what the repo already contains (or interviews you, if nothing exists yet). Any repo-backed work fits: an app, an ops estate, a data pipeline, an AI system, a manuscript.
2. Work — the lens keeps output minimal and routes every durable fact to its one home.
3. `/koan-wrap` when stopping — HANDOFF becomes a pruned snapshot a cold session can resume from; settled decisions get archived.
4. `/koan-readback` when resuming — the agent cross-checks context and surfaces discrepancies; it waits only for blocking answers or an explicitly requested confirmation.
5. `/koan-lint` any time the docs feel off — deterministic checks, read-only.

## What it looks like
The generated AGENTS.md opens with the four koans:

> - **The best code is the code you never wrote.** Build less.
> - **Leave the next session a map, not a maze.** Lose less.
> - **One fact, one home.** Every fact lives in exactly one place; everywhere else points to it.
> - **Snapshot, not diary.** State what *is*, delete what *was*. History is what git is for.

**Evidence is model-specific.** Historical behavior runs target frontier models;
results live in `benchmarks/results/`. A new model or harness version is unverified
until tested: tier membership is a compatibility hypothesis, not inherited proof.
Offline selftests validate the tools and graders, not model adherence.

| Rule (probe) | What flips | Latest reading | Record |
|---|---|---|---|
| decision trail (`trail`) | a real choice lands a D-entry unprompted | sonnet-5 2/3 · fable-5 ~1/4 · opus-5 0/3 — seat held by the tier (D-030) | `results/2026-08-07-…` |
| regression check (`onecheck`) | non-trivial logic ships a runnable test | flips on fable-5 | `results/2026-08-07-…` |
| interview (`greenfield`) | koan-init asks instead of inventing an Objective | flips on fable-5 and opus-5 | `results/2026-08-07-…` |
| phase routing (`phase`) | explore ⇒ bet in HANDOFF, build ⇒ D-entry | 3/3 variant delta on opus-5 (D-028) | `results/2026-07-11-…` |
| quarantine (`jazz`) | the spike stays off the working branch | only the skill arm quarantines, 5/5 readable runs; the finding gate is null (D-032) | `results/2026-08-07-…` |
| real proof (`shape`) | Checks seeded from the repo's actual proof | flips on fable-5-1, n=1 | `results/2026-09-23-…` |
| cold resume (Stage 2) | a fresh agent resumes from the wrapped docs | wrapped 15/15 vs equal-size diary 14/15 on opus-4.8 — a near tie on a small fixture (D-039) | `results/2026-07-11-…` |
| discovery (plugin eval) | the installed plugin fires from its descriptions alone | 3/3 prompts routed on fable-5-1, n=1 | `results/2026-10-25-…` |

Read the nulls as honestly as the flips: on the newest models some deltas are
closing from the top down, which is why the core stops growing until trail is
re-measured (D-049).

## Develop it
Edit **`src/`** only — `dist/` is generated; never hand-edit it. Node ≥ 22 is
needed for development, the installer, lint and the hook. Reading skill
instructions alone needs no runtime.

```bash
git config core.hooksPath hooks    # once per clone: wires the pre-commit gate (npm test)
npm run build                      # src/ → dist/ (Claude + Codex bundles + AGENTS.md)
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
