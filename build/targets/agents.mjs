// Universal target: a compact AGENTS.md from the core marker block.
// Works in any tool that reads AGENTS.md (and is the body other rule files copy).
import { join } from 'node:path';
import { readSkill, listSources, extractCore, write, stampMd, DIST } from '../lib.mjs';

export function buildAgents() {
  const { body } = readSkill(listSources().core);
  const core = extractCore(body);
  const content = `# Koan — build less, lose less

Read CLAUDE.md and docs/DECISIONS.md at session start when present; read
docs/HANDOFF.md before work. This generated skill is not a project constitution.

${core}

---
Generated from koan's source of truth (src/koan.skill.md). The full skill and
the lifecycle skills ship in the native Claude/Codex bundles.
Edit the source, not this file.
`;
  const stamped = stampMd(content);
  write(join(DIST, 'agents', 'AGENTS.md'), stamped);
  return { target: 'agents', chars: stamped.length };
}
