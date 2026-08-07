// Canary: load-bearing rules must survive into every generated build. A reword
// that silently drops one trips this — the reminder to propagate it everywhere.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, DIST } from './lib.mjs';

// In the compact core block → must reach BOTH the full skill and AGENTS.md.
const CORE = [
  'The best code is the code you never wrote',
  'Leave the next session a map, not a maze',
  'One fact, one home',
  'Snapshot, not diary',
  'Does this need to exist at all',
  'root cause, not symptom',
  'flimsier algorithm',
  'input validation at trust boundaries',
  'drop a safety carve-out',
  'Lazy code without its check is unfinished',
];

// Full-skill-only → must reach the full skill (not the compact body).
const FULL = [
  'Read fully, then be lazy',
];

const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null);

export function runCanary() {
  const source = read(join(ROOT, 'src', 'koan.skill.md')) ?? '';
  const claudeSkill = read(join(DIST, 'claude', 'skills', 'koan', 'SKILL.md'));
  const agents = read(join(DIST, 'agents', 'AGENTS.md'));

  const misses = [];
  const need = (phrase, label, text) => {
    if (text == null) misses.push(`${label} missing (run build first): "${phrase}"`);
    else if (!text.includes(phrase)) misses.push(`${label} dropped: "${phrase}"`);
  };

  for (const phrase of CORE) {
    need(phrase, 'source', source);
    need(phrase, 'dist/claude SKILL', claudeSkill);
    need(phrase, 'dist/agents AGENTS', agents);
  }
  for (const phrase of FULL) {
    need(phrase, 'source', source);
    need(phrase, 'dist/claude SKILL', claudeSkill);
  }

  return { ok: misses.length === 0, misses, checked: CORE.length + FULL.length };
}
