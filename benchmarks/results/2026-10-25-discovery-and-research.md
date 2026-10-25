# 2026-10-25 — Discovery evals (first run) + the review's external evidence

- **koan version:** 0.1.0 (working tree on `c76fa69` — the D-049 sitting)
- **Stage:** discovery (`claude plugin eval`, new in D-049) + a three-prompt manual pilot
- **Model(s):** the profile's default session model (claude-fable-5-1 per this machine's saved
  default); **the eval JSON does not record the agent model** — pin `--model` next time. n=1 per
  arm. Judge: the tool's default (haiku).
- **Arms:** with-plugin vs no-plugin baseline (the tool's `with-without` ablation)

## Headline
**Every skill fires from its description alone.** All six `*-fired` indicators were true on the
with arm; the two negative pins (a Zen question, a translation) fired nothing in either arm.
Mean Δ over the scored outcome graders is **+0.33**; 9/10 cases at or above the 0.8 threshold.
The one miss is `lens-ordinary-task` at 0.67: the with arm marked its shortcuts and updated
HANDOFF but **did not write the D-entry** — the trail null [[D-030]] already tracks on the
top tier, now seen on the shipped path too.

## Numbers
Suite: `claude plugin eval ./dist/claude --scaffold --trust-plugin --allow-tools Write Edit
--max-cost-usd 15` · Claude Code 2.1.310 · 417 s · **$2.06** list price for 20 runs + judges.

| case | fired | with | without | Δ | reading |
|---|---|---|---|---|---|
| lens-ordinary-task | koan | 0.67 | 0.33 | +0.33 | `koan:` comment + HANDOFF line only with the skill; **no D-002 in either arm** |
| lens-review | koan | 1 | 1 | 0 | both arms: "nothing to remove"; a guard, held |
| init-greenfield | koan-init | 1 | 0 | +1 | with: asked; without: wrote a confident Objective |
| wrap-session | koan-wrap | 1 | 0.5 | +0.5 | only the skill arm moved the overclaim to *Not yet verified* |
| checkpoint-before-compaction | koan-wrap | 1 | 0 | +1 | only the skill arm recorded the WIP file |
| readback-then-fix | koan-readback | 1 | 0.5 | +0.5 | both fixed the bug; only the skill arm played back first |
| lint-read-only | koan-lint | 1 | 1 | 0 | no writes either arm (Bash not granted, so the engine never ran) |
| explain-wrap-no-run | — | 1 | 1 | 0 | guard held |
| unrelated-zen | none | 1 | 1 | 0 | negative pin held |
| unrelated-translation | none | 1 | 1 | 0 | negative pin held |

**Manual pilot, earlier the same day** (`claude -p`, user-level plugin, scratch repos, fable-5-1,
$1.89 for three prompts): the same three routing outcomes — `koan` on the ordinary task and on
the review prompt, `koan-wrap` then `koan-lint` on the wrap — and that run **did** write D-002
(17-line limiter, two `koan:` ceilings, HANDOFF updated, a test). One flip, one null, same day,
same model: the trail rule is exactly where [[D-030]] says it is.

## Regression check (vs previous version)
No skill prose changed. Stage 0 unchanged except the template (compaction line, memory comment)
and the lint tombstone cleanup. `push.mjs` now requires `--target`; the AGENTS core shrank to
5092 chars after the 2026-10-23 wording (budget 5350).

## External evidence gathered for the review (dated 2026-10-25; leads, not re-verified)
- Context-file studies (ETH `arXiv:2602.11988`, ICLR 2026; `2607.27250`; `2605.10039`):
  developer-written AGENTS.md/CLAUDE.md move task correctness ≈0–2 pp at +20% cost; what they
  help with is non-standard practice the README doesn't state. Adherence decays with work done in
  a session (~5.6% lower odds per generated function), not with file layout.
- Harness prompts still carry anti-gold-plating lines (Claude Code, OpenCode, Mistral Vibe; the
  Codex prompting guide carries the reuse ladder), but Codex has been removing them across
  5.2→5.6 and Anthropic reportedly cut most of its Claude Code prompt for the Opus 5 tier —
  [[D-030]]'s top-down decay from outside.
- Vendors: Claude Code auto memory (on by default, 25 KB index loaded each session, re-injected
  after compaction; project type covers "decisions Claude can't derive from git"); Codex memories
  off by default and "not the only source for rules that must always apply". Neither writes a
  handoff; the request is open (`anthropics/claude-code#11455`). CLAUDE.md guidance: <200 lines,
  imports don't reduce cost, skill bodies capped at 5k tokens each after compaction.
- Landscape (stars, GitHub API 2026-10-25): superpowers 305k, ponytail 176k, spec-kit 143k,
  claude-mem 103k, awesome-claude-code 56k, compound-engineering 26k, koan 0. Nobody else
  budgets or lints the authored docs or prices rules with a delta gate; the field's standard is
  hook-driven automatic capture and a published scoreboard.

## Caveats / supersession
- n=1 per arm; the agent model is unrecorded by the tool. Promotion-grade routing evidence needs
  `--runs 3 --model <id>` ([[D-022]]).
- `lint-read-only` grades routing only: without a Bash grant the engine cannot run, and native
  Windows has no sandbox backend to grant it under.
- Scaffold scripts ran under Git Bash on Windows; the Linux/CI path is unexercised.
- Supersedes nothing; the 2026-09-23 `shape` and 2026-08-07 Stage 1 records stand.
