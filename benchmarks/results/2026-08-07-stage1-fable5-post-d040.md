# 2026-08-07 — Stage 1 after the D-040 cuts (safety→core; Never/Boundaries/ultra deleted)

- **koan version:** 0.1.0 (uncommitted working tree on `b817b27` — the D-040/D-041 sitting)
- **Stage:** 1 (behavior)
- **Model(s):** claude-fable-5, n=1
- **Arms:** baseline, rival, koan (+ per-probe arms: koan-init, koan-jazz)

## Headline
**No regression attributable to the cuts.** Every gate a koan arm faced passed:
onecheck and greenfield still flip clean, the explanation guard holds, phase
routes both variants, and jazz quarantines where baseline doesn't. The one null
is **trail** — baseline minted a real D-002 unprompted — which extends the
top-down decay [[D-030]] predicted, and predates the cuts.

## Numbers
| probe | kind | baseline | rival | koan / lifecycle arm | reading |
|---|---|---|---|---|---|
| trail | delta | **yes** | no | yes | null on fable-5 this run (was 1/3 on 2026-08-06) — see below |
| onecheck | delta | no | no | **yes** | clean flip; the check rule survived the ablation intact |
| explanation | guard | yes | yes | **yes** | guard holds — "no essays" still doesn't suppress a requested write-up |
| greenfield | delta | no | — | **yes** (koan-init) | clean flip; interview instead of invented Objective |
| phase build/explore | delta (variant axis) | yes/yes | yes/yes | yes/yes | both variants land under every arm — the [[D-028]] null arm delta, its success condition |
| jazz | delta | yes · `no-jam+code-on-main` | — | yes · `jam+clean` (koan-jazz) | finding gate null, but baseline left `scratch/*.mjs` on main; only the skill arm quarantined |

## Regression check (vs previous version)
This run is the check [[D-040]] deferred: full skill 7422 → 6402 chars (Never,
Boundaries, Intensity/`ultra` deleted), AGENTS 4929 → 5166 (safety carve-out
promoted into core). The rules the deleted sections *restated* all still
manifest where probed (onecheck, explanation, phase, greenfield) — consistent
with the cuts removing echo, not signal. The promoted safety rule itself has
**no probe in this set** (the old outcome arm's under-build guard was deleted in
[[D-036]]), so its presence in AGENTS.md is verified by the canary, not by
behavior — unchanged from its prior status as a guard.

- **trail:** baseline wrote a well-formed D-002 (choice, why, status) with no
  prompt to do so. With 2026-08-06's 1/3 fable-5 / 0/3 opus-5 / 2/3 sonnet-5,
  the fable-5 evidence is now ~1/4. [[D-030]]'s bar is tier-wide 2-of-3 nulls
  per model before demotion; sonnet-5 still holds the seat. The standing order
  (HANDOFF next-steps) stays: re-measure trail on sonnet-5 **before** the next
  core addition.
- **jazz:** the isolation column did the discriminating this run — the delta
  gate didn't. Recorded, not gated, per [[D-017]]; jazz remains n=2 per-model
  nulls on the finding gate with the quarantine delta real both times.

## Caveats / supersession
- n=1 per cell; directional only. Does not supersede 2026-08-06 — extends its
  trail series by one fable-5 datapoint.
- Nothing here measures the safety carve-out's *behavioral* reach in AGENTS.md
  consumers; that needs a guard probe built for it, or field evidence.
- Raw answers + post-run docs: `benchmarks/runs/behavior-fable-5-2026-08-07/`.
