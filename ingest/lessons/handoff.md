# handoff

## → lose-less discipline

**Adopted**
- **One fact, one home** + routing table (which file owns which kind of line). · handoff-wrap · _adopted_ → Practice 2 + koan-wrap routing table.
- **Snapshot, not diary; overwrite stale lines.** · handoff-wrap · _adopted_ → The four koans + koan-wrap.
- **Collapsing into `<details>`/archive still costs full tokens.** · handoff-wrap · _adopted_ → Rules + Never.
- **Explicit char budgets with a check command.** · handoff-wrap/-lint · _adopted_ → lint.mjs + budgets.json + Stage 0.
- **Deterministic checks offloaded to a lint, not eyeballed.** · handoff-lint · _adopted_ → koan-lint + reused in selfcheck.
- **Cold-start readback before work.** Play context back, wait for correction. · handoff-readback · _adopted_ → koan-readback + Stage 2 continuity benchmark.
- **Permanent decision IDs; archive ≠ delete; keep cited entries.** · handoff-wrap · _adopted_ → koan-wrap step 4.
- **Evidence-based "done".** A claim is done only when the project's Checks ran green. · handoff-wrap · _adopted_ → koan-wrap step 1 + CLAUDE.md Checks.
- **Seed from reality on init; split a mixed notes file by home.** · handoff-init · _adopted_ → koan-init step 3.

**Proposed (net-new — triage)**
- **Drift-audit bookkeeping.** handoff tracks `_Last drift-audit: <date>_` in HANDOFF and nudges when stale or after marking things done. koan's template carried the line but nothing maintained it. · handoff-wrap step 5 · _rejected 2026-07-03_ → line dropped from template + dogfood HANDOFF; an unmaintained bookkeeping line is exactly the debt koan warns about, and D-009 defers drift-audit ownership. Re-add with an owner if a `koan-drift` auditor is ever adopted. _Field counter-evidence 2026-07-04 (first-year): with the drift-audit agent installed, the line WAS maintained across ~15 sessions and did real work in a cold status review ("not re-run since `64494bc`" flagged a 4-commit verification gap). Rejection stands (it was conditional on an owner), but the data says: if a drift auditor is adopted, adopt the line with it._ _Third datapoint 2026-07-04 (rtime): `_Last drift-audit: never_` sat in HANDOFF from the 06-13 reorg onward, literally reading "never" — no auditor installed, never run. Confirms the split: the line only works where the agent exists (first-year); everywhere else it's dead weight._
