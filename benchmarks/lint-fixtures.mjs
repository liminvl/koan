// Stage 0 — lint fixtures. The checks must be seen DECIDING on doc shapes koan's
// own repo does not have.
//
// Why this exists: three times now, something verified only against koan itself
// broke everywhere else. D-025 found the routing surface unasserted; D-034 found
// `/koan-lint` dead on arrival in every consuming repo while every gate stayed
// green; and on 2026-08-05 the first real field survey found three lint defects
// at once (check 5 read any dotted code span as a path, check 4 ignored the
// `<repo>:D-nnn` escape check 10 advertises, and a ceiling lowered on koan's
// evidence fired on two healthy consumers). Each got a one-off fix; the pattern
// did not. Dogfooding can only ever exercise the shapes koan's docs happen to
// take, and koan's docs are kept clean — so the checks that matter most to a
// consumer are exactly the ones dogfooding cannot reach.
//
// A pin is a doc shape plus what the linter must say about it. NEGATIVE pins
// (`silent`) carry as much weight as positive ones: every defect above was a
// check firing on a healthy shape, not a check missing a fault, and a warning
// that fires on healthy repos teaches the reader to skip the check entirely
// (D-019's revisit-if). Offline, no API cost.
import { lint } from '../src/lifecycle/lint.mjs';
import { fixtureDir, gitInit } from './claude-cli.mjs';

// The shape a healthy consumer repo has: wired, sectioned, one open decision.
// Every pin below is this plus one deviation, so a failure names one cause.
const BASE = {
  'CLAUDE.md': '# p\n@docs/DECISIONS.md\n\n## Checks\n- test: `npm test`\n',
  'docs/HANDOFF.md': '# Handoff\n\n## Objective\nA thing.\n\n## Current state\nWorking.\n',
  'docs/DECISIONS.md': '# Decisions\n\n### D-001: a\n- **Status:** accepted\n\n## Archived decisions index\n',
  'docs/DECISIONS-archive.md': '# Archive\n',
};

const with_ = (over) => ({ ...BASE, ...over });
const old = '2026-01-01'; // safely past check 9's 14-day gate
const settled = (id, extra = '') =>
  `### ${id}: t\n- **Status:** implemented · ${old}\n${extra}`;

// A domain-set shape (check 4's index parity) — its own base, since it needs
// the set file, the index section, and the entry to agree.
const SETS = {
  ...BASE,
  'docs/DECISIONS.md':
    '# Decisions\n\n### D-001: a\n- **Status:** accepted\n\n' +
    '## Domain decision sets\n- **bench** — D-002\n\n## Archived decisions index\n',
  'docs/DECISIONS-bench.md': '# bench\n\n### D-002: b\n- **Status:** accepted\n',
};

const PINS = [
  // ---- the healthy shape says nothing at all ------------------------------
  { name: 'clean consumer shape', files: BASE, clean: true },
  { name: 'clean domain-set shape', files: SETS, clean: true },

  // ---- check 2: import wiring --------------------------------------------
  { name: 'archive imported into context',
    files: with_({ 'CLAUDE.md': BASE['CLAUDE.md'] + '@docs/DECISIONS-archive.md\n' }),
    fires: 'imports the archive' },
  { name: 'domain set imported into context',
    files: { ...SETS, 'CLAUDE.md': BASE['CLAUDE.md'] + '@docs/DECISIONS-bench.md\n' },
    fires: 'must stay out of context' },
  { name: 'log never imported',
    files: with_({ 'CLAUDE.md': '# p\n\n## Checks\n- test: `npm test`\n' }),
    fires: 'does not import @docs/DECISIONS.md' },

  // ---- check 3: budgets ---------------------------------------------------
  { name: 'oversize log warns',
    files: with_({ 'docs/DECISIONS.md': BASE['docs/DECISIONS.md'] + '\n<!--' + 'x'.repeat(31_000) + '-->\n' }),
    fires: 'Archive settled entries' },

  // ---- check 4: decision-ID integrity ------------------------------------
  // The escape check 10 advertises. A qualified ID belongs to another repo's log
  // and cannot resolve here; the linter used to recommend a fix that did nothing.
  { name: 'cross-repo citation in the main log is not a phantom',
    files: with_({ 'docs/DECISIONS.md': BASE['docs/DECISIONS.md'].replace('- **Status:** accepted', '- **Status:** accepted\n- **Why:** follows hostinger:D-006.') }),
    silent: 'resolves to no entry' },
  { name: 'unqualified unknown citation warns',
    files: with_({ 'docs/DECISIONS.md': BASE['docs/DECISIONS.md'].replace('- **Status:** accepted', '- **Status:** accepted\n- **Why:** follows D-099.') }),
    fires: 'Citation D-099 resolves to no entry' },
  { name: 'archived entry with no index stub',
    files: with_({ 'docs/DECISIONS-archive.md': '# Archive\n\n### D-002: b\n- **Status:** implemented\n' }),
    fires: 'has no stub in the main' },
  { name: 'index stub with no archived entry',
    files: with_({ 'docs/DECISIONS.md': BASE['docs/DECISIONS.md'] + '- **D-002** — b — implemented · archived\n' }),
    fires: 'has no full entry in DECISIONS-archive.md' },
  { name: 'same ID with two full entries',
    files: with_({ 'docs/DECISIONS-archive.md': '# Archive\n\n### D-001: dup\n' }),
    fires: 'more than one place' },
  { name: 'set entry missing from the index',
    files: { ...SETS, 'docs/DECISIONS.md': SETS['docs/DECISIONS.md'].replace('- **bench** — D-002\n', '') },
    fires: 'not listed in "Domain decision sets"' },
  { name: 'index promising an entry no set provides',
    files: { ...SETS, 'docs/DECISIONS-bench.md': '# bench\n' },
    fires: 'has no full entry in any set' },

  // ---- check 5: canonical-example paths ----------------------------------
  // This section is prose-rich by design, so the false-positive pins are the
  // load-bearing ones: 15 of 16 warnings in one field repo were noise, all from
  // reading a dotted inline-code span as a path.
  { name: 'a type field is not a path',
    files: with_({ 'CLAUDE.md': BASE['CLAUDE.md'] + '\n## Canonical examples\n- the discriminated union `EffectRef.kind` and its `Result.ok` flag\n' }),
    silent: 'Canonical example path' },
  { name: 'a bare filename is not a path',
    files: with_({ 'CLAUDE.md': BASE['CLAUDE.md'] + '\n## Canonical examples\n- vitest pattern: `slots.test.ts`\n' }),
    silent: 'Canonical example path' },
  { name: 'a path that exists is not reported',
    files: with_({ 'CLAUDE.md': BASE['CLAUDE.md'] + '\n## Canonical examples\n- the log: `docs/DECISIONS.md`\n' }),
    silent: 'Canonical example path' },
  { name: 'a dead in-repo path warns',
    files: with_({ 'CLAUDE.md': BASE['CLAUDE.md'] + '\n## Canonical examples\n- gone: `docs/nope.ts`\n' }),
    fires: 'does not exist: docs/nope.ts' },
  { name: 'a sibling-repo path gets the sibling wording',
    files: with_({ 'CLAUDE.md': BASE['CLAUDE.md'] + '\n## Canonical examples\n- copy from `rtime/src/lib/slots.ts`\n' }),
    fires: 'looks like a sibling-repo path' },

  // ---- check 7: required sections ----------------------------------------
  { name: 'HANDOFF without an Objective',
    files: with_({ 'docs/HANDOFF.md': '# Handoff\n\n## Current state\nWorking.\n' }),
    fires: 'no ## Objective' },
  { name: 'constitution without Checks',
    files: with_({ 'CLAUDE.md': '# p\n@docs/DECISIONS.md\n' }),
    fires: 'no ## Checks' },

  // ---- check 9: archive candidates ---------------------------------------
  // koan's own log is curated, so every branch here is unreachable by dogfood.
  { name: 'settled, old, uncited entry is a candidate',
    files: with_({ 'docs/DECISIONS.md': `# Decisions\n\n${settled('D-002')}\n\n## Archived decisions index\n` }),
    fires: 'D-002 is implemented' },
  { name: '…but not when it claims a Load-bearing seat',
    files: with_({ 'docs/DECISIONS.md': `# Decisions\n\n${settled('D-002', '- **Load-bearing:** the deploy path reads it.\n')}\n\n## Archived decisions index\n` }),
    silent: 'archive candidate' },
  { name: '…nor when another entry cites it',
    files: with_({ 'docs/DECISIONS.md': `# Decisions\n\n${settled('D-002')}\n\n### D-003: c\n- **Status:** accepted\n- **Why:** extends D-002.\n\n## Archived decisions index\n` }),
    silent: 'archive candidate' },
  { name: '…nor when HANDOFF cites it',
    files: with_({
      'docs/DECISIONS.md': `# Decisions\n\n${settled('D-002')}\n\n## Archived decisions index\n`,
      'docs/HANDOFF.md': BASE['docs/HANDOFF.md'] + '\nThe deploy path follows D-002.\n',
    }),
    silent: 'archive candidate' },
  { name: '…nor inside the 14-day gate',
    files: with_({ 'docs/DECISIONS.md': `# Decisions\n\n### D-002: t\n- **Status:** implemented · ${new Date().toISOString().slice(0, 10)}\n\n## Archived decisions index\n` }),
    silent: 'archive candidate' },
  { name: '…nor in the explore phase',
    files: with_({
      'CLAUDE.md': '# p\n**Phase:** explore\n@docs/DECISIONS.md\n\n## Checks\n- test: `npm test`\n',
      'docs/DECISIONS.md': `# Decisions\n\n${settled('D-002')}\n\n## Archived decisions index\n`,
    }),
    silent: 'archive candidate' },

  // ---- check 10: phantom IDs in planning docs -----------------------------
  { name: 'planning doc citing an unknown ID',
    files: with_({ 'docs/PLAN.md': '# Plan\nPer D-099 we ship the cache.\n' }),
    fires: 'cites D-099' },
  { name: 'planning doc citing another repo, qualified',
    files: with_({ 'docs/PLAN.md': '# Plan\nPer hostinger:D-006 the DB is shared.\n' }),
    silent: 'cites' },
  { name: 'planning doc declaring a decision heading',
    files: with_({ 'docs/PLAN.md': '# Plan\n\n### D-001: a\n' }),
    fires: 'declares a decision heading' },
];

// Pins that need the fixture to BE a repo: checks 6, 11 and 12 read git, and
// skip silently outside one — so without a real repo they would pass vacuously.
const GIT_PINS = [
  // Check 11 is the one demonstrably written AROUND: HANDOFF once recorded a
  // line "written to dodge check 11" that went stale within the hour. The
  // section scoping is what makes writing the truth cheaper than dodging, so
  // both halves are pinned.
  { name: 'stale "uncommitted" claim in Current state',
    files: with_({ 'docs/HANDOFF.md': '# Handoff\n\n## Objective\nA thing.\n\n## Current state\nThe parser rewrite is uncommitted.\n' }),
    fires: 'outlived its commit' },
  { name: '…but the same word in Next steps is description, not a claim',
    files: with_({ 'docs/HANDOFF.md': '# Handoff\n\n## Objective\nA thing.\n\n## Current state\nWorking.\n\n## Next steps\n1. Commit the uncommitted doc fixes.\n' }),
    silent: 'outlived its commit' },
  // Check 12 has never run in this repo: koan's own phase is `build`.
  { name: 'harden phase counts undisposed koan: shortcuts',
    files: with_({
      'CLAUDE.md': '# p\n**Phase:** harden\n@docs/DECISIONS.md\n\n## Checks\n- test: `npm test`\n',
      'src/a.mjs': '// koan: skipped the cache until a second caller appears\nexport const a = 1;\n',
    }),
    fires: 'shortcut remains without a disposition' },
  { name: '…and a `koan:` inside a string literal is a mention, not a debt',
    files: with_({
      'CLAUDE.md': '# p\n**Phase:** harden\n@docs/DECISIONS.md\n\n## Checks\n- test: `npm test`\n',
      'src/a.mjs': "export const help = 'write // koan: <note> to record a shortcut';\n",
    }),
    silent: 'without a disposition' },
  // A shortcut whose note cites the decision that took it IS dispositioned —
  // otherwise check 12 offers "accept" with nothing behind it, and the only way
  // past the gate is deleting the marker, which throws the note away.
  { name: '…and a shortcut citing its decision is dispositioned',
    files: with_({
      'CLAUDE.md': '# p\n**Phase:** harden\n@docs/DECISIONS.md\n\n## Checks\n- test: `npm test`\n',
      'src/a.mjs': '// koan: in-memory until a deploy target exists (D-001).\nexport const a = 1;\n',
    }),
    silent: 'without a disposition' },
  // A commit hash in `## Current state` is deliberately NOT checked — see the
  // check 13 retirement note in lint.mjs and D-039. Pinning silence here would
  // read as a rule ("hashes are fine"), which is the opposite of what was found.
  { name: '…but citing a decision that does not exist still gates',
    files: with_({
      'CLAUDE.md': '# p\n**Phase:** harden\n@docs/DECISIONS.md\n\n## Checks\n- test: `npm test`\n',
      'src/a.mjs': '// koan: skipped the cache, no idea why\nexport const a = 1;\n',
      'docs/PLAN.md': '# Plan\nSee D-001.\n',
    }),
    fires: 'shortcut remains without a disposition' },
];

export function runLintFixtures() {
  const failures = [];
  const run = (pin, dir) => {
    const { errors, warnings } = lint(dir);
    const said = [...errors, ...warnings];
    const has = (needle) => said.some((m) => m.includes(needle));
    if (pin.clean && said.length)
      failures.push(`${pin.name}: a healthy shape produced ${said.length} message(s) — ${said[0]}`);
    if (pin.fires && !has(pin.fires))
      failures.push(`${pin.name}: expected a message containing "${pin.fires}", got ${said.length ? said.join(' | ') : 'silence'}`);
    if (pin.silent && has(pin.silent))
      failures.push(`${pin.name}: fired on a healthy shape — ${said.find((m) => m.includes(pin.silent))}`);
  };

  for (const pin of PINS) run(pin, fixtureDir(pin.files, 'lintfix'));
  // gitInit commits the whole fixture, so the tree is clean and every file is
  // tracked — which is exactly the state check 11 ("claims uncommitted work but
  // the tree is clean") and check 12 (`git ls-files`) need to reach at all.
  for (const pin of GIT_PINS) run(pin, gitInit(fixtureDir(pin.files, 'lintfix-git')));
  return { checked: PINS.length + GIT_PINS.length, failures };
}

// Run standalone to see the pins listed: `node benchmarks/lint-fixtures.mjs`.
// selfcheck calls runLintFixtures() directly.
if (process.argv[1]?.endsWith('lint-fixtures.mjs')) {
  const { checked, failures } = runLintFixtures();
  for (const f of failures) console.error(`FAIL: ${f}`);
  console.log(`lint-fixtures: ${checked} pinned shapes, ${failures.length || 'all'} ${failures.length ? 'failed' : 'held'}.`);
  process.exit(failures.length ? 2 : 0);
}
