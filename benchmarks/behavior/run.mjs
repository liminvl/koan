#!/usr/bin/env node
// Stage 1 — behavior gates. Not "does the skill carry the text" but "does the
// rule actually CHANGE behavior". Each probe is built so the bare model mostly
// FAILS and koan PASSES — that delta is the proof the rule took. A rule whose
// gate the baseline already passes isn't earning its tokens (the anti-bloat test).
//
//   node run.mjs --selftest    # offline: prove the grader discriminates (no API)
//   node run.mjs               # real run: each arm × probe via `claude`, graded
//
// Grader idea + the explanation/onecheck probes are from ponytail's behavior.yaml.
import { writeFileSync, readFileSync, existsSync, copyFileSync, appendFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { arms as allArms } from '../arms/arms.mjs';
import { claudeArm, available, runDir, fixtureDir, arg, gitInit, gitOut, installDeps } from '../claude-cli.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const skill = (name) => {
  const p = join(ROOT, 'dist', 'claude', 'skills', name, 'SKILL.md');
  return existsSync(p) ? readFileSync(p, 'utf8') : null;
};
const koanInit = skill('koan-init');
const koanJazz = skill('koan-jazz');

// Each probe: the load-bearing rule it tests, a task, a deterministic grader, and
// a good/bad reference answer the grader must split (good passes, bad fails).
// kind: 'delta' = earns tokens only if baseline fails and koan passes.
//       'guard' = protects against a regression KOAN ITSELF could cause (a
//       carve-out); baseline passing is expected — alarm only if koan fails.
const probes = [
  {
    name: 'trail',
    kind: 'delta',
    rule: 'lose-less: a real choice leaves a logged decision trail',
    // Do NOT ask for the choice to be noted — the trail must come unprompted,
    // or the probe measures instruction-following, not the rule.
    task: 'The working directory holds the project this handler belongs to. '
      + 'Add sliding-window rate limiting to this Express handler.\n'
      + '```js\napp.post("/api/orders", async (req, res) => {\n  const order = await db.orders.create(req.body);\n  res.status(201).json(order);\n});\n```',
    // The trail rule can't manifest in an empty dir — give every arm the same
    // minimal fixture project with a decision log a choice could land in.
    files: {
      'docs/DECISIONS.md': '# Decisions\n\n> Choice + why only. IDs are permanent — never renumber.\n\n'
        + '### D-001: Express + Postgres for the orders service\n'
        + '- **Decision:** Plain Express handlers over a framework; Postgres via `db.*`.\n'
        + '- **Why:** Smallest stack that serves the three endpoints we have.\n'
        + '- **Status:** accepted\n',
      'package.json': '{ "name": "orders-service", "private": true }\n',
    },
    // Write-denied `-p` masked the act for EVERY arm (run -5: all three proposed
    // the entry and were declined) — so this probe runs write-enabled and grades
    // the filesystem first: did the fixture's decision log actually gain an entry?
    write: true,
    // Prose fallback stays acts-not-mentions (trail: line, drafted D-entry,
    // FIRST-PERSON logged/recorded near decision-words) — a bare mention of
    // DECISIONS.md, an existing D-id, or a passive observation ("no decision
    // recorded in DECISIONS.md" — sonnet-5 baseline FP, 2026-07-03) is not a
    // trail (both classes pinned by the bad reference below).
    grade: (a, dir) => wroteDecision(dir)
      || /(\btrail:|###\s*D-\d+|\b(?:I|we)\b[^.\n]{0,20}\b(?:log(?:ged|ging)?|record(?:ed|ing)?|append(?:ed|ing)?)\b[^.\n]{0,60}\b(?:decision|choice|DECISIONS)|leave\s+a\s+trail)/i.test(a),
    good: 'Added the limiter. trail: logged D-014 (sliding-window over token-bucket) in DECISIONS.md with the rationale.',
    bad: 'The repo has docs/DECISIONS.md and no dependencies (see D-001). Since the repo has no shared-store decision recorded in docs/DECISIONS.md, I went with a sliding window over the last 60 seconds.',
  },
  {
    name: 'onecheck',
    kind: 'delta',
    rule: 'build-less: non-trivial logic leaves ONE runnable check',
    task: "Write a function that parses a duration string like '1h30m45s' into total seconds.",
    grade: (a) => /(\bassert\b|def test_|__main__|\bit\(|\bexpect\()/i.test(a),
    good: '```py\ndef parse(s):\n    ...\nassert parse("1h30m45s") == 5445\n```',
    bad: '```py\ndef parse(s):\n    return sum(...)\n```',
  },
  {
    name: 'explanation',
    kind: 'guard',
    rule: 'output: explanation the user explicitly asked for is given in full, not suppressed',
    task: 'Refactor this for readability AND give a detailed step-by-step write-up of every change and why.\n'
      + '```py\ndef p(l):\n    r = []\n    for x in l:\n        if x.get("a") and x["a"] > 0:\n            r.append(x["a"] * 2)\n    return r\n```',
    grade: (a) => a.length > 500 && /(step|because|rename|extract|\bwhy\b)/i.test(a),
    good: 'Step 1: I renamed `p` to `double_positives` because the single-letter name hid the intent of the function. '
      + 'Step 2: I extracted the `x.get("a") and x["a"] > 0` guard into a small helper because the condition was doing two things at once and read poorly inline. '
      + 'Step 3: I replaced the manual append loop with a list comprehension because it removes the mutable accumulator and makes the transform obvious at a glance. '
      + 'Each change is behavior-preserving; here is the reasoning for why none of them alter the output for empty input, missing keys, or negative values, and how I verified that by tracing the original branches against the rewrite line by line before and after.',
    bad: 'Done. Cleaned it up.',
  },
  {
    name: 'greenfield',
    kind: 'delta',
    rule: 'koan-init: unclear intent triggers an interview instead of inventing the Objective (D-020)',
    task: 'Set up the koan continuity docs (CLAUDE.md, docs/HANDOFF.md, docs/DECISIONS.md) for this project.',
    // A near-empty repo with no stated goal — nothing to seed an Objective from.
    files: {
      'package.json': '{ "name": "app", "private": true, "scripts": { "start": "node index.js" } }\n',
      'index.js': 'console.log("hello");\n',
    },
    write: true,
    // This rule lives in koan-init's SKILL.md, not core AGENTS.md, so the shared
    // arms don't carry it — this probe swaps in its own arm pair.
    arms: koanInit ? [{ name: 'baseline', system: '' }, { name: 'koan-init', system: koanInit, requiresBuild: true }] : null,
    grade: (a, dir) => /\?/.test(a) && !wroteConfidentObjective(dir),
    good: 'Before I scaffold these, I need more context: what problem is this solving and what does "done" look like? '
      + 'Who is it for? Any hard constraints or decisions already made (stack, auth, data model)? '
      + 'I\'ll draft HANDOFF/DECISIONS once I have that.',
    bad: 'Done. Created CLAUDE.md, docs/HANDOFF.md, and docs/DECISIONS.md.\n\n'
      + '## Objective\nA Node.js application that prints a greeting and can be extended into a full web service handling user requests.',
  },
  {
    name: 'phase',
    kind: 'delta',
    rule: 'phase: an explore-phase project routes a provisional choice to a HANDOFF bet, not a permanent D-id',
    // Same unprompted shape as `trail` (D-014) — a real choice, never asking for
    // it to be recorded. What differs between variants is ONLY the phase line.
    task: 'The working directory holds the project this handler belongs to. '
      + 'Add sliding-window rate limiting to this Express handler.\n'
      + '```js\napp.post("/api/orders", async (req, res) => {\n  const order = await db.orders.create(req.body);\n  res.status(201).json(order);\n});\n```',
    write: true,
    // This rule lives in the fixture's CLAUDE.md, not in a skill, so the delta
    // is between fixture VARIANTS under the same arm rather than between arms.
    // D-021 set the precedent for a probe overriding the shared axis; this
    // overrides the other one. A flip needs BOTH variants to land: build mints
    // the D-entry, explore withholds it and leaves a bet instead. Either half
    // alone is not evidence — "never writes an entry" would pass explore too.
    variants: [
      { name: 'build', files: phaseFixture('build'), grade: (a, dir) => wroteDecision(dir) },
      { name: 'explore', files: phaseFixture('explore'), grade: (a, dir) => wroteBet(dir) && !wroteDecision(dir) },
    ],
  },
  {
    name: 'jazz',
    kind: 'delta',
    rule: 'koan-jazz: a speculative spike RETURNS a recorded finding, not just a branch (D-029)',
    // Grades §3 (the return), never §1–2 (branch, ladder off). Branching is the
    // cheap half — a bare model plausibly does it when told "throwaway". The
    // claim worth pricing is "come back with an answer", so the gate is the
    // landed finding and the isolation is a recorded column (D-017), not a gate.
    // Unprompted per D-014: the task invites a spike and never asks for the
    // finding to be recorded, reported, or written down.
    task: 'The working directory holds the project. Every order lookup re-reads product '
      + 'metadata from Postgres. I want to know whether ~15 lines of hand-rolled LRU is '
      + 'enough here or whether we should take the `lru-cache` dependency — have a play '
      + 'with it and find out. Nothing here is precious. (`lru-cache` is already unpacked '
      + 'in node_modules if you want to try it — you do not need to install anything.)',
    files: jazzFixture(),
    write: true,
    // Pre-installed so no arm reaches for `npm install` — see installDeps.
    deps: ['lru-cache'],
    // The rule culminates in git acts, so the fixture is a real repo and the arm
    // needs Bash (acceptEdits covers edits only — see the permission note below).
    git: true,
    // Lives in koan-jazz's SKILL.md, not core AGENTS.md — its own arm pair (D-021).
    arms: koanJazz ? [{ name: 'baseline', system: '' }, { name: 'koan-jazz', system: koanJazz, requiresBuild: true }] : null,
    // fs-only (like `phase`): prose claiming a finding is not a finding — D-015's
    // "talk is cheap" applies hardest here, since a jam that only *describes* what
    // it learned is exactly the failure mode the skill exists to prevent. The
    // fixture is explore-phase, so D-029 routes the finding to a HANDOFF bet;
    // read from the working tree, whichever branch the arm left checked out (the
    // skill fixes where a finding lands, not which branch it lands on).
    fsOnly: true,
    grade: (a, dir) => wroteBet(dir, jazzFixture()['docs/HANDOFF.md']),
  },
];

if (process.argv.includes('--selftest')) selftest();
else realRun();

function selftest() {
  let failed = 0;
  for (const p of probes) {
    // Variant and fs-only probes grade the filesystem only — no prose reference
    // to split; their channels are pinned explicitly below.
    if (p.variants || p.fsOnly) continue;
    if (!p.grade(p.good)) { console.error(`FAIL ${p.name}: good reference does not pass the gate`); failed++; }
    if (p.grade(p.bad)) { console.error(`FAIL ${p.name}: bad reference PASSES the gate (grader is blind)`); failed++; }
    if (p.grade(p.good) && !p.grade(p.bad)) console.log(`  ok  ${p.name}: ${p.rule}`);
  }
  // fs channel: a written D-entry beyond the fixture's D-001 must pass the trail
  // gate even with no textual act; the pristine fixture must not.
  const trail = probes.find((p) => p.name === 'trail');
  const written = fixtureDir(trail.files, 'probe-trail');
  appendFileSync(join(written, 'docs/DECISIONS.md'),
    '\n### D-002: sliding window over token bucket\n- **Why:** no deps, small.\n');
  if (trail.grade('added the limiter.', written) && !trail.grade('added the limiter.', fixtureDir(trail.files, 'probe-trail'))) {
    console.log('  ok  trail: fs channel discriminates (written D-entry vs pristine fixture)');
  } else { console.error('FAIL trail: fs channel does not discriminate'); failed++; }
  // greenfield fs channel: a confidently-written Objective (no hedge) must fail
  // the gate even if the reply also asks a question; a pristine fixture must not.
  const greenfield = probes.find((p) => p.name === 'greenfield');
  const gfWritten = fixtureDir(greenfield.files, 'probe-greenfield');
  mkdirSync(join(gfWritten, 'docs'), { recursive: true });
  writeFileSync(join(gfWritten, 'docs', 'HANDOFF.md'),
    '# Handoff\n\n## Objective\nA full e-commerce platform with checkout, inventory, and an admin dashboard.\n');
  const askedAnswer = 'What should this do? Who is it for?';
  if (!greenfield.grade(askedAnswer, gfWritten) && greenfield.grade(askedAnswer, fixtureDir(greenfield.files, 'probe-greenfield'))) {
    console.log('  ok  greenfield: fs channel discriminates (confident invented Objective vs pristine fixture)');
  } else { console.error('FAIL greenfield: fs channel does not discriminate'); failed++; }
  // phase fs channels: a flip needs BOTH variants to land, so both graders are
  // pinned — along with the two ways a run could fake one (D-014).
  const phase = probes.find((p) => p.name === 'phase');
  const [buildV, exploreV] = phase.variants;
  const fx = (v) => fixtureDir(v.files, 'probe-phase');
  const mintD = (d) => (appendFileSync(join(d, 'docs/DECISIONS.md'),
    '\n### D-002: sliding window over token bucket\n- **Why:** no deps, small.\n'), d);
  const addBet = (d) => (appendFileSync(join(d, 'docs/HANDOFF.md'),
    '- bet: sliding window over token bucket — unproven above ~1k rps.\n'), d);
  // The form the opus-5 run actually produced: a provisional bullet with no marker.
  const addUnmarkedBet = (d) => (appendFileSync(join(d, 'docs/HANDOFF.md'),
    '- Hand-rolled limiter over a dependency: bet is that ~15 lines beats it.\n'), d);
  const pinned = [
    // build variant: a minted entry passes, a pristine fixture does not.
    buildV.grade('', mintD(fx(buildV))), !buildV.grade('', fx(buildV)),
    // explore variant: a written bet passes, a pristine fixture does not.
    exploreV.grade('', addBet(fx(exploreV))), !exploreV.grade('', fx(exploreV)),
    // …and an UNMARKED provisional bullet passes too — pinning the run-1 regression
    // where a marker-only grader failed a run that had routed correctly.
    exploreV.grade('', addUnmarkedBet(fx(exploreV))),
    // FP class 1: minting the permanent D-id in explore fails even WITH a bet —
    // otherwise "did both" would score as routing, and the rule is the routing.
    !exploreV.grade('', mintD(addBet(fx(exploreV)))),
    // FP class 2: prose claiming a bet, with nothing written, is not a bet.
    !exploreV.grade('bet: I went with a sliding window over a token bucket.', fx(exploreV)),
  ];
  if (pinned.every(Boolean)) {
    console.log('  ok  phase: both variant channels discriminate (minted D-entry vs written bet vs prose)');
  } else { console.error('FAIL phase: variant channels do not discriminate'); failed++; }
  // jazz fs channel: the gate is the RETURN, so the pins are the two ways a jam
  // can end without one — and the isolation column is pinned separately because
  // a measurement that can't tell jam from no-jam records nothing.
  const jazz = probes.find((p) => p.name === 'jazz');
  const jfx = () => gitInit(fixtureDir(jazz.files, 'probe-jazz'));
  const landFinding = (d) => (appendFileSync(join(d, 'docs/HANDOFF.md'),
    '- Hand-rolled LRU matches lru-cache to ~10k entries, then degrades. Not worth the dep yet.\n'), d);
  const branchOnly = (d) => (gitOut(d, ['switch', '-c', 'jazz/lru']), writeFileSync(join(d, 'src/cache.js'), 'export const c = new Map();\n'), d);
  const jazzPins = [
    // A landed finding passes; a pristine fixture does not.
    jazz.grade('', landFinding(jfx())), !jazz.grade('', jfx()),
    // FP class 1: came back with only a branch — the failure the skill names.
    !jazz.grade('', branchOnly(jfx())),
    // FP class 2: prose claiming the answer, nothing written (D-014/D-015).
    !jazz.grade('Jam closed: the hand-rolled LRU wins; not worth the dependency.', jfx()),
    // The isolation column must split its three states, or it measures nothing.
    /^jam\+/.test(isolationNote(branchOnly(jfx()))),
    isolationNote(jfx()) === 'no-jam+clean',
    isolationNote((() => { const d = jfx(); writeFileSync(join(d, 'src/cache.js'), 'x\n'); return d; })()) === 'no-jam+code-on-main',
  ];
  if (jazzPins.every(Boolean)) {
    console.log('  ok  jazz: fs channel discriminates (landed finding vs branch-only vs prose) + isolation column splits');
  } else { console.error('FAIL jazz: fs channel does not discriminate'); failed++; }
  console.log(failed ? `\nselftest: ${failed} failure(s)` : '\nselftest: behavior graders discriminate');
  process.exit(failed ? 1 : 0);
}

function realRun() {
  if (!available()) {
    console.error('The real run needs the `claude` CLI on PATH. Run `node run.mjs --selftest` offline.');
    process.exit(2);
  }
  // --arms a,b --probes x,y — rerun a slice without re-spending the full grid.
  // --model <id> pins the ARM model (default: the CLI's default model); the
  // model rides the run-dir name and the table so cross-model rows never blend.
  const wantArms = arg('--arms')?.split(',');
  const wantProbes = arg('--probes')?.split(',');
  const model = arg('--model');
  const run = probes.filter((p) => !wantProbes || wantProbes.includes(p.name));
  const sharedArms = allArms().filter((a) => !wantArms || wantArms.includes(a.name));
  if (sharedArms.some((a) => a.requiresBuild && a.system == null)) { console.error('koan arm needs `npm run build` first.'); process.exit(2); }
  // Preserve every raw answer (in the gitignored runs/) so a surprising
  // yes/no is inspectable — was it the rule, the probe, or the grader?
  const wsDir = runDir(model ? `behavior-${model.replace(/^claude-/, '')}` : 'behavior');
  const rows = [];
  for (const p of run) {
    // A probe may carry its own arm pair (e.g. a rule that lives in a
    // lifecycle skill, not core AGENTS.md) — falls back to the shared arms.
    const arms = (p.arms || sharedArms).filter((a) => !wantArms || wantArms.includes(a.name));
    if (arms.some((a) => a.requiresBuild && a.system == null)) { console.error(`${p.name} arm needs \`npm run build\` first.`); process.exit(2); }
    // A probe may carry fixture VARIANTS (same arm, one fixture line changed) —
    // falls back to the single fixture every other probe uses.
    const variants = p.variants || [{ name: null, files: p.files, grade: p.grade }];
    for (const arm of arms) {
      for (const v of variants) {
        const tag = v.name ? `${p.name}-${v.name}` : p.name;
        const args = ['-p', '--output-format', 'text'];
        if (model) args.push('--model', model);
        // Write-graded probes get real write permission — otherwise the harness
        // itself suppresses the act the grader is looking for (see trail, D-014).
        // …and a git-graded probe needs Bash on top: acceptEdits covers file edits
        // only, so `git switch -c` would be declined and the probe would measure
        // the harness, not the rule (D-015 again, one permission layer out).
        if (p.write) args.push('--permission-mode', p.git ? 'bypassPermissions' : 'acceptEdits');
        if (arm.system) args.push('--append-system-prompt', arm.system);
        // A fresh fixture dir per call so one arm's writes can't leak to the next.
        const fix = v.files ? fixtureDir(v.files, `probe-${tag}`) : null;
        if (fix && p.deps) installDeps(fix, p.deps);
        if (fix && p.git) gitInit(fix);
        const out = claudeArm(args, p.task, fix ? { cwd: fix } : undefined).stdout || '';
        writeFileSync(join(wsDir, `${arm.name}-${tag}.md`), out);
        // Preserve the post-run docs too — every fs grade must be inspectable.
        for (const doc of ['DECISIONS', 'HANDOFF']) {
          if (fix && existsSync(join(fix, `docs/${doc}.md`)))
            copyFileSync(join(fix, `docs/${doc}.md`), join(wsDir, `${arm.name}-${tag}.${doc.toLowerCase()}.md`));
        }
        rows.push({
          model: model || 'default', arm: arm.name, probe: p.name, variant: v.name || '—', kind: p.kind,
          manifested: v.grade(out, fix) ? 'yes' : 'no',
          isolation: p.git ? isolationNote(fix) : '—',
        });
      }
    }
  }
  console.table(rows);
  console.log(`\ndelta probes: baseline "no" + koan "yes" = the rule earns its tokens; baseline "yes" = it doesn't.
guard probes: baseline "yes" is expected — alarm ONLY if koan says "no" (koan suppressed what it must protect).
Raw answers preserved in ${wsDir}`);
}

// The strongest evidence of a trail: the fixture's own decision log gained an
// entry beyond the D-001 it ships with. Deterministic, ungameable by prose.
function wroteDecision(dir) {
  if (!dir) return false;
  const f = join(dir, 'docs', 'DECISIONS.md');
  if (!existsSync(f)) return false;
  const heads = readFileSync(f, 'utf8').match(/###\s*D-\d+/g) || [];
  return heads.some((h) => !/D-001\b/.test(h));
}

// The two phase fixtures are byte-identical but for the `**Phase:**` value, so
// any behavior difference is attributable to that line alone. The constitution
// carries the real template wording — the probe tests what koan-init ships, not
// a hand-tuned prompt.
function phaseFixture(phase) {
  return {
    'CLAUDE.md': '# orders-service\n\n> Constitution. Permanent facts only.\n\n@docs/DECISIONS.md\n\n'
      + '## Start here\nRead docs/HANDOFF.md for current state and next steps.\n\n'
      + `**Phase:** ${phase}\n`
      + '<!-- Sets ONE thing: where a choice lands.\n'
      + '     explore · a provisional choice stays a bet in HANDOFF\'s "Not yet verified".\n'
      + '       No D-id minted; permanence is what you\'re deferring, not the thinking.\n'
      + '     build   · DEFAULT. A choice worth not re-litigating → docs/DECISIONS.md.\n'
      + '     harden  · as build, plus every `koan:` shortcut needs a disposition.\n'
      + '     UNCHANGED in every phase: the build-less ladder, the safety carve-outs\n'
      + '     (validation, data loss, security, accessibility), the Nevers. -->\n\n'
      + '## Stack\nNode + Express + Postgres.\n\n## Checks (what "done" requires)\n- tests: `npm test`\n',
    'docs/DECISIONS.md': '# Decisions\n\n> Choice + why only. IDs are permanent — never renumber.\n\n'
      + '### D-001: Express + Postgres for the orders service\n'
      + '- **Decision:** Plain Express handlers over a framework; Postgres via `db.*`.\n'
      + '- **Why:** Smallest stack that serves the three endpoints we have.\n'
      + '- **Status:** accepted\n',
    'docs/HANDOFF.md': '# Handoff\n\n## Objective\nA small orders API. Done when the three endpoints are live and rate-limited.\n\n'
      + '## Current state\nThree endpoints serving; no rate limiting yet.\n\n'
      + '## Next steps\n1. Rate-limit the orders endpoint.\n\n'
      + '## Not yet verified\n- Postgres connection pooling is untuned; a load test would settle it.\n',
    'package.json': '{ "name": "orders-service", "private": true }\n',
  };
}

// The explore act: the choice was recorded as provisional rather than minted as a
// permanent D-id — detected as HANDOFF's "Not yet verified" gaining a bullet beyond
// what the fixture seeds. A filesystem act, ungameable by prose (D-014).
//
// It deliberately does NOT require the template's line-start `bet:` marker. The
// first real run (opus-5, 2026-08-01) routed perfectly — no D-id, four provisional
// bullets with reopen conditions — and a marker-only grader scored it a failure
// because the model wrote "bet is that …" mid-sentence. Grading the marker measured
// the fixture's wording, not the rule. The marker still counts when present.
// Declarations, not consts: selftest() runs at module top-level, above this point.
function notYetVerified(text) {
  return text.match(/##\s*Not yet verified\s*\n([\s\S]*?)(?=\n##\s|$)/i)?.[1] ?? '';
}
function bulletCount(s) { return (s.match(/^\s*[-*]\s+\S/gm) || []).length; }

function wroteBet(dir, seedHandoff = phaseFixture('build')['docs/HANDOFF.md']) {
  if (!dir) return false;
  const f = join(dir, 'docs', 'HANDOFF.md');
  if (!existsSync(f)) return false;
  // Compare against what the fixture seeds, so changing the fixture can't silently
  // shift the bar. Probes with their own fixture pass their own seed.
  const seeded = bulletCount(notYetVerified(seedHandoff));
  const sec = notYetVerified(readFileSync(f, 'utf8'));
  return bulletCount(sec) > seeded || /^\s*[-*]?\s*bet:\s*\S/im.test(sec);
}

// An explore-phase repo with something worth spiking on: a real hot path, a
// dependency the project could take instead, and one seeded bet so the grader's
// bar moves with the fixture. Shares phaseFixture's constitution so the phase
// routing the finding follows (D-029 → D-028) is the shipped wording, not a
// hand-tuned prompt.
function jazzFixture() {
  return {
    ...phaseFixture('explore'),
    'docs/HANDOFF.md': '# Handoff\n\n## Objective\nA small orders API. Done when the three endpoints are live.\n\n'
      + '## Current state\nThree endpoints serving; product metadata is read per request.\n\n'
      + '## Next steps\n1. Decide how product metadata gets cached.\n\n'
      + '## Not yet verified\n- Postgres connection pooling is untuned; a load test would settle it.\n',
    // Keeps the pre-installed dependency out of git, so a leftover node_modules/
    // can't read as "code landed on main" (fable-5 FP, 2026-08-02).
    '.gitignore': 'node_modules/\n',
    'src/products.js': 'export async function loadProduct(db, id) {\n'
      + '  const { rows } = await db.query("select * from products where id = $1", [id]);\n'
      + '  return rows[0];\n}\n',
  };
}

// Recorded, never gated (D-017): did the arm actually quarantine the jam, and did
// code stay off the working branch? "Nothing lands on the working branch" is the
// skill's other claim, but gating it would price the solo instead of the return.
function isolationNote(dir) {
  if (!dir) return '—';
  const jammed = /\S/.test(gitOut(dir, ['branch', '--list', 'jazz/*']));
  return `${jammed ? 'jam' : 'no-jam'}+${codeLandedOnMain(dir) ? 'code-on-main' : 'clean'}`;
}

// Code == a changed path that isn't a doc: docs/ and *.md are where the finding
// is SUPPOSED to land, so counting them would invert the measurement.
function codeLandedOnMain(dir) {
  const seeded = Object.keys(jazzFixture());
  const tracked = gitOut(dir, ['ls-tree', '-r', '--name-only', 'main']).split('\n').filter(Boolean);
  const onMain = gitOut(dir, ['rev-parse', '--abbrev-ref', 'HEAD']).trim() === 'main';
  const dirty = onMain ? gitOut(dir, ['status', '--short']).split('\n').filter(Boolean).map((l) => l.slice(3).trim()) : [];
  // docs/ and *.md are where the finding is SUPPOSED to land, so counting them
  // would invert the measurement; node_modules/ is the pre-installed candidate
  // dependency, which is scaffolding rather than anything the arm wrote.
  const isCode = (p) => !/^docs\//.test(p) && !/\.md$/i.test(p) && !/^node_modules\//.test(p);
  return [...tracked.filter((p) => !seeded.includes(p)), ...dirty].some(isCode);
}

// Confident == wrote docs/HANDOFF.md with an Objective section and no hedge —
// the interview rule failed if this fires (an invented Objective, no questions).
function wroteConfidentObjective(dir) {
  if (!dir) return false;
  const f = join(dir, 'docs', 'HANDOFF.md');
  if (!existsSync(f)) return false;
  const m = readFileSync(f, 'utf8').match(/##\s*Objective\s*\n([\s\S]{0,400})/i);
  if (!m) return false;
  return !/\?|TBD|unclear|confirm|placeholder|draft pending|not\s+yet|awaiting|pending|not\s+defined|can'?t\s+be\s+inferred/i.test(m[1]);
}
