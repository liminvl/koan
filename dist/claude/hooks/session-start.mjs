#!/usr/bin/env node
// koan SessionStart hook — the deterministic half of the continuity nudge.
// CLAUDE.md's "Start here" line is model-driven and therefore skippable; this
// fires regardless. It CHECKS AND REMINDS: never writes, never blocks, never
// calls the network, and exits 0 on every path including its own failures.
//
// It adds no DOC detection. `lint()` already finds a stale HANDOFF, a blown
// budget, a phantom D-id; nothing was ever asking it. This is the trigger. The
// one thing it reads on its own is the SESSION, which lint cannot see: Claude
// Code tags each start with a `source` (startup · resume · clear · compact), and
// `compact` is the moment the conversation just went lossy. If the tree carries
// work newer than the HANDOFF at that moment, the checkpoint-before-/compact
// rule (D-024) has already been missed — auto-compaction gives the model no
// turn to act on it — so this says so, once (D-046).
//
// Silence when clean is a hard rule, not a nicety: additionalContext is a
// per-session token cost in every project on the box, so a healthy repo — and
// any repo that doesn't use koan at all — must produce no output whatsoever.
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { lint } from './lint.mjs';

// The only text that reaches a model's context. Bounded so a rotten repo can't
// tax every session with a wall of findings — past the cap, the skill is the
// right place to read them.
const CONTEXT_CAP = 800;
const MAX_FINDINGS = 5;

// Uncommitted files the HANDOFF has not caught up with: dirty paths other than
// docs/HANDOFF.md whose mtime is newer than the HANDOFF's. A HANDOFF written
// after the last code edit IS the checkpoint and must not re-trigger the nudge.
// A deleted file has no mtime and counts as unrecorded. Not a git repo ⇒ 0:
// there is nothing to compare against, and nothing to say.
function unrecordedWork(root) {
  try {
    const out = execSync('git status --porcelain', { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString();
    const paths = out.split('\n').filter(Boolean)
      .map((l) => l.slice(3).trim().replace(/^"|"$/g, '').split(' -> ').pop());
    const mtime = (rel) => { try { return statSync(join(root, rel)).mtimeMs; } catch { return Infinity; } };
    const since = mtime('docs/HANDOFF.md');
    return paths.filter((f) => f !== 'docs/HANDOFF.md' && mtime(f) > since).length;
  } catch { return 0; }
}

export function sessionStart(root = '.', source = 'startup') {
  root = resolve(root);
  // Gate on koan-ness BEFORE linting. Without this, `lint()`'s own "Missing
  // docs/HANDOFF.md" error would fire in every non-koan project on the machine.
  if (!existsSync(join(root, 'docs', 'HANDOFF.md'))) return null;

  const { errors, warnings } = lint(root);
  const found = [...errors, ...warnings];
  if (source === 'compact') {
    const n = unrecordedWork(root);
    if (n) found.unshift(`Context was just compacted and ${n} uncommitted file${n > 1 ? 's are' : ' is'} newer than docs/HANDOFF.md — the conversation that knew why is gone. Checkpoint HANDOFF (In progress · Next steps) from \`git diff\` before continuing.`);
  }
  if (!found.length) return null;

  const shown = found.slice(0, MAX_FINDINGS).map((f) => `- ${f}`);
  const rest = found.length - shown.length;
  let out = [
    'koan continuity check (deterministic, from the SessionStart hook):',
    ...shown,
    rest > 0 ? `- +${rest} more — run /koan-lint for the full list.` : null,
    'Read docs/HANDOFF.md before continuing; /koan-readback if resuming cold.',
  ].filter(Boolean).join('\n');

  if (out.length > CONTEXT_CAP) out = `${out.slice(0, CONTEXT_CAP - 24).trimEnd()}\n… run /koan-lint.`;
  return out;
}

// CLI. Same isMain guard as lint.mjs so selfcheck's bundle check can import
// this file without executing the hook.
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  let context = null;
  try {
    // Claude Code pipes the event JSON on stdin; `cwd` is the project dir and
    // `source` says why the session started. Fall back to process.cwd() and
    // `startup` rather than trusting either one alone.
    let cwd = process.cwd(), source = 'startup';
    if (!process.stdin.isTTY) {
      try {
        const event = JSON.parse(readFileSync(0, 'utf8'));
        cwd = event.cwd || cwd;
        source = event.source || source;
      } catch { /* no or bad stdin */ }
    }
    context = sessionStart(cwd, source);
  } catch { /* a hook that fails must fail silently — see the header */ }

  if (context) process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: context },
  }) + '\n');
  process.exit(0);
}
