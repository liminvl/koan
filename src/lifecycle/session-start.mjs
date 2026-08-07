#!/usr/bin/env node
// koan SessionStart hook — the deterministic half of the continuity nudge.
// CLAUDE.md's "Start here" line is model-driven and therefore skippable; this
// fires regardless. It CHECKS AND REMINDS: never writes, never blocks, never
// calls the network, and exits 0 on every path including its own failures.
//
// It adds no detection. `lint()` already finds a stale HANDOFF, a blown budget,
// a phantom D-id; nothing was ever asking it. This is the trigger, nothing more.
//
// Silence when clean is a hard rule, not a nicety: additionalContext is a
// per-session token cost in every project on the box, so a healthy repo — and
// any repo that doesn't use koan at all — must produce no output whatsoever.
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { lint } from './lint.mjs';

// The only text that reaches a model's context. Bounded so a rotten repo can't
// tax every session with a wall of findings — past the cap, the skill is the
// right place to read them.
const CONTEXT_CAP = 800;
const MAX_FINDINGS = 5;

export function sessionStart(root = '.') {
  root = resolve(root);
  // Gate on koan-ness BEFORE linting. Without this, `lint()`'s own "Missing
  // docs/HANDOFF.md" error would fire in every non-koan project on the machine.
  if (!existsSync(join(root, 'docs', 'HANDOFF.md'))) return null;

  const { errors, warnings } = lint(root);
  const found = [...errors, ...warnings];
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
    // Claude Code pipes the event JSON on stdin; `cwd` is the project dir.
    // Fall back to process.cwd() rather than trusting either one alone.
    let cwd = process.cwd();
    if (!process.stdin.isTTY) {
      try { cwd = JSON.parse(readFileSync(0, 'utf8')).cwd || cwd; } catch { /* no or bad stdin */ }
    }
    context = sessionStart(cwd);
  } catch { /* a hook that fails must fail silently — see the header */ }

  if (context) process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: context },
  }) + '\n');
  process.exit(0);
}
