#!/usr/bin/env node
// Build every target from the single source.
// Native skill bundles for Claude and Codex, plus the portable AGENTS core.
import { cleanDist } from './lib.mjs';
import { buildClaude } from './targets/claude.mjs';
import { buildCodex } from './targets/codex.mjs';
import { buildAgents } from './targets/agents.mjs';
import { runCanary } from './canary.mjs';

cleanDist();
const results = [buildClaude(), buildCodex(), buildAgents()];

console.log('Built targets:');
for (const r of results) {
  if (r.skills) console.log(`  ${r.target.padEnd(7)} → ${r.skills.length} skills: ${r.skills.join(', ')}`);
  if (r.chars != null) console.log(`  agents  → AGENTS.md (${r.chars} chars)`);
}

const canary = runCanary();
if (!canary.ok) {
  console.error('\nCanary FAILED — load-bearing rules did not survive generation:');
  for (const m of canary.misses) console.error(`  ${m}`);
  process.exit(1);
}
console.log(`\nCanary OK: ${canary.checked} invariants present in source and every generated build.`);
