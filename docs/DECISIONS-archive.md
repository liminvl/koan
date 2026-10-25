# Decisions — archive

> Full text of settled/implemented/superseded decisions. NOT auto-loaded.
> Moved here verbatim from DECISIONS.md; reasoning is never trimmed. Each entry
> keeps a one-line stub in DECISIONS.md's "Archived decisions index".

### D-003: First targets are Claude Code + AGENTS.md
- **Decision:** Ship the canonical pair first; add Cursor/Windsurf/Copilot/etc. as adapters later.
- **Why:** Prove the pipeline on the two highest-value targets before fanning out. Lazy/incremental.
- **Status:** implemented · _2026-06-30_
- **Revisit if:** a specific environment is needed sooner.

### D-004: One coherent persona — the radar operator
- **Decision:** A single calm, vigilant "radar operator" lens, not two named sub-personas and not pure procedure.
- **Why:** A persona gives judgment calls something to collapse to and produces sticky lines that survive context compression; one identity keeps the two scans coherent.
- **Alternatives rejected:** two named lenses; no persona.
- **Status:** accepted · _2026-06-30_
- **Revisit if:** users find the metaphor gets in the way of the rules. See D-008.

### D-008: Name is "radar"; persona pivoted from "zen craftsperson"
- **Decision:** The kit is named radar; the persona is a radar operator (situational awareness), replacing the earlier "zen craftsperson" tied to the dropped name "zenez".
- **Why:** "radar" fits the unified concept better — catch over-building on radar, keep the next session on radar, and the benchmark is the radar that detects self-regression.
- **Status:** superseded by D-010 · _2026-07-02_
- **Revisit if:** the human prefers a different persona (flagged as an open question).

### D-010: Renamed to "koan"; persona is the zen craftsperson
- **Decision:** The kit is named **koan**; the persona returns to the zen craftsperson, superseding D-008's radar operator. Everything renamed in one sweep: `koan-*` skills, `koan:core` build markers, the `koan:` comment convention, plugin/package name. "North stars" → "The four koans"; "scans" → "practices". Rules stay blunt — zen voice lives in the framing, not the prohibitions.
- **Why:** A koan transmits maximum understanding in minimum words — one image that fuses the kit's two goals: full cold-resume understanding (lose less) at minimal token cost (build less). Resolves D-008's open question: the human confirmed the zen persona.
- **Alternatives rejected:** keep "radar" (vigilance covers only half the concept; persona never confirmed by the human).
- **Status:** implemented · _2026-07-02_
- **Revisit if:** behavior gates show the zen framing softening rule adherence.

### D-005: Core lens + lifecycle family
- **Decision:** An always-on `radar` lens plus `radar-init/wrap/readback/lint`, functionally named.
- **Why:** Most faithful to combining both sources; discoverable names beat clever ones (radar's own rule).
- **Alternatives rejected:** one monolithic skill; core lens only.
- **Status:** implemented · _2026-06-30_
- **Revisit if:** the lifecycle skills prove better merged.

### D-009: First ingest triage — adopt behavior gates + radar-debt, defer the rest
- **Decision:** From the ponytail/handoff distillation, adopt **behavior gates** (Stage 1) and **radar-debt** now; defer radar-review/audit, hook-based injection, and drift-audit ownership.
- **Why:** Behavior gates sharpen the anti-bloat thesis (a rule baseline already passes isn't earning its tokens) and radar-debt is near-free since the `radar:` comment convention already ships. The deferred ones add skills/targets before the core lens is proven — the over-building radar warns against.
- **Alternatives rejected:** adopt everything now (helper sprawl); adopt nothing (waste the ingest).
- **Status:** implemented · _2026-06-30_
- **Revisit if:** the core lens is benchmark-proven and a deferred helper earns its place. See `ingest/LESSONS.md`.

### D-011: Stage 2 scoring is two-layer — strict floor + calibrated LLM judge
- **Decision:** Keep the literal case-insensitive `includes()` scorer as a free deterministic **floor**, and add the `judge.md` LLM judge (0–3 rubric, judges meaning not wording; pinned `claude-sonnet-4-6`). Per question, the judge must rank a synthetic known-good answer above a known-bad one, or its score reports `untrusted` and the floor stands.
- **Why:** The strict misses in the first real run were paraphrase artifacts, and tuning `groundtruth.json` to observed phrasings is overfitting. Per-question calibration keeps a drifting judge from silently corrupting scores.
- **Alternatives rejected:** any-of/regex expects (overfits groundtruth); judge-only (loses the free deterministic floor).
- **Status:** implemented · _2026-07-02_
- **Revisit if:** calibrations start failing routinely, or judge scores diverge from human inspection of the answers.

### D-016: Outcome scope tasks run on an open-ended workspace channel
- **Decision:** A scope-axis outcome task may declare a `workspace`: the arm works **write-enabled in a fixture project cwd** (D-015 mechanics) and the task text is the whole prompt — no "return ONLY a fenced code block" wrapper. The gate imports the **post-run entry module**: the new export must work AND the shipped exports must keep working. Measurements: JS loc added across all files + files created. Post-run workspaces are preserved whole; `--rescore` re-scores them offline.
- **Why:** The pinned one-function contract structurally caps scope creep — renderTemplate/parseCsvLine converged for every arm, so that channel can only ever say "koan doesn't hurt". An editable project restores the surface over-building shows on (helper files, refactor sweeps, option bags), and the regression gate pins the classic over-build failure — the selftest's bad reference is a refactor sweep that breaks a shipped export. First task (slugify, n=1) still converged: a well-specified small feature tempts nobody; the next lever is task *openness*, not size.
- **Alternatives rejected:** meatier one-function contracts (same wrapper, same cap); a separate workspace runner (only prompt/permission/scoring differ — a task field is smaller).
- **Status:** implemented · _2026-07-03_
- **Revisit if:** genuinely open-ended workspace tasks also converge across arms — then the scope axis needs a different instrument, not another task.

---

### D-024: No koan-compact skill — checkpoint before /compact, on free channels
- **Decision:** Mid-session context compaction (`/compact`) gets no dedicated skill. The kit's answer is the existing checkpoint mode of `koan-wrap`, triggered by one ritual-line clause in the CLAUDE.md template: "about to `/compact` → checkpoint first (compaction is lossy; HANDOFF isn't)". A deterministic `PreCompact` checkpoint hook joins D-020's deferred SessionStart hook (same plumbing gap; noted in `ingest/LESSONS.md`).
- **Why:** Compaction is a lose-less event — the compact summary is lossy tool memory, exactly what koan routes to git-tracked docs. But a koan-compact skill would duplicate checkpoint and fail D-020's fit-test; the only missing piece was the trigger, which D-019 routes to a free channel.
- **Alternatives rejected:** a koan-compact skill (duplicates checkpoint — D-009's helper sprawl); a PreCompact hook now (no per-target plumbing — D-020's same deferral).
- **Status:** implemented · _2026-07-10_
- **Revisit if:** we choose to build a claude-plugin target (adopt PreCompact together with SessionStart; same re-scope as D-020's revisit line), or a field ingest shows a session losing the thread at compaction despite the clause.

### D-026: superpowers ingest — form-follows-failure guidance; descriptions carry triggers, not workflow summaries
- **Decision:** From `superpowers` (Prime Radiant's SDLC methodology plugin — second third-party ingest), three free-channel adoptions (full detail in `ingest/LESSONS.md`): (1) a **"Form follows failure"** note in `ingest/distill.md` — match a rule's wording form to its baseline failure (prohibition for skip-under-pressure; positive recipe for wrong-shaped output, where prohibitions backfire; a required slot for a missing element; a conditional for condition-dependent behavior); (2) a **variance-as-signal** line in `benchmarks/README.md` — read D-022 replicates for convergence, not just verdicts; (3) **stripped workflow summaries** from four descriptions (koan, koan-wrap, koan-init, koan-readback) on their tested finding that a summarized workflow becomes a shortcut the agent takes instead of loading the body — trigger phrases kept, koan-lint/koan-debt untouched, gated by `triggers.mjs` (12/12 rank-1).
- **Why:** All three serve the authoring/eval loop for zero shipped tokens (D-019); the strip removes a skip-the-body hazard on koan's own routing surface, verified by the D-025 trigger check.
- **Alternatives rejected:** the SDLC workflow skills, anti-rationalization tables, the always-on invocation router — all fail the fit-test or duplicate koan's rules.
- **Status:** implemented · _2026-07-11_
- **Revisit if:** a stripped description mis-routes in a real harness, or the claude-plugin target is built (superpowers' `docs/porting-to-a-new-harness.md` + its `startup|clear|compact` SessionStart matcher are the reference shape for the D-020/D-024 hooks).

### D-020: handoff-kit ingest — sign-off line, greenfield interview, fit-test
- **Decision:** Adopted three lessons from `handoff-kit` (independent reimplementation, same author): a `human sign-off:` line in the Checks template; a greenfield-interview step in `koan-init` §3a; a fit-test one-liner in `distill.md`'s bar. Deferred a `SessionStart` staleness hook.
- **Why:** handoff-kit distilled the same field deployment as [[D-019]] on the same day and converged on the same lint/routing lessons — cross-validation. Its three new ideas each closed a real gap: Checks over-claimed "done", `koan-init` had no empty-repo path, scope discipline had no quotable test.
- **Alternatives rejected:** adopting the hook then (no shared hook mechanism across targets).
- **Status:** implemented · _2026-07-04_ — the hook deferral closed by [[D-035]].
- **Revisit if:** the fit-test blocks a lesson that should land.

### D-031: Drift of installed copies is caught on the push channel
- **Decision:** Staleness of *installed* koan copies is detected by `push.mjs --check` — dry-run stamp compare, writes nothing, exit 1 on drift. Not a Stage 0 check. `--check` measures only surfaces the destination already adopted.
- **Why:** The stamp guard already detected this; what was missing was a way to *ask* it without writing. So the fix is an invocation, not a second detector. selfcheck is the tempting home and the wrong one — it is offline and deterministic by contract, while `~/.claude/skills` is machine state. Drift matters where koan is *used*, not where it is built.
- **Alternatives rejected:** a selfcheck check (machine-dependent gate); a drift-audit subsystem (a second detector for a solved detection problem); a `koan-wrap` step (permanent tokens for a rare event).
- **Status:** implemented · _2026-08-01_
- **Load-bearing:** third arrival of the deferred SessionStart hook ([[D-020]], [[D-025]]), closed by [[D-035]].
- **Revisit if:** `--check` goes unrun for months, or a non-Claude target grows a hook mechanism.

### D-038: A shortcut is accepted by citing the decision that took it
- **Decision:** A `koan:` note naming a `D-nnn` is **dispositioned**: `--debt` still lists it (it is real debt) but the harden gate stops counting it. koan itself moves to **Phase: harden**.
- **Why:** Check 12 said "fix or accept each one" and supported no way to accept, so the only route past the gate was deleting the marker — which throws away the note and its reasoning. A citation is not a new mechanism; it is the trail rule already in core, and it puts the *why* and the revisit trigger in the log where they belong rather than in a comment. The two shortcuts that blocked koan's own transition resolved cleanly under it: the continuity fixture's DB stub cites D-001 and is accepted; `build.mjs`'s "add an adapter" note was never debt at all — two targets is the intended set, since Cursor, Copilot and Codex read AGENTS.md natively, so an adapter would generate a file nothing reads.
- **Alternatives rejected:** excluding fixture/test directories from the harvester (unknowable in general, and over-fitting the engine to this repo — check 8's mistake); a separate accept-list file (config as machinery, and a second home for a fact the log already holds).
- **Status:** implemented · _2026-08-06_ — pinned both ways in `lint-fixtures.mjs` under [[D-037]], which immediately caught the message string harvesting *itself* (the quoted-span stripper can't see through escaped backticks in a template literal).
- **Revisit if:** citations get added to silence the gate rather than to record a decision — the tell is a `D-nnn` in a note whose entry says nothing about that shortcut.

### D-041: koan is public on GitHub; Claude Code distribution is the marketplace
- **Decision:** The repo goes public at `un5table/koan` with a **fresh single-commit history**; the full 68-commit history lives on in the private archive repo (`un5table/koan-archive`) and locally on `archive/full-history`. The working tree ships after a light scrub (no local paths, no employer context, no private-remote lines; field-repo short-names stay as labels; machine-specific pointers live in gitignored `docs/FIELD.local.md`). Claude Code consumers install via a repo-root `.claude-plugin/marketplace.json` whose plugin `source` is `./dist/claude`; the marketplace.json formerly generated *inside* `dist/claude` is removed — one marketplace, one home, and a user can register only one marketplace per name.
- **Why:** The goal is sharing with coworkers, and `marketplace add` + `plugin install` is the only path needing no clone and no Node. Fresh history because the pre-publish sweep found the scrub class recoverable from old commits (employer context and local paths in early `ingest/LESSONS.md` versions) — a new root removes the entire class instead of filtering it, and the discipline's demonstration survives in the docs themselves, not the commit list.
- **Alternatives rejected:** npm publish ([[D-007]] deferred it; still nothing load-bearing); publishing full history (old blobs carry what the tree scrubbed); `git filter-repo` (rewrites 68 commits to buy what a fresh root gets for free, and a missed pattern still leaks).
- **Status:** implemented · _2026-08-07_ — supersedes [[D-035]]'s "a marketplace plugin (infrastructure for one consumer)" rejection on that one point: there are consumers now. The hook ships unchanged inside the plugin. Later same day: `ingest/` deleted from the tree — dev archaeology with zero functional references (digests of repos a public reader can't see); the record survives in the archive and in the archived entries here.
- **Revisit if:** the marketplace path fails a real coworker install, or npm distribution becomes load-bearing.

### D-029: koan-jazz — a quarantined branch buys the right to suspend the ladder
- **Decision:** A lifecycle skill, `koan-jazz`: a bounded improvisation session on a `jazz/<topic>` branch where the ladder, the trail, and `D-nnn` minting are **off**, closing with a mandatory disposition. Safety carve-outs and the Nevers stay on. The artifact is a **finding**, not code; code worth keeping re-enters through the ladder and never merges from the jam. Finding routing reuses [[D-028]]'s phase.
- **Why:** [[D-028]] fixed permanence but holds that explore "defers permanence, never discipline" — so nothing licensed building the speculative thing. Isolation makes suspension safe rather than reckless; the mandatory return is the load-bearing half.
- **Alternatives rejected:** a fourth `Phase` value (phase is project-level and persistent); a prose-only skill that tells you to branch (drops the precondition); a `koan:core` seat (core is what jazz suspends).
- **Status:** implemented · _2026-08-01_ — free channel, zero core tokens.
- **Revisit if:** jams routinely close with "code worth keeping" (the specs were vague, not the ladder); jam branches accumulate unclosed; or the suspension leaks into normal sessions.

### D-040: Safety carve-outs move into core; Never, Boundaries and ultra are cut
- **Decision:** The safety carve-out becomes a core Rules bullet ("Never drop a safety carve-out to shave lines: input validation at trust boundaries, …"), so AGENTS.md carries it. Deleted: the **Never** section (six bullets, each restating a rule already in the file), the **Boundaries** section (its one unique line folded into Persistence), and the `ultra` intensity with the whole Intensity axis + `argument-hint`.
- **Why:** An outside-view review found the widest-shipped artifact had the pressure without the guard: the canary classed "input validation at trust boundaries" as full-skill-only, so AGENTS.md consumers got the build-less ladder with no safety carve-out — by [[D-013]] the archetypal *guard* rule, which the delta gate deliberately does not price. The cut sections were pure reinforcement AGENTS.md already lived without; `ultra` had no gate at all (the [[D-036]] delegation precedent).
- **Alternatives rejected:** keeping Never as deliberate repetition (three homes for one prohibition is the fault koan lints for); gating the safety promotion on a Stage 1 run (guard probes don't flip on delta — the run decides nothing; human sign-off per Checks instead, and no run was spent).
- **Status:** implemented · _2026-08-07_ — AGENTS 4929 → 5166 chars (ceiling 5200 → 5400, deliberate growth); full skill 7422 → 6402 (ceiling ratcheted 7800 → 6700); canary phrases re-homed to CORE. **Checked same day** by one fable-5 Stage 1 run (`results/2026-08-07-stage1-fable5-post-d040.md`): every probed rule intact after the cuts; trail's null there extends [[D-030]]'s series, not this decision. The promoted safety rule itself remains probe-less — canary-verified presence only.
- **Revisit if:** a user asks for a stricter mode (ultra returns *with* a gate), or a Stage 1 run shows a regression traceable to the cuts.

### D-043: Budgets price the entry too, not just the file
- **Decision:** The over-budget DECISIONS warning names the fattest entries (compress-first remediation; silent under budget). Check 14 names parallel ID series (`## W-001…`) the integrity checks can't see. Check 9 counts constitution and domain-set citations. Wrap names five fields; the template provides them and asks for standalone rationale. Selfcheck asserts the budget numbers restated across prose surfaces agree with `lint.mjs`.
- **Why:** An external refactor review (2026-08-20) measured four field repos at the 30k ceiling with archiving intact: the mass was fat live entries (one 9.2k = 31% of a log) and a hand-rolled W-series — the kit taught compression nowhere and the linter couldn't name either shape.
- **Alternatives rejected:** a per-project budget override in the constitution (deferred — compression alone rescued the measured repos, and an unused valve invites raising instead of distilling); an unconditional per-entry size warning (fires on healthy under-budget logs — [[D-037]]'s noise class).
- **Status:** implemented · _2026-08-20_ — pinned in `lint-fixtures.mjs`; wrap ceiling 7200 → 7550 in the same change (was flush at 99.5%, budgets.json's wall rule).
- **Revisit if:** a repo still legitimately exceeds 30k after compressing and splitting — then add the explicit override (parsed beside `Phase`, hard stop stays 1.5×) as its own logged decision.
