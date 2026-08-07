#!/usr/bin/env node
// Build every target from the single source.
// Two targets is the intended set, not a shortcut: Cursor, Copilot and Codex all
// read AGENTS.md natively, so an adapter for them would generate a file nothing
// reads. Add one under targets/ only for a tool that demonstrably does NOT read
// AGENTS.md — verify per-tool first (D-002).
import { cleanDist } from './lib.mjs';
import { buildClaude } from './targets/claude.mjs';
import { buildAgents } from './targets/agents.mjs';
import { runCanary } from './canary.mjs';

cleanDist();
const results = [buildClaude(), buildAgents()];

console.log('Built targets:');
for (const r of results) {
  if (r.skills) console.log(`  claude  → ${r.skills.length} skills: ${r.skills.join(', ')}`);
  if (r.chars != null) console.log(`  agents  → AGENTS.md (${r.chars} chars)`);
}

const canary = runCanary();
if (!canary.ok) {
  console.error('\nCanary FAILED — load-bearing rules did not survive generation:');
  for (const m of canary.misses) console.error(`  ${m}`);
  process.exit(1);
}
console.log(`\nCanary OK: ${canary.checked} invariants present in source and every generated build.`);
