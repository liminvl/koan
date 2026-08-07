// Shared build helpers. One source of truth: src/*.skill.md → generated targets.
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, copyFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const SRC = join(ROOT, 'src');
export const DIST = join(ROOT, 'dist');
export const VERSION = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).version;

// Stamp a generated markdown artifact with version + content hash, so a copy
// pushed into a project can be told apart from the current build (push.mjs
// compares stamps to report stale copies instead of a bare "exists").
export function stampMd(content, extra = '') {
  const hash = createHash('sha256').update(content + extra).digest('hex').slice(0, 8);
  return `${content.replace(/\n*$/, '\n')}<!-- koan v${VERSION} · build ${hash} -->`;
}

// Re-stamp an already-written SKILL.md over the FINISHED contents of its dir.
// The stamp has to cover every file the skill ships (templates, engines) —
// those carry no stamp of their own, so a bundled-file-only change would
// otherwise read as "already current" to push. Hashing the directory after it
// is written, rather than hand-listing what each skill bundles, is what makes
// that impossible to get wrong: adding a file to a skill needs no build change.
export function restampDir(dir, alsoDirs = []) {
  const skill = join(dir, 'SKILL.md');
  const body = readFileSync(skill, 'utf8').replace(/\n*<!-- koan v[^>]*-->\n*$/, '\n');
  const h = createHash('sha256');
  for (const d of [dir, ...alsoDirs])
    for (const rel of filesUnder(d).sort()) {
      if (d === dir && rel === 'SKILL.md') continue;   // its own body is hashed separately
      // Newlines normalized before hashing, same as readSkill: a Windows checkout
      // with autocrlf has different BYTES for identical content, and a stamp that
      // moves with the checkout reports every install stale on the other platform.
      h.update(rel).update(readFileSync(join(d, rel), 'utf8').replace(/\r\n/g, '\n'));
    }
  writeFileSync(skill, stampMd(body, h.digest('hex')));
}

// Relative paths of every file under `dir`, recursively. Sorted by the caller:
// readdirSync order is filesystem-dependent and this feeds a hash that must not
// vary by machine.
function filesUnder(dir, prefix = '') {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...filesUnder(join(dir, e.name), rel));
    else out.push(rel);
  }
  return out;
}

const CORE_START = '<!-- koan:core:start -->';
const CORE_END = '<!-- koan:core:end -->';

export function readSkill(path) {
  const raw = readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error(`${path}: missing frontmatter`);
  const front = m[1];
  const body = m[2].trim();
  const name = (front.match(/^name:\s*(.+)$/m) || [])[1]?.trim();
  if (!name) throw new Error(`${path}: frontmatter has no name`);
  return { raw, front, body, name };
}

// The compact core between markers — what compact targets (AGENTS.md, rule files) ship.
export function extractCore(body) {
  const s = body.indexOf(CORE_START);
  const e = body.indexOf(CORE_END);
  if (s < 0 || e < 0) throw new Error('source is missing koan:core markers');
  return body.slice(s + CORE_START.length, e).trim();
}

export const listSources = () => ({
  core: join(SRC, 'koan.skill.md'),
  // Sorted: readdirSync order is filesystem-dependent, and this order reaches
  // build output (plugin.json's skills array), which must not vary by machine.
  lifecycle: readdirSync(join(SRC, 'lifecycle'))
    .filter((f) => f.endsWith('.skill.md'))
    .sort()
    .map((f) => join(SRC, 'lifecycle', f)),
  templates: join(SRC, 'templates'),
  lintEngine: join(SRC, 'lifecycle', 'lint.mjs'),
  debtEngine: join(SRC, 'lifecycle', 'debt.mjs'),
  // The SessionStart hook lives beside lint.mjs so `./lint.mjs` resolves the
  // same way in src/ and in the install — D-034's whole point.
  hookEngine: join(SRC, 'lifecycle', 'session-start.mjs'),
});

export function write(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content.replace(/\n*$/, '\n'));
}

export function copy(from, to) {
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(from, to);
}

export function cleanDist() {
  if (existsSync(DIST)) rmSync(DIST, { recursive: true, force: true });
}
