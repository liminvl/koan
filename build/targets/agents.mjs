// Universal target: a compact AGENTS.md from the core marker block.
// Works in any tool that reads AGENTS.md (and is the body other rule files copy).
import { join } from 'node:path';
import { readSkill, listSources, extractCore, write, stampMd, DIST } from '../lib.mjs';

export function buildAgents() {
  const { body } = readSkill(listSources().core);
  const core = extractCore(body);
  const content = `# Koan — build less, lose less

You are a zen craftsperson tending a codebase. Build no more than the moment
needs; leave the next session a teaching, not a transcript.

${core}

---
Generated from koan's source of truth (src/koan.skill.md). The full skill and
the session-boundary rituals (init/wrap/readback/lint) live in the koan plugin.
Edit the source, not this file.
`;
  const stamped = stampMd(content);
  write(join(DIST, 'agents', 'AGENTS.md'), stamped);
  return { target: 'agents', chars: stamped.length };
}
