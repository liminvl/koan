#!/usr/bin/env node
// Stage 0 — self-regression alarm. Free, offline, runs on every commit via
// hooks/pre-commit (and in CI when a remote exists).
// Checks: skill-token budgets, adherence canary, koan-lint on koan's own docs
// (+ pinned fixture shapes it doesn't have), trigger-surface routing, bundle
// self-containment, and the SessionStart hook's speak/stay-silent discrimination.
// Answers "did a new feature make the kit bigger without making it better?"
//   node benchmarks/selfcheck.mjs [--record]
import { readFileSync, existsSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runCanary } from '../build/canary.mjs';
import { lint } from '../src/lifecycle/lint.mjs';
import { runTriggers } from './triggers.mjs';
import { runLintFixtures } from './lint-fixtures.mjs';
import { fixtureDir } from './claude-cli.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const record = process.argv.includes('--record');
const errors = [];
const warnings = [];

// 1. Skill-token budgets + growth-vs-last-recorded.
const budgets = JSON.parse(readFileSync(join(ROOT, 'benchmarks/budgets.json'), 'utf8')).artifacts;
const histPath = join(ROOT, 'benchmarks/size-history.json');
const history = JSON.parse(readFileSync(histPath, 'utf8'));
const last = history[history.length - 1]?.sizes ?? {};
const sizes = {};
let distMissing = false;

for (const [rel, ceil] of Object.entries(budgets)) {
  const p = join(ROOT, rel);
  if (!existsSync(p)) { distMissing = true; errors.push(`Build artifact missing: ${rel} (run \`npm run build\`).`); continue; }
  const n = readFileSync(p, 'utf8').length;
  sizes[rel] = n;
  const tag = `${rel} ${n}/${ceil}`;
  if (n > ceil) errors.push(`OVER BUDGET: ${tag}. Raise the ceiling deliberately or trim.`);
  else if (last[rel] != null && n > last[rel]) warnings.push(`grew: ${rel} ${last[rel]} → ${n} (still under ${ceil}). Justify the addition.`);
  console.log(`  budget: ${tag}${last[rel] != null ? ` (was ${last[rel]})` : ''}`);
}

// 2. Adherence canary — load-bearing rules survived generation.
if (!distMissing) {
  const c = runCanary();
  if (!c.ok) for (const m of c.misses) errors.push(`canary: ${m}`);
  else console.log(`  canary: ${c.checked} invariants present in source + builds.`);
}

// 3. koan-lint on koan's own docs (dogfood — exercises the lose-less half).
const { errors: lErr, warnings: lWarn, budget } = lint(ROOT);
for (const e of lErr) errors.push(`lint: ${e}`);
for (const w of lWarn) warnings.push(`lint: ${w}`);
if (budget.length) console.log(`  lint: ${budget.join(' · ')}`);

// 3b. …and the checks must be seen DECIDING on shapes koan's own docs don't
// have. Dogfooding above only ever exercises one curated repo; every lint defect
// found in the field so far was invisible to it (see benchmarks/lint-fixtures.mjs).
{
  const { checked, failures } = runLintFixtures();
  if (!failures.length) console.log(`  lint: ${checked} pinned doc shapes discriminate.`);
  else for (const f of failures) errors.push(`lint fixture — ${f}`);
}

// 4. Trigger surfaces still route — pinned prompts rank their skill first,
// descriptions don't collide (see benchmarks/triggers.mjs).
if (!distMissing) {
  const t = runTriggers(ROOT);
  for (const e of t.errors) errors.push(e);
  if (!t.errors.length) console.log(`  triggers: ${t.checked} prompts routed over ${t.skills} skills.`);
}

// 5. (retired 2026-08-05) The ingest budget check. `ingest/` was frozen — seven
// ingests produced zero src changes — then deleted from the tree entirely
// (2026-08-07, D-041). Re-add it if external ingests resume.

// 6. Shipped skill dirs are self-contained — every .mjs a skill ships must LOAD
// from where it lands. Source imports always resolve (src/lifecycle/ holds both
// engines); an install is one dir per skill, so a missed copy only breaks there.
// Observed in the field: koan-lint shipped lint.mjs without the debt.mjs it
// imports, and `/koan-lint` was dead on arrival with nothing here to say so.
// The hook dir is an install unit on the same terms, so it is walked here too.
if (!distMissing) {
  const skillsDir = join(ROOT, 'dist/claude/skills');
  const units = [
    ...readdirSync(skillsDir).map((s) => `dist/claude/skills/${s}`),
    'dist/claude/hooks',
  ];
  let loaded = 0;
  for (const unit of units) {
    for (const f of readdirSync(join(ROOT, unit)).filter((f) => f.endsWith('.mjs'))) {
      try { await import(pathToFileURL(join(ROOT, unit, f)).href); loaded++; }
      catch (e) { errors.push(`bundle: ${unit}/${f} does not load as installed — ${e.message.split('\n')[0]}`); }
    }
  }
  if (loaded) console.log(`  bundle: ${loaded} shipped script(s) load standalone.`);
}

// 6b. The SessionStart hook must be seen DECIDING. It runs in every project on
// the machine, so its silence is as load-bearing as its output — and koan's own
// docs are clean, so nothing here would ever exercise the speaking path.
// Skipped when the hook doesn't LOAD — check 6 already named that, and a second
// report of the same fault (or worse, a crash) buries it. A module that loads
// but exports no `sessionStart` is a different fault check 6 can't see (the
// import succeeds), so that one is reported here rather than skipped.
let sessionStart = null, hookLoadFailed = false;
try { ({ sessionStart } = await import(pathToFileURL(join(ROOT, 'dist/claude/hooks/session-start.mjs')).href)); }
catch { hookLoadFailed = true; /* reported by check 6 */ }
if (!distMissing && !hookLoadFailed && !sessionStart)
  errors.push('hook: session-start.mjs loads but exports no sessionStart — check 6b cannot run.');
if (!distMissing && sessionStart) {
  const mk = (files) => fixtureDir(files ?? {}, 'hook');
  const clean = {
    'CLAUDE.md': '# p\n@docs/DECISIONS.md\n## Checks\nx\n',
    'docs/HANDOFF.md': '# Handoff\n## Objective\nx\n',
    'docs/DECISIONS.md': '# Decisions\n\n### D-001: a\n- **Status:** accepted\n',
    'docs/DECISIONS-archive.md': '# Archive\n',
  };
  const faulty = { ...clean, 'CLAUDE.md': '# p\n@docs/DECISIONS.md\n@docs/DECISIONS-archive.md\n## Checks\nx\n' };
  const spoke = sessionStart(mk(faulty));
  const pins = [
    // A project that doesn't use koan must never hear from the hook.
    sessionStart(mk(null)) === null,
    // Nor must a healthy one — additionalContext is a per-session token cost.
    sessionStart(mk(clean)) === null,
    // But a real fault has to reach the session, and stay inside the cap.
    typeof spoke === 'string' && spoke.includes('must stay out of context'),
    typeof spoke === 'string' && spoke.length <= 800,
  ];
  if (pins.every(Boolean)) console.log('  hook: SessionStart speaks on a fault, silent otherwise (4 pinned shapes).');
  else errors.push('hook: SessionStart does not discriminate — it spoke when clean, stayed silent on a fault, or overran its cap.');
}

// Report.
console.log('');
for (const e of errors) console.error(`ERROR: ${e}`);
for (const w of warnings) console.error(`WARN:  ${w}`);

if (record && !distMissing && errors.length === 0) {
  history.push({ date: new Date().toISOString().slice(0, 10), sizes });
  writeFileSync(histPath, JSON.stringify(history, null, 2) + '\n');
  console.log('recorded sizes to size-history.json');
}

const verdict = errors.length ? `${errors.length} error(s)` : warnings.length ? `${warnings.length} warning(s)` : 'clean';
console.log(`\nselfcheck: ${verdict}`);
process.exit(errors.length ? 2 : warnings.length ? 1 : 0);
