#!/usr/bin/env node
// Install generated bundles. Plan and preflight every target before writing any.
import { existsSync, cpSync, mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { homedir } from 'node:os';

const DIST = join(dirname(fileURLToPath(import.meta.url)), 'dist');
const TARGETS = ['agents', 'claude', 'codex', 'both', 'user', 'plugin'];
const HELP = `Usage: node push.mjs [<project>] [--target claude|codex|both|agents|user|plugin] [--global] [--check] [--force]

  claude   All six skills in <project>/.claude/skills
  codex    All six skills in <project>/.agents/skills
  both     Both native skill bundles (no automatic hook)
  agents   Compact AGENTS.md only (legacy default)
  user     Alias for --target claude --global
  plugin   Claude plugin with SessionStart hook (legacy layout)

--global installs skills in your home directory instead of a project.
Without a project, plugin retains its legacy user-wide default.
--check reports drift without writes; --force overwrites changed files.
Native skill installs preserve project instructions and continuity docs.
The legacy agents target writes AGENTS.md; prefer --target codex for Codex skills.
Examples:
  node push.mjs /path/to/project --target both
  node push.mjs --target codex --global
  node push.mjs /path/to/project --target both --check`;

const stampOf = (path) => existsSync(path) && statSync(path).isFile()
  ? readFileSync(path, 'utf8').match(/<!-- koan v\S+ · build [0-9a-f]+ -->/)?.[0] ?? null : null;

const sameContent = (to, from) => {
  if (!existsSync(to)) return false;
  if (statSync(from).isDirectory()) {
    if (!statSync(to).isDirectory()) return false;
    const names = readdirSync(from).sort();
    return JSON.stringify(names) === JSON.stringify(readdirSync(to).sort())
      && names.every((name) => sameContent(join(to, name), join(from, name)));
  }
  return statSync(to).isFile()
    && readFileSync(to, 'utf8').replace(/\r\n/g, '\n') === readFileSync(from, 'utf8').replace(/\r\n/g, '\n');
};

const extraFiles = (to, from) => {
  if (!existsSync(to) || !statSync(to).isDirectory() || !statSync(from).isDirectory()) return [];
  return readdirSync(to).sort().flatMap((name) => {
    const dest = join(to, name), source = join(from, name);
    return existsSync(source) ? extraFiles(dest, source) : [dest];
  });
};

const statusOf = ({ to, from }) => {
  if (!existsSync(to)) return 'missing';
  if (sameContent(to, from)) return 'current';
  const marker = statSync(from).isDirectory() ? join(to, 'SKILL.md') : to;
  const sourceMarker = statSync(from).isDirectory() ? join(from, 'SKILL.md') : from;
  return stampOf(sourceMarker) && !stampOf(marker) ? 'unmanaged' : 'stale';
};

// home is injectable for offline user-scope tests; normal CLI uses the OS home.
export function main(args = process.argv.slice(2), { home = homedir() } = {}) {
  if (args.includes('--help') || args.includes('-h')) { console.log(HELP); return 0; }
  let target = 'agents', dest, global = false, check = false, force = false, selected = false;
  for (let i = 0; i < args.length; i++) {
    const value = args[i];
    if (value === '--target') {
      if (selected || !TARGETS.includes(args[i + 1])) { console.error(`--target requires one of: ${TARGETS.join(', ')}`); return 2; }
      target = args[++i]; selected = true;
    } else if (value === '--global') global = true;
    else if (value === '--check') check = true;
    else if (value === '--force') force = true;
    else if (value.startsWith('-') || dest) { console.error(`Unexpected argument: ${value}\n${HELP}`); return 2; }
    else dest = value;
  }
  if (target === 'user') { target = 'claude'; global = true; }
  if (target === 'plugin' && !dest) global = true;
  if ((global && dest) || (global && target === 'agents') || (!global && !dest)) {
    console.error(`Choose a project OR --global (agents requires a project).\n${HELP}`); return 2;
  }
  const base = global ? home : resolve(dest);
  if (!existsSync(base) || !statSync(base).isDirectory()) { console.error(`Install root is not a directory: ${base}`); return 2; }
  if (!existsSync(DIST)) { console.error('No dist/ — run npm run build first.'); return 2; }

  const units = [], extras = [], collisions = [];
  const add = (name, from, to) => units.push({ name, from, to });
  const skills = (host) => {
    const from = join(DIST, host, 'skills');
    const to = join(base, host === 'codex' ? '.agents' : '.claude', 'skills');
    if (host === 'claude' && existsSync(join(to, 'koan', '.claude-plugin'))) {
      collisions.push(`Claude plugin already exists at ${join(to, 'koan')}; use --target plugin to update it or remove that install before choosing loose skills.`);
    }
    const shipped = readdirSync(from);
    for (const name of shipped) add(`${host}/${name}`, join(from, name), join(to, name));
    collectExtras(to, shipped);
  };
  const collectExtras = (dir, shipped) => {
    if (!existsSync(dir)) return;
    for (const name of readdirSync(dir))
      if (!shipped.includes(name) && /^koan(?:-|$)/.test(name) && stampOf(join(dir, name, 'SKILL.md')))
        extras.push(join(dir, name));
  };

  if (target === 'agents') add('AGENTS.md', join(DIST, 'agents', 'AGENTS.md'), join(base, 'AGENTS.md'));
  else if (target === 'plugin') {
    const from = join(DIST, 'claude');
    const skillsDir = join(base, '.claude', 'skills');
    const to = join(skillsDir, 'koan');
    for (const name of existsSync(skillsDir) ? readdirSync(skillsDir) : [])
      if (/^koan(?:-|$)/.test(name) && existsSync(join(skillsDir, name, 'SKILL.md')))
        collisions.push(`Loose Claude skill exists at ${join(skillsDir, name)}; remove that install before choosing the plugin.`);
    for (const name of readdirSync(join(from, 'skills')))
      add(`plugin/${name}`, join(from, 'skills', name), join(to, 'skills', name));
    for (const name of ['hooks', '.claude-plugin']) add(`plugin/${name}`, join(from, name), join(to, name));
    collectExtras(join(to, 'skills'), readdirSync(join(from, 'skills')));
  } else {
    for (const host of target === 'both' ? ['claude', 'codex'] : [target]) skills(host);
  }

  if (collisions.length) { for (const message of collisions) console.error(message); return 1; }
  const rows = units.map((unit) => ({ ...unit, status: statusOf(unit) }));
  for (const extra of extras) console.error(`Extra retired skill: ${extra} — remove it manually.`);
  if (check) {
    if (rows.every((row) => row.status === 'missing') && !extras.length) {
      console.log(`koan is not installed in ${base} — nothing to check.`); return 0;
    }
    for (const row of rows) console.log(`  ${row.status.padEnd(9)} ${row.name}`);
    return rows.some((row) => row.status !== 'current') || extras.length ? 1 : 0;
  }
  const unmanaged = rows.filter((row) => row.status === 'unmanaged');
  if (unmanaged.length && !force) {
    for (const row of unmanaged) console.error(`${row.to} carries no koan build stamp; preserving project-owned content. Use native --target claude|codex|both to keep project instructions, or inspect and back up this path before explicitly replacing it.`);
    return 1;
  }
  const stale = rows.filter((row) => row.status === 'stale');
  if (stale.length && !force) {
    for (const row of stale) console.error(`${row.to} differs from this build. Review and back up local changes before updating; --force replaces shipped files.`);
    return 1;
  }
  let copied = 0;
  for (const row of rows) {
    if (row.status === 'current') continue;
    mkdirSync(dirname(row.to), { recursive: true });
    cpSync(row.from, row.to, { recursive: true });
    copied++;
  }
  // Copy overlays intentionally preserve unknown files. Report remaining drift;
  // --force never silently deletes local additions or retired skill directories.
  const remaining = units.filter((unit) => statusOf(unit) !== 'current');
  for (const row of remaining) {
    const extra = extraFiles(row.to, row.from);
    console.error(`Still differs after copying: ${row.to}${extra.length ? ` — preserved extra paths: ${extra.join(', ')}` : ' — inspect local file types/content.'}`);
  }
  console.log(`Installed ${target}: ${copied} unit(s) copied, ${rows.length - copied} already current in ${base}.`);
  if (target === 'plugin') console.log('Restart Claude Code or run /reload-plugins to load hook changes.');
  else if (target !== 'agents') console.log('Use /koan-init in Claude or $koan-init in Codex. Restart the host if skills do not appear.');
  return remaining.length || extras.length ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { process.exitCode = main(); }
  catch (error) { console.error(`Install failed: ${error.message}`); process.exitCode = 2; }
}
