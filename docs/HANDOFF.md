# Handoff

> Rolling snapshot — what is, what's next. Overwrite stale lines; don't append a
> diary. Budget: ≤ ~15k chars.
> Stable facts belong in the constitution; decision rationale in docs/DECISIONS.md.

## Objective
A single-source skill kit, **koan**, that unifies build-less (ponytail) and
lose-less (handoff) discipline, builds to many LLM coding environments, pushes
into existing projects, and benchmarks itself against regression as it grows.
Done when: the skill is content-complete, builds cleanly, and Stages 0–2 run.

## Current state
**Skill slimmed and publish-ready.** The safety carve-out now lives inside
`koan:core`, so AGENTS.md ships it; the Never and Boundaries sections and the
`ultra` intensity are deleted ([[D-040]]). Public-repo prep is done ([[D-041]]):
personal references scrubbed, root `.claude-plugin/marketplace.json` added
(plugin source `./dist/claude`), README restructured to lead with the consumer
install. `npm test` is green.
**Six skills** — `koan-debt` folded into `koan-lint --debt` ([[D-036]]).
Benchmarks: Stage 1 is **behavior only**. Deltas remain model-*split* within
the frontier tier ([[D-030]]): on claude-opus-5 onecheck and greenfield flip,
trail does not; trail still flips on fable-5 + sonnet-5.
Results: `benchmarks/results/` (outcome runs preserved as a record).
The log holds two domain sets ([[D-033]]): `benchmarks` and `method` — the
splitting line is **a consumer never experiences anything decided in a set**;
topic-first routing is settled rejected, and a split now ships a constitution
read-trigger line ([[D-042]]).
14 field repos consume the user-level plugin. The 2026-08-20 external refactor
review's findings are landed ([[D-043]]): the budget system now prices the
entry, not just the file. Of the three over-budget repos measured, the new
diagnostics fire correctly on iams-wordpress (W-series + fat entries) and
hostinger (fat entries); vibe-shield compressed itself under budget and lints
clean.

## What's built
- Core lens (`src/koan.skill.md`) + five lifecycle skills. `lint.mjs` carries 12
  live checks (8 and 13 retired — 13 never shipped; 14 names parallel ID series)
  plus `--debt`; readback cross-checks git.
- **Project-phase axis** ([[D-028]]) — `**Phase:**` explore/build/harden in
  CLAUDE.md sets ONE thing: where a choice lands. Absent ⇒ `build`.
- **`koan-jazz`** ([[D-029]]) — bounded improvisation on a `jazz/<topic>` branch;
  ladder/trail/`D-nnn` suspended, safety carve-outs and Nevers never.
- **SessionStart hook + `plugin` target** ([[D-035]]) — runs `lint()` at session
  open, no new detection. Never writes, never blocks, exits 0 always, silent
  unless a koan repo is faulty (cap 800 chars). Claude-only.
- Build system (`build/`) — single source → dist targets ([[D-002]]). Artifacts
  carry a version+hash stamp; `restampDir()` hashes each finished skill dir, so
  adding a bundled file needs no build change. `push.mjs --check` dry-runs the
  stamp compare ([[D-031]]). `hooks/pre-commit` runs `npm test`.
- Stage 0 selfcheck — budgets, canary, dogfood lint **+ 42 pinned doc shapes**
  (`benchmarks/lint-fixtures.mjs`, [[D-037]]), trigger routing ([[D-025]]),
  bundle self-containment ([[D-034]]), hook decision table, and a budget-number
  drift check (prose claims vs `lint.mjs` constants, [[D-043]]). Fails on
  warnings; `--record` re-baselines.
- Stage 1 (behavior) and Stage 2 (continuity) harnesses — construction details in
  `docs/DECISIONS-benchmarks.md`; how the kit is priced and checked in
  `docs/DECISIONS-method.md` ([[D-033]]).

## Changes this session (2026-08-20, twenty-seventh sitting — external refactor review landed)
- **[[D-043]]** minted: budgets price the entry too. Over-budget DECISIONS
  warning names the fattest entries (silent under budget); new check 14 names
  parallel ID series (`## W-001…`); check 9 now counts constitution + domain-set
  citations; "five short fields" ships in the template header and wrap §3–§4;
  selfcheck asserts prose budget claims agree with `lint.mjs` constants
  (exported for it). 9 new fixture pins (33 → 42).
- **D-038 archived** (implemented, 14 days, behavior fixture-pinned) — freed
  ~1.75k, which D-043 spent: DECISIONS 29,315 → 29,175.
- koan-wrap ceiling 7200 → 7550 (was 99.5% flush after the §3/§4 teaching;
  budgets.json's wall rule). koan-wrap 7008 → 7166 chars.
- The review's per-project budget override is **deferred, not rejected** — see
  D-043's revisit-if. The review transcript:
  `C:\Users\saulm\repos\meta-master\docs\koan-refactor-review.txt` (right-edge
  clipped; re-export if it's to be kept as provenance).
- `npm test` green post-change.

## In progress
- Nothing half-coded.

## Next steps
What survives is small on purpose; do not repopulate it to feel busy.

1. **Commit this session's work** (D-043 + D-038 archive + lint checks +
   fixtures + wrap/template teaching + ceiling raise) — the pre-commit hook
   re-runs `npm test`. Then refresh the installed plugin:
   `node push.mjs --target plugin --force` + `/reload-plugins`.
2. **Compress the two over-budget field repos** with the new guidance:
   iams-wordpress (convert the W-series to `### D-` entries in a
   `docs/DECISIONS-wordpress.md` domain set, or archive its settled ones) and
   hostinger (compress D-016/D-020/D-018 to five fields). Then re-measure — if
   either still legitimately exceeds 30k, D-043's revisit-if fires (the
   explicit per-project override).
3. **Five real [[D-027]] violations in the field**, found by the hash check that
   was then rejected (the check was noisy; these findings are not). Each names a
   commit as the repo's current position in `## Current state`; the repo+hash
   list lives in `docs/FIELD.local.md` (gitignored). The fix is one line each —
   say what the work is, not where git is.
4. **Re-measure trail before the next core addition, not after** ([[D-030]]). The
   seat now holds by one run on one model, and the trend is monotone downward.
5. **Watch whether `method` is ever opened.** [[D-033]]'s standing risk, and this
   set is more exposed than `benchmarks`: a session changing tooling has no
   directory cue equivalent to "touching `benchmarks/`". Signal: a change that
   re-argues something [[D-036]] or [[D-037]] settled. Two sets is the limit — a
   third means the main log is the wrong shape, not that another file is needed.

## Not yet verified
- **The D-043 diagnostics ran once, from this repo, against three field repos.**
  No consumer session has yet seen the compress-first warning or the W-series
  warning and acted on it; whether the wording lands is untested.
- **The §4 read-trigger guidance has no field exposure** ([[D-042]]) — no
  consumer has split a domain set since it shipped; the first real split is its
  test. Both of this repo's sets already had hand-written triggers, so dogfood
  can't exercise it.
- **The promoted safety rule has no behavior probe** ([[D-040]]) — the canary
  verifies its presence in AGENTS.md; nothing measures whether consumers act on
  it. The cuts themselves were checked: a fable-5 Stage 1 run (2026-08-07)
  shows every probed rule intact — see
  `benchmarks/results/2026-08-07-stage1-fable5-post-d040.md`.
- **The marketplace install is verified from a clean profile, not a clean
  machine** (2026-08-07): empty `CLAUDE_CONFIG_DIR`, `plugin marketplace add
  un5table/koan` + `plugin install koan@koan` both succeeded fetching from
  public GitHub; the cached install carries all 6 skills + the hook bundle at
  the current build stamp; the installed hook is silent on healthy and
  non-koan fixtures, speaks on a broken one, exit 0 on all paths; the bundled
  lint engine loads standalone from the cache. Still unobserved: a coworker's
  box, and Claude Code invoking the hook at a real session open from a
  marketplace install (the mechanism [[D-035]] proved used the skills-dir
  install).
- **The sweep has field exposure only through the linter, not the skills.** All 14
  repos were linted with the swept engine and 13 are clean, but no consuming repo
  has been observed *using* a skill from the six-skill build — the plugin is
  installed and stamped current, and that is all anyone has watched it do.
- **Cutting the outcome arm was ungated** — the confirming opus-5 run was
  explicitly skipped as not worth the credit. If a behavior question later needs
  loc-counting, [[D-036]] says rebuild it smaller, and this is the line that says
  we chose not to know.
- **The compressed log is unproven at resume.** 22.4k reads as complete to the
  session that compressed it — which is exactly the reader who can't judge it.
  Proof = a Stage 2 cold-resume, or the first session that has to ask why a
  decision was made and can't tell from the entry.
- **The 15k HANDOFF budget is a judgement, not a measurement.** No run shows a 15k
  snapshot still lands the way the 12k one did.
- **The hook is proven in one repo, on one box** ([[D-035]]) — koan's own. Untested
  is a *consuming* repo where the reader isn't the person who wrote the checker.
- **trail's core seat now holds by a single run** ([[D-030]], refreshed 2026-08-06;
  +1 fable-5 null 2026-08-07 — baseline minted a well-formed D-002 unprompted, so
  fable-5 reads ~1/4): 0/3 opus-5, 2/3 sonnet-5. Sonnet-5 alone clears [[D-022]]'s
  bar. Its one miss was koan's, not the baseline's — the arm routed the choice to a
  `koan:` marker instead of the log, which may be a narrow grader (fs-first on
  DECISIONS.md) as much as a missed rule. Unresolved which.
- **Nothing checks that a new RULE arrives with a gate.** [[D-037]] closed this for
  lint checks — a check without a pin is now visible — but a *rule* in the skill
  prose still needs a probe, and no Stage 0 check can judge evidence. Delegation
  was cut for having none ([[D-036]]) after getting in unnoticed, the same way
  [[D-025]] found routing unasserted. Still a `koan-wrap` habit or nothing.
- **jazz's null is n=1 per model** ([[D-032]]); sonnet-5 still unreadable.
- **The phase gate is n=3 on one model** ([[D-028]]).
- **`rtk-probe` is validated with stub binaries only.**
- n=1 per cell on the model matrix — directional. Stage 2 has one cold-resume.
- The trigger check ([[D-025]]) validates **lexical** routing only. Its two
  ex-`koan-debt` prompts now pin to `koan-lint` and pass, but no real harness has
  been observed routing a debt request there.

## Open questions for the human
- None right now.
