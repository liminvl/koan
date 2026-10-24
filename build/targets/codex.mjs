// Native Codex skill directories, installed under .agents/skills.
import { join } from 'node:path';
import { listSources, readSkill, DIST } from '../lib.mjs';
import { buildSkill } from '../skills.mjs';

export function renderCodex(text, skillName) {
  if (skillName === 'koan-init') {
    const start = text.indexOf('## 2. Wire the import');
    const end = text.indexOf('\n## 3.', start);
    if (start < 0 || end < 0) throw new Error('koan-init wiring section moved; update the Codex adapter');
    text = text.slice(0, start) + `## 2. Wire the read instructions
AGENTS.md explicitly says: \`Read docs/DECISIONS.md at session start.\`
Do not use \`@\` imports. Never auto-load the archive.
If the existing Claude constitution is primary, create only an AGENTS.md bridge:
\`Read __CLAUDE_ENTRY__ and docs/DECISIONS.md at session start.\`
If both files exist, preserve their content and reconcile wiring; don't duplicate facts.
` + text.slice(end);
  }
  return text
    .replace(/^argument-hint:.*\n/gm, '')
    .replaceAll('CLAUDE.md (or AGENTS.md)', 'AGENTS.md')
    .replaceAll('**CLAUDE.md** (or AGENTS.md)', '**AGENTS.md**')
    .replaceAll('CLAUDE.md/AGENTS.md', 'AGENTS.md')
    .replaceAll('`CLAUDE.md` (or `AGENTS.md`)', '`AGENTS.md`')
    .replaceAll('CLAUDE.md', 'AGENTS.md')
    .replaceAll('lean, auto-loaded decision log', 'lean active decision log')
    .replaceAll('Auto-loaded every session', 'Read at session start')
    .replaceAll("Read each session via the constitution's import or read instruction", "Read each session via the constitution's read instruction")
    .replace(/^@docs\/DECISIONS\.md$/gm, 'Read docs/DECISIONS.md at session start; open archived entries only when needed.')
    .replace(/<!-- AGENTS\.md \/ hosts without imports:[\s\S]*?-->/g, '')
    .replaceAll(', \"/koan-checkpoint\"', '')
    .replace(/\/koan(?:-[a-z]+)?\b/g, (name) => '$' + name.slice(1))
    .replaceAll('__CLAUDE_ENTRY__', 'CLAUDE.md');
}

export function buildCodex() {
  const src = listSources();
  const skills = [src.core, ...src.lifecycle].map((path) => {
    const { name } = readSkill(path);
    return buildSkill(path, join(DIST, 'codex', 'skills', name), {
      render: renderCodex,
      templateName: (name) => name === 'CLAUDE.md' ? 'AGENTS.md' : name,
    });
  });
  return { target: 'codex', skills };
}
