#!/usr/bin/env node
// Drop a built koan into an existing project.
//   node push.mjs <project-path> [--target claude|agents|user|plugin] [--force] [--check]
// agents (default): copies AGENTS.md to the project root.
// claude:           copies the skills into <project>/.claude/skills/.
// user:             copies the skills into ~/.claude/skills/ (no project path).
// plugin:           copies the whole build — skills AND the SessionStart hook —
//                   into <skills-dir>/koan/ as a skills-directory plugin. A
//                   project path selects that project's skills dir; omitting it
//                   selects ~/.claude/skills/, same rule as `user`. Hooks only
//                   load from a plugin, so this is the only target that ships them.
// Generated files carry a build stamp; an existing copy that matches the
// current build is skipped, one from another build is reported as stale.
// --check reports that comparison and writes nothing (exit 1 if anything drifted).
import { existsSync, cpSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const HERE = dirname(fileURLToPath(import.meta.url));
const DIST = join(HERE, 'dist');
const args = process.argv.slice(2);
const ti = args.indexOf('--target');
if (ti >= 0 && (!args[ti + 1] || args[ti + 1].startsWith('--'))) {
  console.error('--target requires a value: claude|agents|user|plugin'); process.exit(2);
}
const target = ti >= 0 ? args[ti + 1] : 'agents';
const force = args.includes('--force');
const check = args.includes('--check');
const dest = args.find((a, i) => !a.startsWith('--') && (ti < 0 || i !== ti + 1));

if (!dest && target !== 'user' && target !== 'plugin') { console.error('usage: node push.mjs <project-path> [--target claude|agents|user|plugin] [--force] [--check]'); process.exit(2); }
if (!existsSync(DIST)) { console.error('No dist/ — run `npm run build` first.'); process.exit(2); }
const project = dest ? resolve(dest) : null;
if (project && !existsSync(project)) { console.error(`Project path does not exist: ${project}`); process.exit(2); }

const stampOf = (p) =>
  (existsSync(p) ? readFileSync(p, 'utf8').match(/<!-- koan v\S+ · build [0-9a-f]+ -->/)?.[0] ?? null : null);

// --check: classify each destination against this build and write NOTHING. The stamp
// guard below already detects drift, but only a push can ask it; --check is the same
// comparison made answerable on demand. Exit 1 on any non-current copy so a hook or
// script can gate on it. See D-031 for why this lives here and not in selfcheck.
const statusOf = (to, from) =>
  !existsSync(to) ? 'missing'
    : ((h) => (!h ? 'unstamped' : h === stampOf(from) ? 'current' : 'stale'))(stampOf(to));

// Skill dirs the destination still carries that this build no longer ships. A copy
// overlays, it never cleans, so a deleted skill survives every re-push and keeps
// loading and routing. Comparing only the SOURCE list is blind to it — observed:
// koan-debt outlived its deletion while --check reported "All 6 current".
// Only koan's OWN dirs count; a shared skills dir holds other people's skills too.
const extrasIn = (dir, shipped) =>
  (existsSync(dir) ? readdirSync(dir) : [])
    .filter((d) => !shipped.includes(d) && /^koan(-|$)/.test(d) && stampOf(join(dir, d, 'SKILL.md')));

// Drift is measured only against surfaces the destination ACTUALLY adopted: nothing
// installed at all is a choice, not rot, and reporting it teaches you to ignore the
// check (D-025's false-positive lesson). A *partial* install is real drift.
const reportDrift = (rows, where, extras = []) => {
  if (rows.every(([, st]) => st === 'missing') && !extras.length) {
    console.log(`koan is not installed in ${where} — nothing to check.`);
    process.exit(0);
  }
  for (const [name, st] of rows) console.log(`  ${st.padEnd(9)} ${name}`);
  for (const name of extras) console.log(`  ${'extra'.padEnd(9)} ${name} — not in this build; delete it`);
  const drifted = rows.filter(([, st]) => st !== 'current');
  const bad = drifted.length + extras.length;
  console.log(bad
    ? `\n${drifted.length}/${rows.length} not current${extras.length ? ` · ${extras.length} extra` : ''} in ${where}${drifted.length ? ' — re-push with --force' : ''}.`
    : `\nAll ${rows.length} current in ${where}.`);
  process.exit(bad ? 1 : 0);
};

// After a push: name what the copy could not remove. This is the moment the orphan
// is created, and the person is already looking here.
const warnExtras = (extras, where) => {
  if (!extras.length) return;
  console.error(`\n${extras.length} skill dir(s) in ${where} are not in this build — delete by hand:`);
  for (const d of extras) console.error(`  ${join(where, d)}`);
};

if (target === 'agents') {
  const from = join(DIST, 'agents', 'AGENTS.md');
  const to = join(project, 'AGENTS.md');
  if (check) reportDrift([['AGENTS.md', statusOf(to, from)]], project);
  if (existsSync(to) && !force) {
    const have = stampOf(to);
    if (have && have === stampOf(from)) { console.log(`${to} already matches this build — nothing to do.`); process.exit(0); }
    console.error(have
      ? `${to} is from another koan build (${have}). Re-run with --force to update it.`
      : `${to} exists and carries no koan build stamp. Re-run with --force to overwrite.`);
    process.exit(1);
  }
  cpSync(from, to);
  console.log(`Pushed AGENTS.md → ${to}`);
} else if (target === 'claude' || target === 'user') {
  const skillsFrom = join(DIST, 'claude', 'skills');
  const skillsTo = target === 'user' ? join(homedir(), '.claude', 'skills') : join(project, '.claude', 'skills');
  const shipped = readdirSync(skillsFrom);
  if (check) reportDrift(
    shipped.map((s) => [s, statusOf(join(skillsTo, s, 'SKILL.md'), join(skillsFrom, s, 'SKILL.md'))]),
    skillsTo, extrasIn(skillsTo, shipped));
  mkdirSync(skillsTo, { recursive: true });
  let pushed = 0, current = 0;
  for (const s of readdirSync(skillsFrom)) {
    const to = join(skillsTo, s);
    if (existsSync(to) && !force) {
      const have = stampOf(join(to, 'SKILL.md'));
      if (have && have === stampOf(join(skillsFrom, s, 'SKILL.md'))) { current++; continue; }
      console.error(have
        ? `${to} is from another koan build (${have}). Re-run with --force to update.`
        : `${to} exists and carries no koan build stamp. Re-run with --force to overwrite.`);
      process.exit(1);
    }
    cpSync(join(skillsFrom, s), to, { recursive: true });
    pushed++;
  }
  console.log(`Pushed ${pushed} skill(s) → ${skillsTo}${current ? ` (${current} already current)` : ''}`);
  warnExtras(extrasIn(skillsTo, shipped), skillsTo);
} else if (target === 'plugin') {
  const from = join(DIST, 'claude');
  const skillsDir = project ? join(project, '.claude', 'skills') : join(homedir(), '.claude', 'skills');
  const to = join(skillsDir, 'koan');
  const shipped = readdirSync(join(from, 'skills'));
  const rows = shipped
    .map((s) => [s, statusOf(join(to, 'skills', s, 'SKILL.md'), join(from, 'skills', s, 'SKILL.md'))]);
  const extras = extrasIn(join(to, 'skills'), shipped);
  // The flat layout (loose koan-* skill dirs) and the plugin layout both provide
  // every skill; installing both double-lists all seven. Refuse rather than
  // delete — removing files a user installed is their call, not koan's — and
  // name the exact paths so the fix is one command. A plugin dir has no SKILL.md
  // at its root, so it never matches itself.
  const loose = (existsSync(skillsDir) ? readdirSync(skillsDir) : [])
    .filter((d) => /^koan(-|$)/.test(d) && stampOf(join(skillsDir, d, 'SKILL.md')));
  if (check) {
    if (loose.length) console.log(`  ${'flat'.padEnd(9)} ${loose.length} loose koan skill dir(s) in ${skillsDir} — remove before pushing the plugin.`);
    reportDrift(rows, to, extras);
  }

  if (loose.length) {
    console.error(`The flat koan install is still in ${skillsDir}; both layouts provide the same skills.`);
    console.error('Remove these first, then re-run:');
    for (const d of loose) console.error(`  ${join(skillsDir, d)}`);
    process.exit(1);
  }

  if (existsSync(to) && !force) {
    const drifted = rows.filter(([, st]) => st !== 'current');
    if (!drifted.length) {
      console.log(`${to} already matches this build — nothing to do.`);
      warnExtras(extras, join(to, 'skills'));
      process.exit(extras.length ? 1 : 0);
    }
    console.error(`${to} is from another koan build (${drifted.length}/${rows.length} not current). Re-run with --force to update.`);
    process.exit(1);
  }
  mkdirSync(skillsDir, { recursive: true });
  cpSync(from, to, { recursive: true });
  console.log(`Pushed the koan plugin (${rows.length} skills + SessionStart hook) → ${to}`);
  console.log('Restart Claude Code (or /reload-plugins) — hook changes do not hot-reload.');
  warnExtras(extrasIn(join(to, 'skills'), shipped), join(to, 'skills'));
} else {
  console.error(`Unknown target: ${target} (use claude, agents, user, or plugin)`); process.exit(2);
}
