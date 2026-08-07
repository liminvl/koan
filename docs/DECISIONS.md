# Decisions

> Auto-loaded every session — keep it lean (≤ ~30k chars). Choice + why only.
> IDs are permanent — never renumber. An entry is five short fields, not an
> essay: if the reasoning needs paragraphs, the paragraphs belong in the commit.

### D-001: koan unifies build-less and lose-less in one lens
- **Decision:** One skill governs both minimal-code discipline (ponytail) and session-continuity discipline (handoff), as peer practices.
- **Why:** Both failure modes are situational-awareness problems; one persona covers both and they reinforce each other.
- **Alternatives rejected:** coding-discipline only; continuity only; a meta skill-author.
- **Status:** accepted · _2026-06-30_
- **Load-bearing:** shapes the whole kit and every other decision.
- **Revisit if:** the two halves prove to dilute each other in benchmarks.

### D-002: Generate every target from one source
- **Decision:** `src/` is the only source of truth; `build/` generates each environment's files. No hand-maintained copies.
- **Why:** Ponytail keeps N hand-copies in sync with a canary and flags "generate them if this misses a drift". koan starts at that upgrade path — drift becomes impossible.
- **Alternatives rejected:** copies + canary (ponytail's model); hybrid.
- **Status:** implemented · _2026-06-30_
- **Load-bearing:** every "should we hand-tune this target" question routes here.
- **Revisit if:** a target needs hand-tuning the generator can't express.

### D-007: Node tooling; local push now, npm later
- **Decision:** Node.js (ESM, zero deps) for build/push/bench. `push.mjs` copies builds into a project; npm/marketplace publish deferred.
- **Why:** Cross-platform, no runtime to add. Publish details aren't load-bearing yet.
- **Status:** accepted · _2026-06-30_
- **Revisit if:** publishing is needed — pick the npm scope then.

### D-013: Behavior probes are typed — delta vs guard
- **Decision:** Each probe declares `kind`: **delta** (rule earns tokens only if baseline fails and koan passes) or **guard** (carve-out against a regression koan itself could cause; baseline passing is expected, alarm only if koan fails). "Baseline already passes ⇒ cut" applies to delta probes only. A rule ships in `koan:core` (= AGENTS.md) only if its delta gate flips.
- **Why:** The explanation flag was a category error — that rule guards against koan's own "no essays" pressure, so baseline passing is its expected state, not bloat evidence.
- **Alternatives rejected:** one heuristic for all probes (produced the false flag); dropping the carve-out (the guard exists because koan pressures against it).
- **Status:** implemented · _2026-07-03_ — demotion bounded by [[D-030]]; a third probe kind added by [[D-028]].
- **Load-bearing:** every promotion and demotion argument starts here.
- **Revisit if:** a guard probe never fails across many versions, or the onecheck delta stops flipping.

### D-019: Field lessons land on free channels; skill tokens need a unique claim
- **Decision:** Lessons from field ingests are adopted as **lint rules** when deterministically checkable and as **template comments** when they're point-of-temptation guidance. Skill prose is spent only when neither channel can carry the rule.
- **Why:** Lint code and template comments cost zero context tokens. 7/7 triaged lessons landed without touching core/AGENTS.
- **Alternatives rejected:** a wrap clause per lesson (duplicate tokens for rules lint already enforces); an info-level lint severity (machinery to dodge a design constraint).
- **Status:** implemented · _2026-07-04_
- **Load-bearing:** the default answer to "where does this rule go" — cited by [[D-028]], [[D-029]], [[D-030]], [[D-033]], [[D-034]].
- **Revisit if:** an ingested lesson needs a core/AGENTS seat — then [[D-013]]'s delta gate applies, not this policy.

### D-020: handoff-kit ingest — sign-off line, greenfield interview, fit-test
- **Decision:** Adopted three lessons from `handoff-kit` (independent reimplementation, same author): a `human sign-off:` line in the Checks template; a greenfield-interview step in `koan-init` §3a; a fit-test one-liner in `distill.md`'s bar. Deferred a `SessionStart` staleness hook.
- **Why:** handoff-kit distilled the same field deployment as [[D-019]] on the same day and converged on the same lint/routing lessons — cross-validation. Its three new ideas each closed a real gap: Checks over-claimed "done", `koan-init` had no empty-repo path, scope discipline had no quotable test.
- **Alternatives rejected:** adopting the hook then (no shared hook mechanism across targets).
- **Status:** implemented · _2026-07-04_ — the hook deferral closed by [[D-035]].
- **Revisit if:** the fit-test blocks a lesson that should land.

### D-022: A core seat needs a replicated flip — 2 of 3 runs
- **Decision:** Promoting a rule into `koan:core` requires its [[D-013]] delta gate flipping in **≥2 of 3 runs** on the model the promotion cites. Routine probe sampling stays n=1. Existing seats keep their n=1 evidence.
- **Why:** LLM runs are stochastic; one flip can be noise, and a core seat is a permanent token spend in every consumer's context. Bounding replication to promotion time keeps cost proportional to stakes.
- **Alternatives rejected:** replicating every probe run (spend with no decision riding on it); n=1 promotion (noise buys permanent tokens); 5-run majorities (cost outgrows signal).
- **Status:** accepted · _2026-07-10_
- **Load-bearing:** the bar [[D-030]] applies per model when demoting.
- **Revisit if:** 2-of-3 passes a rule that later demotes repeatedly.

### D-023: koan is a frontier-model kit; core is not reworded for weaker models
- **Decision:** koan targets frontier models, claimed **per tier, not per model ID**: verified frontier (fable-5, opus-5 via [[D-028]]), partial one tier down (sonnet-5), not landing on small fast models (haiku-4.5). A new release inherits its tier's evidence. Core wording stays as-is; the README documents the stance.
- **Why:** Haiku's non-adherence is a capability floor, not a wording problem. Chasing sonnet-5's partial adherence risks exactly the core bloat koan exists to catch.
- **Alternatives rejected:** rewording core + matrix rerun (bloat risk, unproven gain); leaving the question open.
- **Status:** accepted · _2026-07-10_
- **Load-bearing:** defines the "tier" [[D-030]]'s demotion rule quantifies over.
- **Revisit if:** a real consumer deploys koan on a weaker model and the deltas matter there.

### D-025: Descriptions are a checked routing surface
- **Decision:** A **trigger-surface check** (`benchmarks/triggers.mjs` + `triggers.json`): pinned realistic prompts must rank their skill strictly first under tf-idf over the shipped descriptions, plus a ≥75% collision ceiling. Selfcheck check 4.
- **Why:** Descriptions are koan's routing surface but nothing checked they still route — a description reword tripped no alarm, since the canary pins rule phrases, not routing. Free channel per [[D-019]], zero skill tokens.
- **Alternatives rejected:** a whole eval framework (bigger than what it measures); anti-rationalization tables (permanent token spend).
- **Status:** implemented · _2026-07-11_ — prompt set re-pinned whenever the skill list changes ([[D-029]], [[D-036]]).
- **Revisit if:** a pinned prompt false-fails a legitimate description improvement (loosen rank-1 to top-2 before deleting prompts).

### D-027: HANDOFF never restates a fact git owns
- **Decision:** `Current state` may not contain a HEAD hash, a branch tip, or a clean/uncommitted claim; environment state is written as a **dated verification** ("staging verified 2026-06-30 on `a1b2c3d`"), never a present tense. Hashes appear only in `Changes this session`, as evidence for a claim.
- **Why:** Observed, not theory — a consuming repo accumulated three `docs: correct the HANDOFF lines the push falsified` commits. HANDOFF sits *inside* the repo it describes, so committing it invalidates the git facts it just recorded. Those facts already have a home that `koan-readback` checks and that wins on disagreement. Present-tense environment claims rot silently because nothing local can falsify them.
- **Alternatives rejected:** ordering tricks (impossible for the commit's own hash); a bare-hex lint rule (a hash is legitimate in Changes, so the check can't see intent); one correction commit per session (normalizes a falsified doc).
- **Status:** implemented · _2026-07-31_ — enforced by `koan-wrap` §2/§5, the HANDOFF template, and lint check 11 (section-scoped per [[D-036]]). Extended 2026-08-06 to **review status**: "awaiting review", "ready to merge" describe a queue no reader can see and rot on the same clock, so the template asks for what the work IS and NEEDS instead. Prose only — it earns no check, and lands on a free channel ([[D-019]]).
- **Revisit if:** — **answered 2026-08-06, negatively.** Built, pinned, run against 14 real repos: 13 hits, only 5 live claims; 8 were durable references that never rot ("tagged v1.0.0 on `4f92c21`"). `git cat-file` verification and a dated-claim exemption weren't enough — the only thing left separating the two is prose wording ("committed ON" vs "IN"), the over-fitting that retired check 8. This entry's own Alternatives predicted it: "the check can't see intent." Don't rebuild without a discriminator that isn't wording.

### D-028: Phase ships free-channel; a null arm delta is its success condition
- **Decision:** The project-phase axis (`**Phase:** explore|build|harden`) on **free channels only** — both templates + `lint.mjs` (checks 6/9 gated in explore, 12 added in harden) — no `koan:core` seat. Its gate is the `phase` probe's **fixture-variant** axis, not the arms axis.
- **Why:** Variant delta flipped **3 of 3 on claude-opus-5** — same reasoning, two homes. The arm delta is **null**: baseline flips as hard as koan. That is not [[D-013]]'s "baseline passes ⇒ cut" signal — that heuristic prices *skill tokens* and this rule spends none. A null arm delta proves the free channel suffices ([[D-019]]).
- **Alternatives rejected:** folding phase into the intensity levels (orthogonal); a `## Bets` section (wrap's section set is fixed); a core seat (null arm delta — nothing to buy).
- **Status:** implemented · _2026-08-01_
- **Load-bearing:** types a third probe kind — a fixture-borne rule graded on the variant axis, where [[D-013]]'s cut rule does not apply. [[D-029]] reuses its routing.
- **Revisit if:** a model ignores the phase line, the variant delta stops flipping, or `harden` goes unused.

### D-029: koan-jazz — a quarantined branch buys the right to suspend the ladder
- **Decision:** A lifecycle skill, `koan-jazz`: a bounded improvisation session on a `jazz/<topic>` branch where the ladder, the trail, and `D-nnn` minting are **off**, closing with a mandatory disposition. Safety carve-outs and the Nevers stay on. The artifact is a **finding**, not code; code worth keeping re-enters through the ladder and never merges from the jam. Finding routing reuses [[D-028]]'s phase.
- **Why:** [[D-028]] fixed permanence but holds that explore "defers permanence, never discipline" — so nothing licensed building the speculative thing. Isolation makes suspension safe rather than reckless; the mandatory return is the load-bearing half.
- **Alternatives rejected:** a fourth `Phase` value (phase is project-level and persistent); a prose-only skill that tells you to branch (drops the precondition); a `koan:core` seat (core is what jazz suspends).
- **Status:** implemented · _2026-08-01_ — free channel, zero core tokens.
- **Revisit if:** jams routinely close with "code worth keeping" (the specs were vague, not the ladder); jam branches accumulate unclosed; or the suspension leaks into normal sessions.

### D-030: A core seat is lost when the delta goes null across the TIER
- **Decision:** Amends [[D-013]]. A `koan:core` rule is demoted only when its delta gate goes null across the **supported tier** ([[D-023]]), replicated 2-of-3 per [[D-022]] on each model cited — not when it goes null on the newest model alone. Applied: **trail keeps its core seat** despite baseline writing the D-entry 3/3 on opus-5, because it still flips on fable-5 and sonnet-5.
- **Why:** Capability rises monotonically, so delta gates go null **from the top down**. A mechanical [[D-013]] reading strips rules in the order the best models outgrow them, converging on a kit that only helps the models whose users need koan least. Costs are asymmetric: a redundant rule wastes a few hundred chars; a missing one loses a session's thread. Same run showed onecheck flipping clean where demotion was predicted, and greenfield flipping after a month of nulls — **a null dates**.
- **Alternatives rejected:** mechanical [[D-013]] (demotes trail today, every other rule in turn); per-tier core builds ([[D-002]] exists to prevent N synced artifacts); pinning the gate to one model (hides the split).
- **Status:** implemented · _2026-08-01_ — free channel, no token cost. **Evidence refreshed 2026-08-06:** trail flips 0/3 opus-5, 1/3 fable-5, 2/3 sonnet-5. Sonnet-5 alone meets [[D-022]]'s bar, so the null isn't tier-wide and **the seat holds** — by one run, on one model. The 0→1→2 trend as capability falls is exactly the top-down decay predicted here. Sonnet-5's miss was *koan's*, not a baseline catch-up: the arm wrote the trail line and self-check, then routed the choice to a `koan:` marker instead of the log.
- **Load-bearing:** every future demotion argument routes through this; it is why converged probes were not cut on their nulls alone (see [[D-036]] for what finally cut one, and why that reasoning differs).
- **Revisit if:** the supported tier narrows to one model; a rule goes null tier-wide and demoting it measurably costs nothing; or sonnet-5 drops below 2-of-3 on the next refresh — trail is one run from demotion and should be re-measured before the next core addition, not after.

### D-031: Drift of installed copies is caught on the push channel
- **Decision:** Staleness of *installed* koan copies is detected by `push.mjs --check` — dry-run stamp compare, writes nothing, exit 1 on drift. Not a Stage 0 check. `--check` measures only surfaces the destination already adopted.
- **Why:** The stamp guard already detected this; what was missing was a way to *ask* it without writing. So the fix is an invocation, not a second detector. selfcheck is the tempting home and the wrong one — it is offline and deterministic by contract, while `~/.claude/skills` is machine state. Drift matters where koan is *used*, not where it is built.
- **Alternatives rejected:** a selfcheck check (machine-dependent gate); a drift-audit subsystem (a second detector for a solved detection problem); a `koan-wrap` step (permanent tokens for a rare event).
- **Status:** implemented · _2026-08-01_
- **Load-bearing:** third arrival of the deferred SessionStart hook ([[D-020]], [[D-025]]), closed by [[D-035]].
- **Revisit if:** `--check` goes unrun for months, or a non-Claude target grows a hook mechanism.

### D-033: The auto-loaded log splits by domain, not by settledness
- **Decision:** A third home for decisions: a **domain decision set**, `docs/DECISIONS-<domain>.md`, holding *live* entries that only bind work inside one area. Never `@`-imported; IDs listed in the main log's *Domain decision sets*. First set: `benchmarks`. The line is **how a thing is built** (moves) vs **what ships** (stays).
- **Why:** The ceiling was hit by entries triage found *unarchivable* three sittings running — growth on merit. Archiving keys on settledness, which no longer discriminated; a third of the budget was methodology every non-benchmark session paid for and never used. Also fixed the rule that made archiving impossible: "cited by ≥2" counted *fixture* mentions.
- **Alternatives rejected:** raise the ceiling (the ratchet the budget exists to stop); archive harder (nothing qualifies — that *is* the finding); per-domain CLAUDE.md imports (re-imposes the tax it removes).
- **Status:** implemented · _2026-08-02_ — **second set 2026-08-06**: `method`, for how the kit is priced and checked. Compression alone stopped working: it bought 6.4k and four sittings' decisions spent it in one day, because the growth is *methodology*, which was 44% of the log. The splitting line is sharper than "moves vs stays" — **a consumer never experiences anything decided in a set** — which is why the promotion/demotion rules stayed in the main log even though they are also methodology.
- **Load-bearing:** every "the log is full" answer routes through this before touching the ceiling — though [[D-036]] found a cheaper answer first: compress the entries.
- **Revisit if:** a set drifts out of mind (nothing proves a session touching the tooling opens `method`); a consumer's split loses a decision a session needed; or a third set is wanted — at which point ask whether the main log is the wrong shape rather than adding another file.

### D-034: A build artifact is verified where it lands, not where it is authored
- **Decision:** Stage 0 gains a **bundle check**: every `.mjs` a skill dir ships must `import()` cleanly from its installed location. Skill dirs ship every engine they import.
- **Why:** Observed failure reported from a deployed repo. `lint.mjs` imports `debt.mjs`, but the target copied `debt.mjs` into `koan-debt/` only, so `/koan-lint` was dead on arrival for **every** consumer while every gate stayed green: selfcheck dogfooded `lint()` via a `src/` import, and the canary pins rule phrases, not loadability. Generally — a check that runs against `src/` cannot certify `dist/`, because the source tree resolves references the install layout breaks.
- **Alternatives rejected:** a static scan for relative-import existence (re-implements the resolver; the loader is already the oracle); a shared engine dir the skills import across (an install is one dir per skill by contract).
- **Status:** implemented · _2026-08-04_ — the hand-listed bundle manifest it introduced was replaced by a directory hash in [[D-036]], which removes the omission this entry describes.
- **Load-bearing:** any "the source tree proves it works" argument routes here first.
- **Revisit if:** a shipped script grows an import legitimately absent at check time, or a target appears whose artifacts aren't loadable modules.

### D-035: The staleness hook is a trigger for the existing detector
- **Decision:** A `SessionStart` hook runs `lint()` when a session opens — **no new detection**. Ships only on the `plugin` target (a `.claude-plugin/plugin.json` folder, default `~/.claude/skills/koan/`). Contract: **check and remind, never write, never block, exit 0 on every path including its own failures**, plus **silence when clean** — a healthy koan repo and any non-koan project produce no output at all, capped at 800 chars.
- **Why:** Third arrival of the same deferral and the only one carrying observed failures: [[D-020]] wanted it with no mechanism, [[D-025]] re-scoped it once plugin `hooks.json` proved the plumbing, [[D-031]] built the detector and recorded that nothing asks it. The remaining gap was a trigger, not a detector. Silence when clean is what makes an always-on hook affordable: `additionalContext` costs tokens in *every* project on the box.
- **Alternatives rejected:** editing the user's `settings.json` (koan would own a config file it didn't write); a marketplace plugin (infrastructure for one consumer); a hook that writes or blocks (a session opener that fails must never stop work).
- **Status:** implemented · _2026-08-04_
- **Load-bearing:** closes the [[D-020]]/[[D-025]]/[[D-031]] chain; any argument that koan should touch a consumer's config routes through the never-write contract set here.
- **Revisit if:** the hook speaks on a healthy repo, a non-Claude target grows a hook mechanism, or plugin loading from `~/.claude/skills` stops working.

### D-038: A shortcut is accepted by citing the decision that took it
- **Decision:** A `koan:` note naming a `D-nnn` is **dispositioned**: `--debt` still lists it (it is real debt) but the harden gate stops counting it. koan itself moves to **Phase: harden**.
- **Why:** Check 12 said "fix or accept each one" and supported no way to accept, so the only route past the gate was deleting the marker — which throws away the note and its reasoning. A citation is not a new mechanism; it is the trail rule already in core, and it puts the *why* and the revisit trigger in the log where they belong rather than in a comment. The two shortcuts that blocked koan's own transition resolved cleanly under it: the continuity fixture's DB stub cites D-001 and is accepted; `build.mjs`'s "add an adapter" note was never debt at all — two targets is the intended set, since Cursor, Copilot and Codex read AGENTS.md natively, so an adapter would generate a file nothing reads.
- **Alternatives rejected:** excluding fixture/test directories from the harvester (unknowable in general, and over-fitting the engine to this repo — check 8's mistake); a separate accept-list file (config as machinery, and a second home for a fact the log already holds).
- **Status:** implemented · _2026-08-06_ — pinned both ways in `lint-fixtures.mjs` under [[D-037]], which immediately caught the message string harvesting *itself* (the quoted-span stripper can't see through escaped backticks in a template literal).
- **Revisit if:** citations get added to silence the gate rather than to record a decision — the tell is a `D-nnn` in a note whose entry says nothing about that shortcut.

### D-039: koan is insurance for weak models and large projects; stop measuring the quality axis
- **Decision:** Close the open Stage 2 question. koan's claim is **continuity and restraint under pressure** — weaker models, cold resumes, large projects. No scale fixture is built, and the frontier-model/small-fixture A/B stops being run for quality delta.
- **Why:** Stage 2's A/B has converged on "no measurable difference" every time, and the honest reading is that the instrument is at its limit, not that the kit is worthless: a 2k-char fixture cannot manifest a problem that only appears at 200 files. Building a scale fixture to chase it would be the largest instrument in the repo, measuring the axis koan claims *least* — three sittings after [[D-036]] cut the last instrument that decided nothing. [[D-023]] already says koan is a frontier-tier kit; this says what it is *for* on that tier, which is not raw answer quality.
- **Alternatives rejected:** build the scale fixture (the biggest instrument yet, for the weakest claim); keep the question open (four sittings of carrying it is the decision).
- **Status:** implemented · _2026-08-06_ — behavior probes ([[D-013]]) and cold-resume continuity are unaffected and still run; only the quality-delta A/B is retired.
- **Revisit if:** someone reports koan changing (or failing to change) outcomes on a genuinely large codebase — that is field evidence a fixture was never going to produce.

### D-040: Safety carve-outs move into core; Never, Boundaries and ultra are cut
- **Decision:** The safety carve-out becomes a core Rules bullet ("Never drop a safety carve-out to shave lines: input validation at trust boundaries, …"), so AGENTS.md carries it. Deleted: the **Never** section (six bullets, each restating a rule already in the file), the **Boundaries** section (its one unique line folded into Persistence), and the `ultra` intensity with the whole Intensity axis + `argument-hint`.
- **Why:** An outside-view review found the widest-shipped artifact had the pressure without the guard: the canary classed "input validation at trust boundaries" as full-skill-only, so AGENTS.md consumers got the build-less ladder with no safety carve-out — by [[D-013]] the archetypal *guard* rule, which the delta gate deliberately does not price. The cut sections were pure reinforcement AGENTS.md already lived without; `ultra` had no gate at all (the [[D-036]] delegation precedent).
- **Alternatives rejected:** keeping Never as deliberate repetition (three homes for one prohibition is the fault koan lints for); gating the safety promotion on a Stage 1 run (guard probes don't flip on delta — the run decides nothing; human sign-off per Checks instead, and no run was spent).
- **Status:** implemented · _2026-08-07_ — AGENTS 4929 → 5166 chars (ceiling 5200 → 5400, deliberate growth); full skill 7422 → 6402 (ceiling ratcheted 7800 → 6700); canary phrases re-homed to CORE. **Checked same day** by one fable-5 Stage 1 run (`results/2026-08-07-stage1-fable5-post-d040.md`): every probed rule intact after the cuts; trail's null there extends [[D-030]]'s series, not this decision. The promoted safety rule itself remains probe-less — canary-verified presence only.
- **Revisit if:** a user asks for a stricter mode (ultra returns *with* a gate), or a Stage 1 run shows a regression traceable to the cuts.

### D-041: koan is public on GitHub; Claude Code distribution is the marketplace
- **Decision:** The repo goes public at `un5table/koan` with a **fresh single-commit history**; the full 68-commit history lives on in the private archive repo (`un5table/koan-archive`) and locally on `archive/full-history`. The working tree ships after a light scrub (no local paths, no employer context, no private-remote lines; field-repo short-names stay as labels; machine-specific pointers live in gitignored `docs/FIELD.local.md`). Claude Code consumers install via a repo-root `.claude-plugin/marketplace.json` whose plugin `source` is `./dist/claude`; the marketplace.json formerly generated *inside* `dist/claude` is removed — one marketplace, one home, and a user can register only one marketplace per name.
- **Why:** The goal is sharing with coworkers, and `marketplace add` + `plugin install` is the only path needing no clone and no Node. Fresh history because the pre-publish sweep found the scrub class recoverable from old commits (employer context and local paths in early `ingest/LESSONS.md` versions) — a new root removes the entire class instead of filtering it, and the discipline's demonstration survives in the docs themselves, not the commit list.
- **Alternatives rejected:** npm publish ([[D-007]] deferred it; still nothing load-bearing); publishing full history (old blobs carry what the tree scrubbed); `git filter-repo` (rewrites 68 commits to buy what a fresh root gets for free, and a missed pattern still leaks).
- **Status:** implemented · _2026-08-07_ — supersedes [[D-035]]'s "a marketplace plugin (infrastructure for one consumer)" rejection on that one point: there are consumers now. The hook ships unchanged inside the plugin.
- **Revisit if:** the marketplace path fails a real coworker install, or npm distribution becomes load-bearing.

## Domain decision sets
Live decisions scoped to one domain — full entries out of context, IDs permanent.
<!-- Every D-nnn below is read as a set index entry (check 4) — keep prose here
     ID-free, or a citation becomes a phantom set member. -->
The line: **a consumer never experiences anything decided in a set.** The rules
governing what earns a place in the shipped kit — the probe types, the 2-of-3
promotion bar, the tier stance, the demotion rule — deliberately stay in this
log: a session arguing whether a rule earns its seat needs them in context, and
moving them would buy budget by hiding the rules that stop bad additions.
- **benchmarks** (`docs/DECISIONS-benchmarks.md`) — D-006, D-012, D-014, D-015, D-017, D-018, D-021, D-032 —
  how an instrument is built: the staged architecture, arm isolation, act-grading,
  write/git channels, the model axis, per-probe arm pairs, and what a null buys.
- **method** (`docs/DECISIONS-method.md`) — D-036, D-037 — how the kit itself is
  priced and checked: the ablation precedent (koan's own tooling is judged by the
  build-less ladder) and the rule that a check arrives pinned against shapes this
  repo doesn't have.

## Archived decisions index
<!-- one stub per archived decision: - **D-0NN** — <title> — <status> · archived -->
- **D-003** — First targets are Claude Code + AGENTS.md — implemented · archived
- **D-004** — One coherent persona — the radar operator — superseded by D-010 · archived
- **D-005** — Core lens + lifecycle family — implemented · archived
- **D-008** — Name is "radar"; persona pivoted from "zen craftsperson" — superseded by D-010 · archived
- **D-009** — First ingest triage — adopt behavior gates + the debt ledger, defer the rest — implemented · archived
- **D-010** — Renamed to "koan"; persona is the zen craftsperson — implemented · archived
- **D-011** — Stage 2 scoring is two-layer — strict floor + calibrated LLM judge — implemented · archived
- **D-016** — Outcome scope tasks run on an open-ended workspace channel — implemented · archived (revisit-if fired; resolved by D-017)
- **D-024** — No koan-compact skill — checkpoint before /compact, on free channels — implemented · archived
- **D-026** — superpowers ingest — form-follows-failure; descriptions carry triggers — implemented · archived
