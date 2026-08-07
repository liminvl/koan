---
name: koan-lint
description: >-
  Validate a project's koan docs deterministically — decision-ID integrity
  (index<->archive parity, duplicate IDs, dangling citations), context budgets,
  dead canonical-example paths, doc staleness vs git, and setup health. Also
  harvests the `koan:` shortcut ledger (`--debt`) — what the project deliberately
  deferred. Use on "/koan-lint", "check the koan docs", "koan debt", "what did
  koan defer", "list the shortcuts", or as the mechanical pass inside koan-wrap.
  Read-only: it reports, it never edits.
---

# Koan lint

The deterministic bookkeeping a model is bad at eyeballing — cross-reference
parity, exact char budgets, dead paths, deferred shortcuts. Offload them here
instead of trusting a skim.

## How to run
Run the bundled script from this skill's directory against the project root and
relay its output verbatim. Requires Node ≥ 22.
```
node lint.mjs --path .
```
It groups ERRORS then WARNINGS and prints the budget line. Exit code: `0` clean ·
`1` warnings · `2` errors.

## The debt ledger
Every deliberate koan shortcut carries a `koan:` comment naming its ceiling and
upgrade path (`// koan: global lock, per-account locks if throughput matters`).
To list them instead of linting docs:
```
node lint.mjs --path . --debt
```
A flat `file:line  <note>` ledger — the point is visibility, not action. Don't
pay any of them down in this pass; that's a normal session's job. Flag any note
with no upgrade path: a `koan:` comment without a ceiling is a TODO in disguise.

## Output
ERRORS first, then WARNINGS, then the budget line. End with a verdict: **clean**,
**N warnings**, or **N errors to fix**. Read-only — fixing what it finds is a
normal session's job (or `/koan-wrap`), not this one's.
