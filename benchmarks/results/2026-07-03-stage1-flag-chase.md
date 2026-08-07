# 2026-07-03 — Stage 1 flag chase: contamination found, arms isolated, onecheck promoted

- **koan version:** 0.1.0 (working tree on `eb7fdea` + this session's instrument/content fixes)
- **Stage:** 1 (behavior gates)
- **Model(s):** claude-fable-5 (user default via `claude -p`), n=1 per run, 3 runs
- **Arms:** baseline (empty system), rival (85-char one-liner), koan (dist/agents/AGENTS.md)

## Headline
**Every previous Stage 1 behavior number was invalid — all arms were contaminated.**
The runners spawned `claude -p` with cwd in the koan repo, so every arm (including
baseline) inherited CLAUDE.md → DECISIONS → HANDOFF; the dogfooding repo injected
koan into its own control group. After isolating the arms (`--safe-mode` + neutral
tmp cwd) and fixing two malformed probes, the flags resolved: **explanation** is a
guard that holds, **onecheck** was absent from the arm — promoted into core, it
flips its gate cleanly (the delta that earns its tokens), and **trail** turns out
to be untestable without a project to leave a trail in.

## The contamination (why runs 1–2 are void)
Preserved evidence in `benchmarks/runs/behavior-2026-07-03-contaminated/`:
- The "baseline" answer to the explanation probe identified the prompt as
  "the `explanation` probe task from `benchmarks/behavior/run.mjs:41`", quoted
  HANDOFF's next steps, and analyzed the anti-bloat flag it was part of.
- "rival" answered onecheck with "matching this repo's Node stack" and offered a
  koan-vocabulary "lite mode" alternative.
- Second vector: koan's skills were installed to `~/.claude/skills/` earlier the
  same day, so user-level skills leaked into all arms too.

Fix: `claudeArm()` in `benchmarks/claude-cli.mjs` — every arm call now runs with
`--safe-mode` (no CLAUDE.md, no skills/plugins/hooks) in an empty
`%TMP%/koan-arm-*` dir. Verified with a live probe: arm reports no project
instructions, no koan skills, neutral cwd. Both behavior and outcome runners use it.

## Probe fixes (instrument, not rules)
- **explanation** and **trail** said "Refactor/rate-limit *this*" with no referent;
  in an isolated cwd an honest "which code?" fails the gate while confabulation
  passes. Both probes now carry an inline code snippet.
- Probes are typed: **delta** (rule earns tokens only if baseline fails and koan
  passes) vs **guard** (carve-out against a regression koan itself could cause;
  baseline passing is expected, alarm only if koan fails). explanation is a guard —
  the old "baseline already passes ⇒ cut" heuristic was a category error on it.

## Numbers (isolated arms)

Run A — clean isolation, pre probe-fix (`runs/behavior-2026-07-03-isolated-preprobefix/`):

| probe | kind | baseline | rival | koan |
|---|---|---|---|---|
| trail (no referent) | delta | no | no | no |
| onecheck (rule not in arm) | delta | no | no | no |
| explanation (no referent) | guard | yes | yes | **yes** |

Run B — probes fixed, onecheck rule promoted into core (`runs/behavior-2026-07-03/`):

| probe | kind | baseline | rival | koan |
|---|---|---|---|---|
| trail | delta | no | no | no* |
| onecheck | delta | no | no | **yes** |
| explanation | guard | yes | yes | **yes** |

## Flag resolutions
- **explanation — resolved, keep the rule.** With a real referent, koan gives the
  full requested write-up (guard holds, both runs). Reclassified `guard` so the
  anti-bloat heuristic stops misfiring on it.
- **onecheck — resolved, root cause was placement.** The rule lived below the
  `koan:core:end` marker, so the AGENTS arm never carried it; and no arm leaves
  checks unprompted in isolation (the contaminated run's baseline asserts came from
  repo context). Promoted the rule into core Rules (moved, not copied; AGENTS.md
  4555 → 4896 chars) and the gate flipped: koan leaves real `assert` lines,
  baseline/rival none. That is the delta that pays for the +341 chars. n=1 —
  demote again if the gate stops flipping on repeat runs.
- **trail — probe invalid in isolation, not a rule failure.** (*) koan's answer:
  "The directory is empty, so this is an inline answer rather than an edit to
  project files" — the rule routes decisions to the project's decision log, and a
  projectless arm has none. It still noted the architectural choice in prose as
  asked. Testing trail honestly needs a minimal fixture project (with
  docs/DECISIONS.md) as the arm cwd — logged as a next step. The "yes" in
  contaminated runs was the koan repo itself in reach.

## Caveats / supersession
- Supersedes the behavior table in `2026-07-02-stage1-first-real-run.md` (void:
  contaminated arms). The outcome table there also ran contaminated, but the bias
  direction is conservative for koan's claim (baseline had koan's context and koan
  still won loc); rerun outcome under isolation before citing its numbers anywhere
  that matters.
- All results n=1, one model — directional. The onecheck promotion is the first
  rule to pass the "earns its tokens" gate; repeat before treating it as settled.
- Stage 2's runner intentionally runs in the fixture repo (that's the point), but
  the user-level leak now applies there too since koan's skills went global this
  morning — audit before the next Stage 2 run (need: keep project CLAUDE.md,
  drop user-level skills; `--safe-mode` is too blunt for Stage 2).
