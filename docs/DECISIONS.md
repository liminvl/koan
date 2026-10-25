# Decisions

> Auto-loaded every session — keep it lean (≤ ~30k chars). Choice + why only.
> IDs are permanent — never renumber. An entry is five short fields, not an
> essay: retain rationale and link supporting research or design detail.

### D-001: koan unifies build-less and lose-less in one lens
- **Decision:** One skill governs both minimal-code discipline (ponytail) and session-continuity discipline (handoff), as peer practices.
- **Why:** Both failure modes are situational-awareness problems; one persona covers both and they reinforce each other.
- **Alternatives rejected:** coding-discipline only; continuity only; a meta skill-author.
- **Status:** accepted · _2026-06-30_
- **Load-bearing:** shapes the whole kit and every other decision.
- **Revisit if:** the two halves prove to dilute each other in benchmarks.

### D-002: Generate native bundles from one source
- **Decision:** `src/` generates Claude and Codex skill bundles plus the compact AGENTS core. Install `claude`, `codex`, or `both`, in project or user scope. Codex adapts invocation, entrypoint and import syntax; resources share one builder.
- **Why:** AGENTS alone lacks native lifecycle discovery. Shared generation prevents manual copy drift.
- **Alternatives rejected:** hand-maintained variants; AGENTS-only Codex support.
- **Status:** implemented · _2026-10-23_
- **Revisit if:** a host requires another integration; automatic hooks currently ship only in the Claude plugin.

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

### D-022: A core seat needs a replicated flip — 2 of 3 runs
- **Decision:** Promoting a rule into `koan:core` requires its [[D-013]] delta gate flipping in **≥2 of 3 runs** on the model the promotion cites. Routine probe sampling stays n=1. Existing seats keep their n=1 evidence.
- **Why:** LLM runs are stochastic; one flip can be noise, and a core seat is a permanent token spend in every consumer's context. Bounding replication to promotion time keeps cost proportional to stakes.
- **Alternatives rejected:** replicating every probe run (spend with no decision riding on it); n=1 promotion (noise buys permanent tokens); 5-run majorities (cost outgrows signal).
- **Status:** accepted · _2026-07-10_
- **Load-bearing:** the bar [[D-030]] applies per model when demoting.
- **Revisit if:** 2-of-3 passes a rule that later demotes repeatedly.

### D-023: koan is a frontier-model kit; core is not reworded for weaker models
- **Decision:** Target frontier models, but qualify evidence by actual model, harness and skill revision. Tier membership is a compatibility hypothesis; new releases need evaluation rather than inheriting proof.
- **Why:** A product tier cannot establish adherence for an untested model.
- **Alternatives rejected:** inherited tier evidence; expanding core prose to chase weaker models.
- **Status:** accepted · _2026-10-23_ — revises the evidence-inheritance policy; historical results remain dated observations.
- **Load-bearing:** tier groups in [[D-030]] are a sampling scope, not a substitute for model-qualified evidence.
- **Revisit if:** repeated cross-model results establish a stronger generalization.

### D-025: Descriptions are a checked routing surface
- **Decision:** A **trigger-surface check** (`benchmarks/triggers.mjs` + `triggers.json`): pinned realistic prompts must rank their skill strictly first under tf-idf over the shipped descriptions, plus a ≥75% collision ceiling. Selfcheck check 4.
- **Why:** Descriptions are koan's routing surface but nothing checked they still route — a description reword tripped no alarm, since the canary pins rule phrases, not routing. Free channel per [[D-019]], zero skill tokens.
- **Alternatives rejected:** a whole eval framework (bigger than what it measures); anti-rationalization tables (permanent token spend).
- **Status:** implemented · _2026-07-11_ — prompt set re-pinned whenever the skill list changes ([[D-029]], [[D-036]]).
- **Revisit if:** a pinned prompt false-fails a legitimate description improvement (loosen rank-1 to top-2 before deleting prompts).

### D-027: HANDOFF never restates a fact git owns
- **Decision:** `Current state` carries no HEAD hash, branch tip, clean/uncommitted claim, or review-queue status ("awaiting review"); environment state is a **dated verification** ("staging verified 2026-06-30 on `a1b2c3d`"), never present tense. Hashes appear only in `Changes this session`, as evidence. Say what the work IS and NEEDS.
- **Why:** Observed: a consuming repo accumulated three "correct the HANDOFF lines the push falsified" commits. HANDOFF sits *inside* the repo it describes, so committing it invalidates the git facts it just recorded; those facts have a home `koan-readback` checks, and present-tense claims rot silently because nothing local can falsify them.
- **Alternatives rejected:** ordering tricks (impossible for the commit's own hash); a bare-hex lint rule (a hash is legitimate in Changes, so the check can't see intent); one correction commit per session (normalizes a falsified doc).
- **Status:** implemented · _2026-07-31_ — `koan-wrap` §2/§5, the HANDOFF template, lint check 11 (section-scoped per [[D-036]]); review-status clause added 2026-08-06 as prose only ([[D-019]]).
- **Revisit if:** a Current-state hash check finds a discriminator that isn't wording. **Tried 2026-08-06, rejected:** built, pinned, run on 14 repos — 13 hits, 5 live claims, 8 durable references ("tagged v1.0.0 on `4f92c21`"); `git cat-file` and a dated-claim exemption couldn't separate them, only prose wording could, the over-fitting that retired check 8.

### D-028: Phase ships free-channel; a null arm delta is its success condition
- **Decision:** The project-phase axis (`**Phase:** explore|build|harden`) on **free channels only** — both templates + `lint.mjs` (checks 6/9 gated in explore, 12 added in harden) — no `koan:core` seat. Its gate is the `phase` probe's **fixture-variant** axis, not the arms axis.
- **Why:** Variant delta flipped **3 of 3 on claude-opus-5** — same reasoning, two homes. The arm delta is **null**: baseline flips as hard as koan. That is not [[D-013]]'s "baseline passes ⇒ cut" signal — that heuristic prices *skill tokens* and this rule spends none. A null arm delta proves the free channel suffices ([[D-019]]).
- **Alternatives rejected:** folding phase into the intensity levels (orthogonal); a `## Bets` section (wrap's section set is fixed); a core seat (null arm delta — nothing to buy).
- **Status:** implemented · _2026-08-01_
- **Load-bearing:** types a third probe kind — a fixture-borne rule graded on the variant axis, where [[D-013]]'s cut rule does not apply. [[D-029]] reuses its routing.
- **Revisit if:** a model ignores the phase line, the variant delta stops flipping, or `harden` goes unused.

### D-030: A core seat is lost when the delta goes null across the TIER
- **Decision:** Amends [[D-013]]. A `koan:core` rule is demoted only when its delta gate goes null across the **supported tier** ([[D-023]]), replicated 2-of-3 per [[D-022]] on each model cited — never on the newest model alone.
- **Why:** Capability rises monotonically, so delta gates go null **from the top down**; a mechanical [[D-013]] reading strips rules in the order the best models outgrow them, converging on a kit that helps only the users who need koan least. Costs are asymmetric: a redundant rule wastes a few hundred chars; a missing one loses a session's thread. Nulls also date: greenfield flipped after a month of nulls.
- **Alternatives rejected:** mechanical [[D-013]] (demotes trail today, every other rule in turn); per-tier core builds ([[D-002]] exists to prevent N synced artifacts); pinning the gate to one model (hides the split).
- **Status:** implemented · _2026-08-01_ — free channel. Evidence 2026-08-06: trail flips 0/3 opus-5, 1/3 fable-5, 2/3 sonnet-5; sonnet-5 alone meets [[D-022]]'s bar, so **the seat holds by one run on one model**, and the 0→1→2 trend is the predicted decay. [[D-049]] records the same decay seen from outside koan.
- **Load-bearing:** every demotion argument routes through this; [[D-036]] records what finally cut an ungated item and why that reasoning differs.
- **Revisit if:** the supported tier narrows to one model; a rule goes null tier-wide and demoting it measurably costs nothing; or sonnet-5 drops below 2-of-3 on the next refresh — re-measure trail before the next core addition, not after.

### D-033: The active log splits by task scope
- **Decision:** Live choices binding one area may move to `docs/DECISIONS-<domain>.md`, never auto-imported, with permanent IDs indexed in main and a constitution read trigger. Koan's sets are benchmarks and method; project-wide constraints and promotion/demotion rules stay in main. The shipped split applies to any work area, including a film ([[D-048]]).
- **Why:** Three rounds found nothing archivable; methodology was 44% of the log. Compression saved 6.4k, then four sittings refilled it. Most sessions did not need that methodology. Archiving by settledness could not solve active but task-specific growth. Fixture mentions also ceased counting as load-bearing citations.
- **Alternatives rejected:** larger ceiling; archiving live choices; per-domain imports that restore the context tax. [[D-036]] later established compression before splitting.
- **Status:** implemented · _2026-08-02_; method set added _2026-08-06_.
- **Load-bearing:** separates active task-specific choices from historical archives without hiding project-wide rules.
- **Revisit if:** sessions miss a needed set despite its trigger, or further sets indicate the main log's shape needs reconsideration.

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

### D-039: koan is insurance for weak models and large projects; stop measuring the quality axis
- **Decision:** Retire the small-fixture quality-delta A/B and the proposed scale fixture. Continue behavior probes and cold-resume continuity; small executable correctness guards remain appropriate.
- **Why:** The old quality instrument repeatedly converged and decided nothing. That does not establish either benefit or absence of harm in larger tasks.
- **Alternatives rejected:** a large scale benchmark; continuing an uninformative A/B; treating null results as universal proof.
- **Status:** implemented · _2026-08-06_ — clarified _2026-10-23_: the duration correctness guard supports revised test guidance without restoring the retired outcome arm.
- **Revisit if:** field evidence identifies an outcome difference requiring a targeted fixture.

### D-042: Decision routing stays audience-based; a split set ships with a read-trigger
- **Decision:** Topic-first routing of the log — per-topic sets (design/infra/security) loaded when a session infers the topic — is rejected as the primary mechanism. The main log stays auto-loaded for cross-cutting decisions; a set is split only for entries that bind one area ([[D-033]]). A split now also ships its trigger: `koan-wrap` §4 adds a constitution read-trigger line (`Touching <area>? Read docs/DECISIONS-<domain>.md first.`), checked by §5's parity item.
- **Why:** An on-demand file helps only if the session opens it, and koan's claim ([[D-039]]) is insurance for exactly the sessions that won't infer to — weak models, cold resumes. [[D-030]]'s cost asymmetry applies: a redundant in-context entry wastes chars; a missed one silently re-litigates a settled choice. Topic taxonomies also fracture cross-cutting decisions (one choice is design+infra+security at once), and per-topic budgets dissolve the ceiling pressure that forces distillation. The real gap was the trigger: this repo's CLAUDE.md hand-wrote "Touching `benchmarks/`? Read …" because the set index records *that* a set exists, not *when* to open it — and the shipped kit never taught that line.
- **Alternatives rejected:** topic-first sets (above); a lint check that a set's filename appears in the constitution (fires on healthy repos that route via the index — [[D-037]]'s noise class; an observed drifted-out-of-mind set buys it); teaching sets in the `koan-init` templates (a greenfield repo is months from its first split; wrap §4 is the point of temptation).
- **Status:** implemented · _2026-08-08_
- **Revisit if:** a field repo shows a set no session opened despite the trigger line, or [[D-033]]'s "a set drifts out of mind" clause fires anyway.

### D-044: Shape is one line; proof lives in Checks
- **Decision:** Infer a free-text Shape and actual proof before init; Checks may be commands, procedures or human review. Constitution budget is 20k; warn with its largest section. External state uses on-demand pointers; identities recorded, current values queried, evidence dated. Config/IaC/docs shortcuts are harvested too. Supporting-doc routing is extended by [[D-048]].
- **Why:** The September 2026 survey found six different fourth-file inventions and five constitutions over 20k, all inflated by runbooks or notebooks; code-shaped constitutions were under 15.2k. Git alone did not describe the work.
- **Alternatives rejected:** mandatory shape enums; a universal EXTERNAL.md; taxonomy in core; required Shape lint that flags existing repos.
- **Status:** implemented · _2026-09-23_ — shape probe, continuity question and lint fixtures; model evidence remains limited (see HANDOFF).
- **Revisit if:** shape/proof inference fails, live-state mirrors persist, or the budget flags healthy constitutions.

### D-046: Compaction nudge, dead ends and the loaded chain
- **Decision:** SessionStart on `compact` names uncommitted files newer than HANDOFF. In progress carries failed approaches and reasons. Lint sums the constitution and direct imports against the combined 50k budgets. These came from ECC/context-mode; nothing else survived triage.
- **Why:** [[D-024]] deferred a compaction nudge until [[D-035]] supplied a plugin hook; failed approaches lacked a home before a decision; individual budgets missed oversized import chains.
- **Alternatives rejected:** another snapshot store; per-edit context-pressure hooks; extra HANDOFF sections; another threshold to maintain.
- **Status:** implemented · _2026-10-04_ — lint and hook fixtures; readback budget rose 2050 → 2150 for dead ends. Real compaction observation remains pending in HANDOFF.
- **Revisit if:** intentional dirty work causes noise, dead ends become non-decisions in the log, or the chain warning names the active log itself (compress that log first).

### D-047: Refactor toward sufficient checks and portable continuity
- **Decision:** Prefer maintainable simplicity and sufficient regression coverage over line/test counts. Readback blocks only on material questions or requested confirmation. One session owns shared continuity docs; checkpoints replace superseded state within budget. Non-importing hosts get explicit read instructions.
- **Why:** Avoid confirmation loops and host assumptions. Verify installed content and actual artifacts, not stamps or prose claims.
- **Alternatives rejected:** new workflow infrastructure; higher skill budgets; treating an offline pass as model evidence.
- **Status:** implemented · _2026-10-23_
- **Revisit if:** field use or replicated probes show lost coverage, missed reads or checkpoint evidence loss.

### D-048: Route supporting knowledge by purpose; measure selected task context
- **Decision:** Init/wrap share on-demand routing for procedures, reference, evidence and briefs. Keep decisions intelligible alone. Lint's opt-in `--context` estimates core + selected whole files against the existing 50k threshold. Consumer limits stay unchanged; artifact ceilings ratchet to size + ~5%.
- **Why:** Hostinger's handoff reached 14,997 chars; ComfyUI's 87,351-char engine reference exposed growth hidden behind broad read triggers. Both need selective retrieval.
- **Alternatives rejected:** guessed prose-trigger parsing; universal reference caps; rationale only in commits; empty document taxonomies.
- **Status:** implemented · _2026-10-23_ — lint/install checks; routing behavior needs scenario evidence. Lint explains task-context usage; references have separate budgets. Roundtable fixes add explicit dual-host bridges, evidence without commits, and durable-method routing before snapshot (creative exercise exposed a missed move).
- **Revisit if:** scenario reviews lose evidence, create unnecessary files, or task estimates mislead; threshold is a heuristic, not measured model capacity.

### D-049: Routing is measured on the shipped path; the core stops growing until trail is re-measured
- **Decision:** A `claude plugin eval` suite (`benchmarks/evals/`, mirrored into `dist/claude/evals/`) is the instrument for skill **discovery**: ten cases run against the plugin as installed, with a no-plugin baseline arm. Stage 1 keeps measuring rules under an always-on system prompt; this suite measures whether a skill fires at all. No core addition until trail is re-measured on sonnet-5 ([[D-030]]). `push.mjs` requires `--target`. The CLAUDE.md template carries a compaction-preservation line and names tool memory as per-machine, these docs as the shared channel.
- **Why:** The 2026-10-25 review found every Stage 1 number assumes the core is in the system prompt, while a native install relies on the model invoking the skill from an 807-char description — the condition no instrument measured. A three-prompt run on fable-5-1 (n=1) routed all three correctly; the first-party eval tool makes that repeatable. External evidence the same day: controlled studies find context files move correctness ~0 at ~20% extra cost, and harness vendors are removing anti-gold-plating lines generation over generation — [[D-030]]'s top-down decay seen from outside. Both vendors still say required rules belong in checked-in files and no host writes a handoff, so lose-less keeps its ground while build-less stops growing.
- **Alternatives rejected:** automatic capture hooks (the field's answer; koan's differentiator is human-authored, PR-reviewable memory — rung one); cutting core lines now on opus-5 nulls (barred by [[D-030]]); Claude-only path-scoped rules for domain sets ([[D-042]] holds for multi-host).
- **Status:** implemented · _2026-10-25_ — suite loads; first run recorded in `benchmarks/results/2026-10-25-discovery-and-research.md`.
- **Revisit if:** a discovery case fails on a cited model (then the description, not the rule, is the fix — [[D-025]]), or trail's sonnet-5 refresh demotes it.

## Domain decision sets
Live decisions scoped to one domain — full entries out of context, IDs permanent.
<!-- Every D-nnn below is read as a set index entry (check 4) — keep prose here
     ID-free, or a citation becomes a phantom set member. -->
The line: **a consumer never experiences anything decided in a set.** The rules
governing what earns a place in the shipped kit — the probe types, the 2-of-3
promotion bar, the tier stance, the demotion rule — deliberately stay in this
log: a session arguing whether a rule earns its seat needs them in context, and
moving them would buy budget by hiding the rules that stop bad additions.
- **benchmarks** (`docs/DECISIONS-benchmarks.md`) — D-006, D-012, D-014, D-015, D-017, D-018, D-021, D-032, D-045 —
  how an instrument is built: the staged architecture, arm isolation, act-grading,
  write/git channels, the model axis, per-probe arm pairs and their bundles, and what a null buys.
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
- **D-020** — handoff-kit ingest — sign-off line, greenfield interview, fit-test — implemented · archived
- **D-024** — No koan-compact skill — checkpoint before /compact, on free channels — implemented · archived
- **D-026** — superpowers ingest — form-follows-failure; descriptions carry triggers — implemented · archived
- **D-029** — koan-jazz — a quarantined branch buys the right to suspend the ladder — implemented · archived
- **D-031** — Drift of installed copies is caught on the push channel — implemented · archived
- **D-038** — A shortcut is accepted by citing the decision that took it — implemented · archived
- **D-040** — Safety carve-outs move into core; Never, Boundaries and ultra are cut — implemented · archived
- **D-041** — koan is public on GitHub; Claude Code distribution is the marketplace — implemented · archived
- **D-043** — Budgets price the entry too, not just the file — implemented · archived
