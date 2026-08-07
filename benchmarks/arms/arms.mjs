// The arms of the outcome A/B. Measure koan's DELTA vs a bare model and vs a
// cheap one-line prompt — designed so the benchmark CAN show koan adds nothing.
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

export function arms() {
  const agents = join(ROOT, 'dist', 'agents', 'AGENTS.md');
  const koan = existsSync(agents) ? readFileSync(agents, 'utf8') : null;
  return [
    { name: 'baseline', system: '' },
    { name: 'rival', system: 'Be concise and do not over-build. Prefer the standard library and one-line solutions.' },
    { name: 'koan', system: koan, requiresBuild: true },
  ];
}
