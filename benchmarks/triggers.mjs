#!/usr/bin/env node
// Stage 0 — trigger-surface check. Free, offline. The descriptions are the
// routing surface (a lesson from ponytail); this asserts they still route:
// each pinned prompt (benchmarks/triggers.json) must rank its skill strictly
// first under tf-idf over the shipped descriptions, and no two descriptions
// may near-collide (cosine >= collisionCeiling). Pocket version of
// agent-skills' Tier-2 eval — prompts + a threshold, not a framework.
//   node benchmarks/triggers.mjs [--selftest]
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// Function words only. idf downweights corpus-wide common words, but a function
// word landing in a single description becomes a fake discriminator ("them",
// "with") — semantics can't hang on those, so they're dropped outright.
const STOP = new Set(('a an the and or but of to in on for with without it its is are was be been being this that ' +
  'these those them they their we our us you your i me my from by at as so if than then not no do does done ' +
  'can could should would will may might have has had what which who whom how where when').split(' '));

function tokens(text) {
  return (text.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter((t) => !STOP.has(t)).map((t) => {
    for (const suf of ['ing', 'ed', 'es', 's']) {
      if (t.length > suf.length + 2 && t.endsWith(suf)) { t = t.slice(0, -suf.length); break; }
    }
    if (/([a-z])\1$/.test(t)) t = t.slice(0, -1); // stopping→stopp→stop
    return t;
  });
}

function readDescriptions(root) {
  const dir = join(root, 'dist/claude/skills');
  const docs = {};
  for (const name of readdirSync(dir)) {
    const p = join(dir, name, 'SKILL.md');
    if (!existsSync(p)) continue;
    const fm = readFileSync(p, 'utf8').match(/^---\n([\s\S]*?)\n---/);
    const desc = fm?.[1].match(/^description:[^\n]*\n((?:[ \t]+[^\n]*\n?)*)/m);
    if (desc) docs[name] = desc[1];
  }
  return docs;
}

// tf-idf over the description corpus; score = sum over prompt terms of tf*idf.
export function checkTriggers({ docs, prompts, collisionCeiling }) {
  const errors = [];
  const names = Object.keys(docs);
  const tf = Object.fromEntries(names.map((n) => {
    const m = new Map();
    for (const t of tokens(docs[n])) m.set(t, (m.get(t) ?? 0) + 1);
    return [n, m];
  }));
  const idf = (t) => Math.log(names.length / names.filter((n) => tf[n].has(t)).length);

  for (const { prompt, expect } of prompts) {
    const q = [...new Set(tokens(prompt))];
    const ranked = names
      .map((n) => [n, q.reduce((s, t) => s + (tf[n].has(t) ? (1 + Math.log(tf[n].get(t))) * idf(t) : 0), 0)])
      .sort((a, b) => b[1] - a[1]);
    const [top, runnerUp] = ranked;
    if (top[0] !== expect || top[1] <= (runnerUp?.[1] ?? 0)) {
      errors.push(`trigger: "${prompt}" → ${top[0]} (${top[1].toFixed(2)}), expected ${expect}` +
        ` (${(ranked.find(([n]) => n === expect)?.[1] ?? 0).toFixed(2)}). Fix the description's vocabulary, not the prompt.`);
    }
  }

  // Description collision: cosine similarity of tf-idf vectors.
  const vec = (n) => new Map([...tf[n]].map(([t, f]) => [t, (1 + Math.log(f)) * idf(t)]));
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      const [a, b] = [vec(names[i]), vec(names[j])];
      const dot = [...a].reduce((s, [t, w]) => s + w * (b.get(t) ?? 0), 0);
      const norm = (v) => Math.sqrt([...v.values()].reduce((s, w) => s + w * w, 0));
      const cos = dot / (norm(a) * norm(b) || 1);
      if (cos >= collisionCeiling) {
        errors.push(`collision: ${names[i]} ↔ ${names[j]} descriptions ${(cos * 100).toFixed(0)}% similar (ceiling ${collisionCeiling * 100}%). Sharpen one.`);
      }
    }
  }
  return { errors, checked: prompts.length, skills: names.length };
}

export function runTriggers(root = ROOT) {
  const data = JSON.parse(readFileSync(join(root, 'benchmarks/triggers.json'), 'utf8'));
  return checkTriggers({ docs: readDescriptions(root), ...data });
}

function selftest() {
  const data = JSON.parse(readFileSync(join(ROOT, 'benchmarks/triggers.json'), 'utf8'));
  const docs = readDescriptions(ROOT);
  const fails = [];

  // good reference: the real pins pass.
  const real = checkTriggers({ docs, ...data });
  if (real.errors.length) fails.push(...real.errors.map((e) => `good ref failed: ${e}`));

  // bad reference (pinned FP class: a ranker that passes anything): a
  // mis-owned prompt must be caught.
  const misowned = checkTriggers({
    docs,
    // Must name a skill that still SHIPS: pointing at a deleted one makes the
    // failure trivial (nothing to rank) instead of testing mis-ownership.
    prompts: [{ prompt: 'Checkpoint our progress before I run /compact.', expect: 'koan-jazz' }],
    collisionCeiling: data.collisionCeiling,
  });
  if (!misowned.errors.length) fails.push('bad ref passed: mis-owned prompt was not flagged.');

  // bad reference: identical descriptions must trip the collision check.
  const dup = checkTriggers({
    docs: { a: docs['koan-wrap'], b: docs['koan-wrap'], c: docs['koan'] },
    prompts: [],
    collisionCeiling: data.collisionCeiling,
  });
  if (!dup.errors.some((e) => e.startsWith('collision'))) fails.push('bad ref passed: identical descriptions did not collide.');

  for (const f of fails) console.error(`ERROR: ${f}`);
  console.log(`triggers selftest: ${fails.length ? `${fails.length} failure(s)` : 'ok'}`);
  process.exit(fails.length ? 2 : 0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.includes('--selftest')) selftest();
  else {
    const { errors, checked, skills } = runTriggers();
    for (const e of errors) console.error(`ERROR: ${e}`);
    console.log(`triggers: ${checked} prompts routed over ${skills} skills${errors.length ? `, ${errors.length} error(s)` : ', clean'}`);
    process.exit(errors.length ? 2 : 0);
  }
}
