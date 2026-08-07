# Decisions — benchmarks

> A **domain decision set**: live decisions that only bind work inside
> `benchmarks/`. Read this before building or changing an instrument. NOT
> auto-loaded — the main log carries a pointer in *Domain decision sets*.
> Same rules as docs/DECISIONS.md: choice + why only, IDs are permanent.

### D-006: Staged benchmarking, built to disprove
- **Decision:** Stage 0 (free, CI: budgets + canary + dogfood lint), Stage 1 (behavior probes vs baseline), Stage 2 (cold-resume continuity). Regression rule: skill tokens up AND behavior flat ⇒ cut the feature.
- **Why:** The stated risk is feature-bloat over time; the cheap Stage 0 plus the tokens-up/behavior-flat gate catch it.
- **Alternatives rejected:** outcome benchmark only (misses self-regression); dogfood only (can't measure the build-less half).
- **Status:** implemented · _2026-06-30_ — amended by [[D-036]]: the loc-counting *outcome* arm was cut, behavior is Stage 1.
- **Load-bearing:** [[D-001]]'s two halves each need their own benchmark axis.
- **Revisit if:** Stage 1's API cost outweighs its signal.

### D-012: Benchmark arms run context-free (--safe-mode + neutral cwd)
- **Decision:** Every benchmark CLI call — Stage 1 arms AND Stage 2's resume agent + judge — goes through `claudeArm()` (`benchmarks/claude-cli.mjs`): `--safe-mode` plus a neutral tmp working dir (empty, or a per-probe fixture dir). No call may see the koan repo, any real CLAUDE.md, or user-level skills.
- **Why:** The repo cwd let every arm — baseline included — inherit CLAUDE.md→DECISIONS→HANDOFF, so the dogfooding repo injected koan into its own control group; globally-installed skills were a second leak. All pre-2026-07-03 Stage 1 behavior numbers are void.
- **Alternatives rejected:** cwd-only fix (user-level skills still leak); `--setting-sources` (doesn't cover CLAUDE.md discovery + skills as one lever).
- **Status:** implemented · _2026-07-03_
- **Load-bearing:** every Stage 1 number cited anywhere assumes this isolation; Stage 2 runs from 2026-07-03 on assume it too.
- **Revisit if:** a benchmark call ever needs real project context `--safe-mode` strips.

### D-014: Delta probes stay unprompted; graders detect acts, not mentions
- **Decision:** A delta probe's task must never ask for the behavior it grades (no "note any choice you make"), and its grader must match an *act* of the rule (a `trail:` line, a drafted `### D-nnn`, log/record/append near decision-words) — never a bare mention of a file or an existing D-id. Each grader's known false-positive class is pinned as the selftest's bad reference.
- **Why:** With a visible decision log and a task that asked for the choice to be noted, all three arms drafted a D-002 — the probe measured instruction-following, not the rule. Mention-based regexes then let rival pass by merely *describing* the repo. Unprompted + act-matching restored discrimination.
- **Alternatives rejected:** leading tasks (measure compliance, not the rule); mention-based regexes (false-positive on citations and file listings).
- **Status:** implemented · _2026-07-03_
- **Revisit if:** a core rule's behavior structurally can't surface unprompted in write-denied `-p` runs — then the probe needs a different channel, not a leading task. (Fired same day for trail → [[D-015]].)

### D-015: Write-graded probes run write-enabled; the trail grader reads the filesystem
- **Decision:** A probe whose rule culminates in a write declares `write: true` and runs with `--permission-mode acceptEdits` (still under [[D-012]]'s isolation). Its grader checks the filesystem act first — for trail: the fixture's `docs/DECISIONS.md` gaining an entry beyond the shipped D-001 — with prose act-matching ([[D-014]]) as fallback; the fs channel is pinned in the selftest.
- **Why:** Write-denied `-p` masked the act for **every** arm — all three proposed the D-entry and reported the write declined, so the probe was measuring the harness, not the rule. Grading proposed acts was rejected: when declined, baseline proposes as readily as koan — talk is cheap; a written entry is ungameable. First run on the honest channel flipped clean: only koan wrote the D-002.
- **Alternatives rejected:** grading proposed acts (no delta — every declined arm proposes); dropping the trail probe (the rule is half of practice 2 and earns its tokens on the honest channel).
- **Status:** implemented · _2026-07-03_
- **Revisit if:** `acceptEdits` stops granting writes in fixture dirs. (The other original condition — baseline writing entries too — **fired** on claude-opus-5, 2026-08-01; [[D-030]] governs that case, not a demotion.)

### D-017: Scope-axis convergence is the finding; trail becomes a workspace measurement
- **Decision:** Accept D-016's fired revisit-if: on small fixtures with one model, all arms converge on the minimal implementation — the scope axis stops chasing a loc delta with heavier instruments. The workspace channel stays (regression gate + loc/files), and gains a **trail** column: a line-start `skipped:` scope line or a `// koan:` debt comment, detected act-style (D-014) across transcript + post-run workspace. Trail is a measurement, never a gate.
- **Why:** Two workspace tasks — well-specified `slugify` and vague `cacheDocs` — converged across arms; the only discriminating signal was koan's trail (koan 2/2, baseline/rival 0/4). Heavier instruments risk building a benchmark bigger than what it measures — the failure koan exists to catch. Trail is koan's own convention, so it can't be a gate (that measures self-compliance only), but as a column it records the one signal that discriminated, for free.
- **Alternatives rejected:** a third, heavier task (D-016 forbids exactly this); gating trail (circular); retiring the workspace channel (its regression gate + preserved workspaces still earn their keep).
- **Status:** implemented · _2026-07-03_
- **Revisit if:** a future model or arm shows real loc/files divergence on this channel (loc becomes signal again), or koan's trail column comes up empty on workspace tasks (a core-wording problem, not a demotion case).

### D-018: The benchmark grid has a model axis; delta evidence is model-qualified
- **Decision:** Every runner takes `--model` (Stage 2: the **resume agent** only — the judge stays pinned per D-011); the model rides the run-dir name and a table column, and unpinned runs record `default` (resolved: every pre-matrix run was `claude-fable-5`). A delta probe's flip evidence (D-013) is claimed **per model**, not globally.
- **Why:** The first matrix showed the deltas are model-dependent: trail flips on sonnet-5, onecheck does not (prose check expressions, no runnable assert), and on haiku *neither* manifests even with koan. All 36 outcome rows converge, so scope convergence spans three models.
- **Alternatives rejected:** pinning one benchmark model forever (hides exactly this finding); per-model runner forks (a flag is smaller).
- **Status:** implemented · _2026-07-03_
- **Load-bearing:** every flip cited for a core seat now names its model; today's core seats rest on fable-5 flips plus sonnet-5 trail.
- **Revisit if:** koan's wording is revised to land on weaker models (then rerun the matrix).

### D-021: Behavior probes may declare a per-probe arm pair
- **Decision:** A probe may override the shared baseline/rival/koan arms with its own pair when its rule lives in a lifecycle skill rather than core AGENTS.md. Users: `greenfield` (a `koan-init` arm, for D-020's interview step) and `jazz` ([[D-032]]) — the shared arms only ever carry AGENTS.md, so those rules had no way to manifest under the existing triad.
- **Why:** The smallest change that lets a lifecycle-skill rule get graded at all — a fourth permanent arm on every probe would waste spend on probes that don't need it, and a separate runner would duplicate the harness for one probe.
- **Alternatives rejected:** a fourth permanent shared arm; a dedicated runner for lifecycle-skill probes.
- **Status:** implemented · _2026-07-04_ — greenfield's first result was null; it flipped on opus-5 ([[D-030]]), which is why a null now dates rather than demotes.
- **Revisit if:** a probe needs a third arm (the pair stops being enough).

### D-032: jazz's gate is null and its column discriminates — recorded, not re-gated
- **Decision:** The `jazz` probe ([[D-021]] arm pair, fs-graded) keeps gating the **return** (koan-jazz §3) and keeps isolation (§1–2) as a recorded column ([[D-017]]). `koan-jazz` ships unchanged. Closes [[D-029]]'s grading question.
- **Why:** Baseline lands a properly phase-routed `Bet:` **unprompted** on opus-5 and fable-5 — the return needs no skill. Only the koan-jazz arm quarantines: `jam+clean` vs baseline's `no-jam+code-on-main`, 5/5 readable runs. The predicted cut was backwards: §2 carries the signal, §3 is what every arm already does. Re-gating on the column would build instrument to confirm what it records ([[D-016]]); [[D-030]] bars demoting on top-model nulls regardless.
- **Alternatives rejected:** re-gate on isolation (instrument outgrows the rule); cut §2 (the data reversed the prediction); leave jazz ungraded (D-029's gap — a rule with no gate at all).
- **Status:** implemented · _2026-08-02_ — paid for by compressing D-017/D-018/D-021, whose narrative D-023/D-030 had overtaken.
- **Load-bearing:** second case of [[D-017]] — the measurement refused as a gate is the one that discriminates.
- **Revisit if:** the return goes null tier-wide with sonnet-5 readable (then §3's prose is the cut, not §2), or a field jam ends with only a branch.
