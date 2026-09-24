# 2026-09-23 — Stage 1: the `shape` probe's first real runs (D-044 / D-045)

- **koan version:** 0.1.0 (`31a5b70` = D-044; second run on the uncommitted D-045 tree)
- **Stage:** 1 (behavior), `--probes shape` only
- **Model(s):** claude-fable-5-1, n=1 per arm shape (two runs, different arm shapes)
- **Arms:** baseline, koan-init (per-probe pair, [[D-021]])

## Headline
**The delta flips once the arm can see its bundle.** Run 1 (arm = SKILL.md
alone) scored koan-init "no" on `ops`; run 2 (arm = SKILL.md + templates +
references, [[D-045]]) scored it "yes" with baseline still "no". `mvp` is
yes/yes under both — the no-ceremony half is a guard, and it held.

## Numbers
| run | arm shape | variant | baseline | koan-init | reading |
|---|---|---|---|---|---|
| 1 | SKILL.md only | ops | no | **no** | arm inferred the estate, seeded `--check --diff`, wrote "a backup is not proven until a restore has been exercised" — under *Next steps*, because it "could not read templates/" and invented its own section set. Measured the sandbox ([[D-015]]'s class) |
| 1 | SKILL.md only | mvp | yes | yes | no SLO/DR/runbook ceremony either side |
| 2 | full bundle | ops | no | **yes** | koan-init: Checks = real commands + "there is no suite"; restore gap under *Not yet verified*; `docs/estate.md` pointer file with a read-trigger. Baseline: real commands too, no *Not yet verified* section, restore never named as unproven |
| 2 | full bundle | mvp | yes | yes | guard holds |

Raw answers: `benchmarks/runs/behavior-fable-5-1-2026-09-24/` (run 1) and
`…-2026-09-24-2/` (run 2). Fixture dirs preserved under the OS temp dir for
the session only.

## Regression check (vs previous version)
No other probe was run this sitting (a stray full run was started by mistake
and stopped after two arms of `trail`; its partial output was deleted, not
recorded). Sizes: koan-init 4819 → 5480 (ceiling 5100 → 5750), koan-wrap 7166
→ 7402 (7550 → 7800), core +58 (description only), AGENTS.md unchanged. The
`shape` flip is the behavior this growth bought; [[D-013]] prices it as a
lifecycle-skill rule, not a core seat.

## Caveats / supersession
- n=1 on one model. [[D-022]]'s 2-of-3 is unmet; sonnet-5 unmeasured.
- The baseline "no" is narrow: fable-5-1 seeds the estate's real commands on
  its own. What the skill adds is *where* the missing proof goes (a *Not yet
  verified* line, not a next step) and the pointer file. If a future model
  writes those unprompted, this delta goes null the [[D-030]] way.
- Run 1 is kept as the record of the harness fault, not as a null for the rule.
