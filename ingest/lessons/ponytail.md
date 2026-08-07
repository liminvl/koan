# ponytail

## → build-less discipline

**Adopted (in `src/koan.skill.md`)**
- **A named persona anchors judgment.** "Lazy senior dev, paged at 3am" gives every rule a lens to resolve through. · SKILL.md · _adopted_ → zen craftsperson (D-004, D-010).
- **The ladder: stop at the first rung that holds.** A numbered decision procedure outlasts prose. · SKILL.md/AGENTS.md · _adopted_ → Practice 1.
- **Ladder runs after comprehension, never instead of it.** "A small diff you don't understand is laziness dressed up as efficiency." · AGENTS.md · _adopted_ → "When NOT to be lazy".
- **Bug fix = root cause, not symptom; grep every caller.** One guard in the shared fn beats one per caller. · AGENTS.md · _adopted_ → Practice 1.
- **One worked example across all modes** teaches faster than ten rules. · SKILL.md (cache example) · _adopted_ → Intensity.
- **Templated output.** `[code] → skipped: X, add when Y`. · SKILL.md · _adopted_ → Output pattern + wrap report template.
- **Aphorisms survive compression.** "The best code is the code never written"; "clever is what someone decodes at 3am". · SKILL.md · _adopted_ → The four koans.
- **Consolidated "when NOT to" guardrail block** keeps safety carve-outs in one place. · SKILL.md · _adopted_ → "When NOT to be lazy" + "Never".
- **Edge-case-correct beats flimsier when same size.** "Lazy means less code, not the flimsier algorithm." · AGENTS.md · _adopted_ → Rules.
- **The `koan:` shortcut comment names the ceiling + upgrade path.** · SKILL.md (`ponytail:`) · _adopted_ → Rules.
- **One runnable check on non-trivial logic.** Smallest thing that fails if the logic breaks; no frameworks. · SKILL.md · _adopted_ → "When NOT to be lazy".

**Adopted (2026-06-30 triage)**
- **Debt-ledger skill.** ponytail-debt harvests every `ponytail:` comment into a tracked ledger so "later" doesn't rot. · skills/ponytail-debt · _adopted_ → `koan-debt` skill + bundled `debt.mjs` (the `koan:` convention already shipped).

**Proposed (net-new — triage)**
- **Over-engineering review/audit skills.** ponytail-review (diff-scoped) + ponytail-audit (repo-wide) hunt only complexity to delete. Maps 1:1 to koan's build-less half. · skills/ponytail-review,-audit · _deferred_ → `koan-review`/`koan-audit` once the core lens is proven (avoid helper sprawl before it earns its place).

**Deferred / rejected**
- **Hardware-calibration carve-out.** "The platform is never the spec ideal — a clock drifts, a sensor reads off; leave the calibration knob." · SKILL.md/AGENTS.md · _deferred_ → niche; re-add only if koan is used for embedded/hardware work.
- **gain / help one-shot skills.** Scoreboard + reference card. · skills/ponytail-gain,-help · _deferred_ → gain needs real benchmark numbers; help is premature at 5 skills.
- **Helper-skill sprawl in general.** · _rejected for now_ → adding 5+ helper skills before the core lens is proven is the over-building koan warns against. Add each only when it earns its place.

## → skill distribution & testing

**Adopted**
- **Canary on load-bearing phrases.** Assert key rules survive propagation; a reword trips it. · scripts/check-rule-copies.js · _adopted_ → build/canary.mjs.
- **Description as trigger surface.** Enumerate the phrases that should fire the skill. · all SKILL.md · _adopted_ → koan frontmatter.
- **Gates vs measurements.** Correctness/safety *fail* a run; size/cost only record. · benchmarks/ · _adopted_ → Stage 1.
- **Instrument self-tests before spend.** Good+bad refs; the judge must rank bad above good. · benchmarks/agentic · _adopted_ → Stage 1/2 `--selftest`.
- **Built to disprove.** "If the arms converge, the benchmark says so." · benchmarks/README · _adopted_ → benchmark framing.
- **Honesty notes + supersession.** Mark an inflated/contaminated run, keep it, say why. · benchmarks/README, results/ · _adopted_ → results/TEMPLATE.md.

**Adopted (2026-06-30 triage)**
- **Behavior gates.** Probe whether a rule actually *changes behavior*, not just that the text is present: baseline arm FAILS, koan arm PASSES — the delta proves the rule "took". A rule whose gate baseline already passes isn't earning its tokens. · benchmarks/behavior.yaml · _adopted_ → `benchmarks/behavior/run.mjs` (probes: trail / onecheck / explanation; offline grader selftest).

**Proposed (net-new — triage)**
- **Hook-based always-on injection.** ponytail re-injects its rules every turn via SessionStart hooks, per environment. · hooks/ · _deferred_ → koan relies on skill/AGENTS load today (D-003: Claude + AGENTS first); generate hook configs when targeting Cursor/Codex/Copilot.
