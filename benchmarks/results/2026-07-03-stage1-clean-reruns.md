# 2026-07-03 (later) — Clean reruns: outcome isolated, onecheck n=2, trail probe made honest

- **koan version:** 0.1.0 (working tree on `38974c4` + this session's instrument fixes)
- **Stage:** 1 (outcome A/B + behavior gates), Stage 2 isolation fix (no rerun)
- **Model(s):** claude-fable-5 (user default via `claude -p`), n=1 per run
- **Arms:** baseline (empty system), rival (85-char one-liner), koan (dist/agents/AGENTS.md)

## Headline
First **clean** outcome numbers: all arms pass all gates and nearly converge on
loc — koan is marginally leaner and never worse. **onecheck's delta flipped
again (n=2, now the settled example of a rule earning its tokens).** The trail
probe went through two honesty fixes (fixture project cwd, then unprompting +
act-not-mention grading) and its delta is **real but noisy: 1 of 2 clean flips**.

## Outcome A/B — first isolated run (`runs/outcome-2026-07-03-2/`)

| arm | safeJoin loc | gate | sumAmounts loc | gate |
|---|---|---|---|---|
| baseline | 26 | pass | 10 | pass |
| rival | 26 | pass | 13 | pass |
| koan | **24** | pass | 10 | pass |

Verdict: no safety/correctness cost, tiny loc edge. The contaminated 07-02 table
is superseded; these tasks are too small to separate the arms on loc — the
outcome axis needs meatier tasks before it can say more than "koan doesn't hurt".

## Behavior — onecheck confirmed (`runs/behavior-2026-07-03-2/`)

| probe | kind | baseline | rival | koan |
|---|---|---|---|---|
| trail (leading probe — see below) | delta | yes | yes | yes |
| onecheck | delta | no | no | **yes** |
| explanation | guard | yes | yes | **yes** |

onecheck n=2: koan left runnable `assert` self-checks; baseline's "examples" were
comments, not checks (and baseline gold-plated unrequested days-support while koan
skipped it with a one-liner). The D-013 promotion holds.

## Behavior — the trail probe needed two fixes to be honest
1. **Fixture project cwd** (this run's first fix): the rule can't manifest in an
   empty dir, so trail probes now run in a tmp fixture with `docs/DECISIONS.md`
   + `package.json` (same for every arm, fresh per call).
2. **The probe led the witness**: with "Note any architectural choice you make"
   in the task and a visible decision log, *every* arm drafted a D-002 (table
   above) — that measures instruction-following, not the rule. The sentence is
   gone; the trail must now come unprompted.
3. **The grader counted mentions as logging**: rival passed run -3 by *describing*
   the repo ("only contains package.json and docs/DECISIONS.md"). Grader now
   requires an act — a `trail:` line, a drafted `### D-nnn`, or log/record/append
   near decision/choice/DECISIONS. False-positive class pinned in the selftest's
   bad reference; re-grade of all preserved answers matches hand classification.

Unprompted trail, tightened grader, n=2:

| run | baseline | rival | koan |
|---|---|---|---|
| `behavior-2026-07-03-3` | yes (weak: "worth recording … a D-002") | no | **no** (dropped `trail:`, kept `skipped:`) |
| `behavior-2026-07-03-4` | no | no | **yes** (`trail: worth a D-002 in docs/DECISIONS.md …`) |

Verdict: **directional, not settled.** One clean flip, one inverted run where
koan itself dropped the trail (possibly write-denied `-p` sessions make the arm
treat logging as impossible and skip mentioning it). Keep the rule — it's half of
practice 2 — but keep sampling; if koan keeps missing unprompted trail in `-p`,
that's a wording problem in core, not a demotion case.
*(Superseded same day, below: the write-denied channel — not the rule — was the
noise source.)*

## Also fixed this session (instruments)
- **Stage 2 leak closed**: the continuity runner's resume agent + judge ran with
  repo cwd and user-level skills; both now go through `claudeArm()`. The old
  worry that `--safe-mode` is too blunt for Stage 2 dissolved — the fixture docs
  ride the prompt inline, so isolation costs nothing (D-012 updated). The 07-02
  15/15 predates this; next real Stage 2 run re-baselines it.
- **Run dirs no longer clobber**: same-day reruns get `-2`, `-3`, … suffixes
  (`runDir()` in claude-cli.mjs) — results docs cite these paths as evidence.
- **Behavior runner** grew `--arms`/`--probes` slicing (mirrors outcome's flags)
  so a probe retest costs 3 calls, not 9.

## Caveats
- Everything n≤2, one model — directional. onecheck is the strongest datapoint
  (2 clean flips post-promotion). Trail needs more unprompted samples.
- Arms run write-denied under `-p`; probes that grade *acts of writing* can only
  see the act proposed in prose, which may undercount every arm's trail behavior.
  *(Confirmed and fixed the same day — see the continuation below.)*

---

# Continuation (same day, second sitting)

## Stage 2 re-baselined under the closed leak
Real rerun with resume agent + judge through `claudeArm` (D-012): **strict 3/5,
judge 15/15** — the 07-02 pre-isolation score is reproduced under full isolation.
The two strict misses are paraphrase artifacts, which is exactly the case the
judge layer exists for (D-011). Stage 2's "not yet verified" line is retired.

## Trail: the channel was the problem, not the rule (runs -5, -6 → D-015)
Run -5 (write-denied, act grader): baseline no · rival no · koan no. But the raw
answers showed **all three arms proposed the D-entry and reported the write
declined** — koan: "a D-002 entry … ready to write, but the file write was
declined"; baseline: "a D-002 entry would fit there — I didn't add it since the
file write was declined". The harness was suppressing the graded act for every
arm. Grading *proposed* acts (D-014's suggested fallback) would show no delta —
when declined, baseline proposes as readily as koan.

Fix (D-015): the probe now declares `write: true` → runs with
`--permission-mode acceptEdits` (verified compatible with `--safe-mode`), and the
grader checks the **filesystem first**: did the fixture's `docs/DECISIONS.md`
gain an entry beyond the shipped D-001? The post-run log is preserved next to
each answer; the fs channel is pinned in the selftest.

Run -6 (write-enabled): **baseline no · rival no · koan yes** — koan appended a
well-formed D-002 (Decision/Why/Status, with a reopen condition: "per-process
counters stop being a real limit"); baseline and rival left the log untouched
despite having proposed the entry when denied. Talk is cheap; the write is
ungameable.

Trail verdict: **the delta is real on the honest channel** (n=1 there). The
earlier 1-of-3 was measuring write-denial, not the rule.

## Outcome: two scope tasks added — and they converge too
New tasks with a tiny pinned contract and a big over-build temptation
(`renderTemplate`: dot-paths/conditionals/escaping loom; `parseCsvLine`: a full
configurable parser looms). Gates selftest-validated offline before spend.
Run `runs/outcome-2026-07-03-3/`:

| arm | renderTemplate loc | gate | parseCsvLine loc | gate |
|---|---|---|---|---|
| baseline | 6 | pass | 29 | pass |
| rival | 5 | pass | 29 | pass |
| koan | 6 | pass | **27** | pass |

Finding: the harness's own wrapper ("implement a function … return ONLY a fenced
code block" + an exact contract) caps scope creep — over-building has no surface
to show on, however meaty the domain. koan's parseCsvLine still carried a
runnable self-check (onecheck, unprompted in an outcome task) and a `skipped:`
line scoping out malformed-input handling — the discipline shows qualitatively
even where loc converges. Next design: an open-ended "add a feature to this
fixture module" channel (like the behavior probes' fixture cwd), not a meatier
one-function contract.

## Also
- No git remote exists and the folder is already `koan` — the rename next-step
  dissolves to "pick names when a remote/npm publish happens" (D-007).
- `npm test` green after all instrument changes (fs-channel selftest included).

---

# Third sitting (same day): trail n=2, workspace channel lands

## Trail delta holds (`runs/behavior-2026-07-03-7/`)
Second run on the write-enabled channel: **baseline no · rival no · koan yes** —
verified on the filesystem (only koan's fixture log gained a D-002; baseline and
rival left it at the shipped D-001). n=2 clean flips, zero noise since D-015.
The D-013 core seat holds; keep watching D-015's revisit-if (baseline writing too).

## Outcome workspace channel (D-016): first task, `runs/outcome-2026-07-03-4/`
The scope axis moved to an open-ended channel: the arm works **write-enabled in
a fixture project cwd** (D-015 mechanics), the task text is the whole prompt (no
"ONLY a fenced code block" wrapper), and the gate imports the **post-run module**
— new export must work, shipped exports must keep working (the selftest's bad
reference is a refactor sweep that breaks `truncate`). Measurements: JS loc added
across ALL files + files created; whole workspaces preserved, `--rescore` works
on them offline.

First task — add `slugify` to a 2-export text-helpers module:

| arm | loc added | files added | gate |
|---|---|---|---|
| baseline | 6 | 0 | pass |
| rival | 3 | 0 | pass |
| koan | 3 | 0 | pass |

Findings, honestly read:
- **Converged again** (the loc gap is formatting, not scope). A well-specified
  small feature doesn't tempt anyone into over-building — the *channel* now has
  the surface (files, unbounded loc), but this *task* didn't supply the
  temptation. n=1.
- **Write-enabled agentic mode changed everyone's behavior**: all three arms ran
  a real node verification unprompted (in `-p` one-shot mode only koan left
  checks). koan alone added a `skipped:` scope line (transliteration,
  hyphen-trimming — with reopen conditions).
- Next lever is task *openness*, not size: a vaguer ask ("make fetches resilient",
  "add caching") where the minimal faithful implementation is genuinely debatable.

---

# Fourth sitting (same day): the vague ask converges too — D-016's revisit-if fires

## Outcome workspace, open-ended ask: `cacheDocs` (`runs/outcome-2026-07-03-5/`)
The openness lever, pulled: a docs-build fixture (`getDoc` pays a service hit per
call, `fetchCount` feeds a stats page, a `build.mjs` caller) and the vague ask
"**add caching** so repeat lookups stop paying". No design named — TTL, LRU,
invalidation APIs, a cache class in its own file are all defensible gold-plating;
minimal-faithful is a four-line memo. The gate pins only the observable floor
(repeat `getDoc` costs no hit, new id still fetches, `docUrl` untouched); the
selftest's bad reference is the gold-plate sweep whose caching works but whose
rebuild dropped `.html` from `docUrl`.

| arm | loc added | files added | gate |
|---|---|---|---|
| baseline | 4 | 0 | pass |
| rival | 6 | 0 | pass |
| koan | 4 | 0 | pass |

Findings, honestly read:
- **Converged a second time — with the temptation present.** Every arm wrote the
  minimal module-level `Map` memo, reasoned about `fetchCount` semantics
  correctly (real hits, not cache size), and verified with a smoke run
  unprompted. Nobody added eviction, options, or a helper file. n=1 on this task,
  but it's the vague-ask datapoint the third sitting said was missing.
- **koan's differentiation is qualitative, again**: it alone left a `skipped:`
  line (eviction/TTL, with the reopen condition "if this ever runs as a
  long-lived process") and a `koan:` debt comment at the cache declaration. On
  this channel the discipline shows in the *trail*, not the loc.
- **D-016's revisit-if has fired**: two workspace tasks — one well-specified, one
  genuinely open-ended — both converged across arms on one model. Per D-016, the
  scope axis needs a different instrument, not a third task. Candidate readings
  for the next session: (a) accept the finding — current-model defaults are
  already lean on small fixtures, and koan's scope value is the qualitative
  trail, which the *behavior* probes already grade; or (b) build an instrument
  with real gold-plating gravity (a larger multi-file fixture, a task that
  invites a dependency, or grading the `skipped:`/`koan:` markers themselves).

## Also (instrument)
- `score()` now imports the workspace entry **in place** instead of copying its
  source to a tmp dir — relative imports to helper files must resolve, because
  helper files are this channel's over-build surface; a helper-split solution has
  to fail on scope (loc/files), not on a phantom import error. Selftest still
  loads the whole-module good/bad references the old way. `npm test` green.

---

# Fifth sitting (same day): D-017 — convergence accepted, trail becomes a measurement

The human chose reading (a) with a twist: accept convergence as the scope-axis
finding (no heavier instrument), and fold the trail markers into the workspace
channel's **measurements** so future runs keep recording the one signal that
discriminated. Logged as D-017.

`score()` now emits a `trail` column for every row: a line-start `skipped:`
scope line or a `// koan:` debt comment, matched act-style (D-014) across the
transcript + post-run workspace files. It is a measurement, never a gate —
trail is koan's own convention, so gating it would only measure self-compliance.
Pinned FP class in the selftest: prose *mentions* ("noted in a `koan:` comment",
the `koan:core` build marker) must not count — both observed in real transcripts.
`--rescore` now feeds the preserved transcript alongside each workspace.

Offline rescore of both preserved workspace runs (zero API spend; loc/gates
unchanged from the tables above):

| run | task | baseline | rival | koan |
|---|---|---|---|---|
| `outcome-2026-07-03-4` | slugify | — | — | **skipped** |
| `outcome-2026-07-03-5` | cacheDocs | — | — | **skipped+koan** |

Verdict: the trail column discriminates cleanly where loc doesn't (n=2 tasks,
koan 2/2, baseline/rival 0/4). The scope axis's honest claim is now: **koan
doesn't hurt (gates + loc converge) and leaves a better record (trail)** — and
the channel keeps watching for the day loc diverges (D-017's revisit-if).

---

# Sixth sitting (same day): D-018 — the model axis; deltas are model-dependent

The human asked whether a heavier benchmark or other models would sharpen the
comparison. Per D-016/D-017, heavier instruments stay rejected; the cheap lever
is the **model axis**: every runner now takes `--model` (Stage 2: resume agent
only; the judge stays pinned per D-011), the model rides the run-dir name and a
table column. `default` resolved: every pre-matrix run was **`claude-fable-5`**.
Logged as D-018.

First matrix — behavior (3 arms × 3 probes) + outcome (3 arms × 6 tasks) on
`claude-sonnet-5` and `claude-haiku-4-5-20251001`, all under D-012 isolation:

## Behavior (after the grader fix below)

| probe (kind) | fable-5 (prior runs) | sonnet-5 | haiku-4.5 |
|---|---|---|---|
| trail (delta) | **flips** (koan fs-writes, 2/2) | **flips** (koan fs-writes a clean D-002; baseline/rival no) | no flip — koan itself never mentions the log |
| onecheck (delta) | **flips** (2/2) | no flip — koan left prose check expressions, no runnable assert | no flip — koan left `console.log` demos |
| explanation (guard) | ok | ok (all arms) | ok (all arms) |

**Grader fix (D-014 applied):** sonnet-5's baseline first graded trail "yes" on
a new FP class — the *passive mention* "Since the repo has no Redis/shared-store
decision recorded in `docs/DECISIONS.md`, I didn't reach for …" (observing the
log's silence, then not writing to it). The prose fallback now requires a
first-person act (`I/we … logged/recorded/appended … decision/DECISIONS`); the
observed FP is pinned in the selftest's bad reference. Offline re-grade of all
33 preserved trail answers: every fable-5 classification unchanged (runs -6/-7
still flip), sonnet-5 baseline correctly drops to "no".

## Outcome

All 36 rows (2 models × 3 arms × 6 tasks incl. both workspace tasks) **pass
their gates and converge on loc**; zero helper files created by any arm. Scope
convergence now spans three models — D-017's "loc becomes signal" revisit-if
did NOT fire. But its *other* revisit-if did: **koan's trail column is empty on
both new models' workspace rows** (fable-5: 2/2 · sonnet-5: 0/2 · haiku: 0/2;
sonnet-koan did leave a genuine `Skipped:` line on non-workspace safeJoin).
Sonnet-koan's cacheDocs is byte-identical to the minimal good reference — it
skipped eviction/TTL *silently*.

## Reading

The capability gradient is the finding: koan's rules land in proportion to
model strength — fable-5 acts on them fully, sonnet-5 partially (trail yes,
onecheck degraded to prose), haiku-4.5 not at all. Baseline never over-builds
on any model, so the anti-over-build half stays unfalsifiable on this channel,
while the lose-less half's deltas are real but **model-qualified** (D-018).
Open question for the human: reword `koan:core` so the rules land on weaker
models (then rerun the matrix), or accept koan as a strong-model kit?

Raw evidence: `runs/behavior-sonnet-5-2026-07-03/`,
`runs/behavior-haiku-4-5-20251001-2026-07-03/`, `runs/outcome-sonnet-5-2026-07-03/`,
`runs/outcome-haiku-4-5-20251001-2026-07-03/` (n=1 per cell — directional).
