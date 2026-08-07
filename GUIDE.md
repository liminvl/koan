# The koan guide

The full manual, for someone arriving with no context. The [README](README.md)
covers installation; this covers **why koan exists, what each piece does, when
to reach for it, and what a real week with it looks like**.

The skill files under [`src/`](src/) are the authoritative wording of every
rule — this guide summarizes and points, it never overrides them.

---

## 1. The problem

Coding agents fail in two directions, and both get worse the better the model is
at producing code:

- **Over-building.** Ask for a rate limiter, receive a configurable middleware
  framework with an interface, a factory, and a config file for a value that
  never changes. Every unrequested abstraction is code you now review, test,
  and carry.
- **Lost context.** The session that built your auth flow knew why it chose
  handlers over middleware. Tomorrow's session doesn't — so it re-derives the
  architecture from scratch, or worse, silently reverses a decision that had a
  reason. Chat history doesn't survive; `/compact` is lossy; tool memory is
  invisible to other tools.

koan is one discipline that catches both, stated in four lines the model keeps
even when everything else is compressed away:

> - **The best code is the code you never wrote.** Build less.
> - **Leave the next session a map, not a maze.** Lose less.
> - **One fact, one home.** Every fact lives in exactly one place; everywhere else points to it.
> - **Snapshot, not diary.** State what *is*, delete what *was*. History is what git is for.

**What using it feels like:** answers get shorter and code gets smaller — the
agent says what it *skipped* and when to add it, instead of shipping it "just in
case" — and every session ends with files a stranger could resume from.

## 2. The mental model

### Two practices, always on

The core `koan` skill runs on every coding task once installed. It has no
ceremony; it changes two things about how the agent works:

1. **BUILD LESS** — before writing anything, the agent climbs a ladder: does
   this need to exist at all? → is it already in this codebase? → stdlib? →
   native platform feature? → an already-installed dependency? → one line? →
   only then, the minimum code that works. It stops at the first rung that
   holds. Safety is carved out explicitly: validation at trust boundaries,
   data-loss handling, security, accessibility, and anything you explicitly
   asked for are never "simplified away" — and if you insist on the full
   version, it builds it without re-arguing.
2. **LOSE LESS** — a change isn't done when it works; it's done when the *next*
   session can pick it up cold. Durable facts get routed to their one home (see
   the three files below) as part of the work, not as an afterthought.

Turn it off any time with **"stop koan"** or **"normal mode"**. It governs what
gets built and what gets written down — never how the agent phrases prose.

### The three files

koan's continuity lives in three plain-Markdown files in your repo, each with
one job. The routing rule — *one fact, one home* — is what keeps them small
enough to load every session:

| File | Holds | Test for "does this line belong here?" |
|---|---|---|
| **CLAUDE.md** (or AGENTS.md) | The constitution: stack, how to run, the check commands that define "done", gotchas, pointers to canonical example files | Is it permanent and mechanical? ("needs `X` env var or it no-ops") |
| **docs/HANDOFF.md** | The rolling snapshot: objective, current state, next steps, what's unproven | Is it true *now* and will it be overwritten later? |
| **docs/DECISIONS.md** | Choices with rationale: what was chosen, why, what was rejected, what would reopen it | Would a future session silently re-litigate this without the entry? |

Two supporting files keep the loaded set lean: **docs/DECISIONS-archive.md**
(full text of settled decisions — deliberately *not* loaded into context) and
optional **docs/DECISIONS-\<domain\>.md** sets for live decisions that only bind
one area. Decision IDs (`D-001`, `D-002`, …) are permanent and never renumbered,
so citations stay valid forever.

Everything is human-readable and hand-editable — these are your project docs,
not a database. Git is the history; the files only ever say what *is*.

### Budgets

HANDOFF is capped at ~15k characters and DECISIONS at ~30k, checked by
`koan-lint`. The caps ration the model's *attention*, not cost — a 60k decision
log gets loaded and then skimmed, which is how standing rules stop landing.
When DECISIONS approaches its cap, settled entries move to the archive (a
one-line stub stays behind); when HANDOFF does, stale lines get deleted, not
collapsed into an "archive" section (hidden text still costs full tokens).

### Phases

One optional line in CLAUDE.md — `**Phase:** explore | build | harden` — sets
one thing: **where a choice lands**.

- `explore` (prototyping): provisional choices stay as *bets* in HANDOFF's "Not
  yet verified" instead of minting permanent decision IDs a week may reverse.
- `build` (the default): a choice worth not re-litigating becomes a DECISIONS
  entry.
- `harden` (shipped, depended-on): as `build`, plus every deliberate `koan:`
  shortcut in the code needs an explicit disposition (fix it, or accept it by
  citing the decision that took it).

The discipline itself never changes with phase — explore defers *permanence*,
never the ladder or the safety carve-outs.

### The `koan:` comment

When the agent takes a deliberate shortcut, it marks the ceiling and the
upgrade path in a comment:

```js
// koan: global lock, per-account locks if throughput matters
```

That's your **debt ledger**. `/koan-lint` with `--debt` lists every such marker
in tracked files — deferred work stays visible instead of rotting into "later
means never".

## 3. The skills — what, when, why

Six skills. One is the always-on lens; the other five are rituals you (or the
agent) invoke at session boundaries.

### `koan` — the lens
- **What:** the two practices above, active on every coding task.
- **When:** always; there's nothing to invoke. Say "stop koan" to turn it off.
- **Why:** over-building and context loss happen *mid-task*, not at boundaries —
  a rule you have to remember to apply is a rule that doesn't fire.

### `/koan-init` — set up a project
- **What:** creates the three files (plus archive) from templates, then **seeds
  them from the actual repo** — package scripts become the Checks section, git
  log drafts the current state, env usage drafts the inventory. In an empty
  repo it interviews you instead: what problem, what does "done" look like, who
  is it for, what's already decided.
- **When:** once per project — a fresh repo, or an existing one adopting koan.
  Re-running is safe: it never overwrites, only adds missing sections.
- **Why:** blank templates rot; docs seeded from reality get maintained.

### `/koan-wrap` — stop cleanly
- **What:** the end-of-session ritual. Gathers evidence from git (never from
  memory of the chat), prunes HANDOFF *before* writing the new snapshot,
  appends real decisions to the log, archives settled ones, and runs the lint
  checks. Anything not verified by a green check this session is recorded as
  "Not yet verified", not "done".
- **When:** ending a work session, switching tasks, or anything that ends with
  "I'm stopping here". Mid-session, say **"checkpoint"** instead — a light
  refresh of current-state/next-steps without the pruning pass. Checkpoint
  before `/compact`: compaction is lossy, HANDOFF isn't.
- **Why:** this is the moment context dies. Ten minutes of wrap is the
  difference between tomorrow's session resuming in two minutes and re-deriving
  everything for half an hour.

### `/koan-readback` — resume cold
- **What:** the agent reads the three files, cross-checks them against `git log`
  and `git status` (git wins on disagreement), then plays its understanding
  back in ≤10 bullets — objective, constraints, live decisions, and the next
  step it *would* take — and stops for your correction before touching code.
- **When:** first session after a gap, after working in a different tool, or
  any time you suspect the agent's picture is stale.
- **Why:** a misread that becomes code is the expensive kind of misread. Thirty
  seconds of confirmation beats an afternoon of un-writing a confident wrong fix.

### `/koan-lint` — check the docs
- **What:** deterministic checks a model is bad at eyeballing: decision-ID
  integrity (every archive stub has a full entry and vice versa, no duplicate
  or dangling IDs), character budgets, dead file paths in canonical examples,
  HANDOFF staleness vs git, claims that outlived their commit. Read-only — it
  reports, it never edits. `--debt` prints the `koan:` shortcut ledger instead.
- **When:** whenever the docs feel off, before trusting a handoff you didn't
  write, or automatically (see the hook below). Wrap runs it as its final pass.
- **Why:** cross-reference bookkeeping is exactly what an LLM will confidently
  skim past; a 60-line script doesn't.

### `/koan-jazz` — spike without the rules
- **What:** a bounded improvisation session. The agent branches to
  `jazz/<topic>`, states the **question** the jam answers, the **stop
  condition**, and what gets discarded — then the build-less ladder is
  *suspended* inside that branch: build the abstraction, try it three ways,
  take the dependency. Safety rules stay on. The jam **must** close with an
  answer: the finding gets recorded (usually one line in HANDOFF), and code
  worth keeping re-enters through the ladder as a normal change — the jam
  branch itself never merges.
- **When:** "I want to know whether X beats Y", "spike it", "let's experiment" —
  any time you want to explore a design koan would otherwise talk you out of.
- **Why:** an honest escape hatch beats a rule people quietly break. The
  quarantine is what makes suspending the discipline safe, and the mandatory
  return is what makes the spike worth its cost: *the jam's artifact is a
  finding, not code*. (In the benchmark for exactly this, a bare model answered
  the question but left its experiment files sitting on the main branch; the
  skill arm left main untouched.)

### The SessionStart hook (plugin installs only)
- **What:** when a Claude Code session opens, it runs the lint checks and
  speaks **only if something is wrong** — a stale HANDOFF, a blown budget, a
  citation that resolves to nothing. Never writes, never blocks, exits cleanly
  on every path, and is completely silent in healthy projects and in projects
  that don't use koan at all.
- **Why silence:** anything a hook injects costs tokens in *every* session on
  the machine. A hook you hear from only on faults is one you never disable.

## 4. Scenarios

**Day one on a new project.**
`/koan-init` → it interviews you (empty repo) or seeds from what exists → work
normally; the lens keeps output lean and routes durable facts as you go →
`/koan-wrap` before you leave. Total overhead: minutes.

**Resuming after two weeks.**
Open the project, `/koan-readback`. The agent plays back: objective, what's
live, the decision about handler-level auth it must not reverse, and "next step:
finish logout revocation in `src/auth/session.ts`". You correct one stale
bullet, confirm, and it's productive immediately — no archaeology.

**"Should we take the lru-cache dependency or hand-roll 15 lines?"**
`/koan-jazz cache strategy`. The agent branches, states the question and stop
condition, builds it both ways without the ladder slowing it down, and returns:
"hand-rolled passes eviction but serves stale rows and stampedes the DB under
concurrency; fixing that grows it to ~45 subtle lines vs ~12 lines of
`lru-cache` config — take the dependency." That finding lands as one line in
HANDOFF. The branch is deleted. Nobody jams on the same question next month,
because the answer is written down.

**A teammate joins mid-project.**
They clone the repo and the docs *are* the onboarding: CLAUDE.md says how to
run it and what "done" requires, HANDOFF says where things stand, DECISIONS
says why it's built the way it is. Their agent gets the same context yours has
— the files travel in git, so continuity is per-project, not per-person.

**You use Claude Code; a teammate uses Cursor.**
Both read the same three files — Cursor through `AGENTS.md`, which carries the
core discipline natively. Tool-local memory is invisible across tools; git plus
these docs are the only shared channel, which is exactly why koan routes
everything durable into them.

**The docs feel bloated or wrong.**
`/koan-lint`. It tells you precisely what's off — "DECISIONS is 31k chars,
archive settled entries", "D-014 is cited but has no entry", "HANDOFF is 6
commits behind HEAD" — and `/koan-wrap` fixes that class of problem as part of
its normal pass.

## 5. What koan is *not*

- **Not a memory database.** No embeddings, no auto-capture, no background
  indexing. It's curated prose in git — deliberately, so humans can read, edit,
  and review the agent's memory in a pull request.
- **Not a style guide.** It governs what gets built and what gets written down,
  never how code or prose is phrased.
- **Not a hard gate.** Nothing blocks. The lint reports, the hook reminds, the
  wrap asks — you and git remain in charge.
- **Not magic on small models.** The behavior deltas are verified on
  frontier-tier models and degrade below that tier; small fast models don't act
  on standing rules at all. The *docs* still help any model (and any human) —
  the rules just stop self-enforcing.

## 6. FAQ / troubleshooting

**The hook never says anything — is it working?**
Silence *is* the working state. Force a check any time with `/koan-lint`.

**Do I have to run the rituals in order?**
No. Only `init` is a prerequisite (once). Wrap and readback earn their keep the
moment sessions span days or tools; lint and jazz are on-demand.

**Can I edit HANDOFF/DECISIONS by hand?**
Yes — they're your files. Keep the routing rule in mind (one fact, one home)
and let `/koan-lint` catch anything mechanical you break.

**The agent skipped something I actually wanted.**
Say so — "build the full version" ends the argument by rule. Anything you
explicitly request is inside the safety carve-out and never gets simplified away.

**A lint warning fires that I disagree with.**
Warnings are advisory (exit 1); only structural breakage is an error (exit 2).
E.g. "archive candidate" means a settled entry *could* move — koan's own rule is
"unsure ⇒ keep".

**What does a `koan:` comment oblige me to?**
Nothing, until `harden` phase — then each one needs a disposition: fix it, or
accept it by citing the decision that took it (e.g. `// koan: DB stub (D-001)`).

**How do I uninstall?**
Remove the plugin/skills dir (or `/plugin uninstall koan@koan`) and delete
`AGENTS.md` if pushed. The three doc files are yours — they keep working as
plain project docs with or without koan installed.

---

*Why "koan"? A koan transmits whole understanding in a few words. That's the
bar for both outputs: code with nothing extra, and a trail a stranger resumes
from. What you leave out is the work; what you leave behind is the teaching.*
