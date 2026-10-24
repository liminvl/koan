#!/usr/bin/env node
// Optional integration check against the installed Codex host. No model calls.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, sep } from 'node:path';
import { createInterface } from 'node:readline';
import { main } from '../push.mjs';

const root = mkdtempSync(join(tmpdir(), 'koan-codex-discovery-'));
let server;
try {
  assert.equal(main([root, '--target', 'codex']), 0);
  server = process.platform === 'win32'
    ? spawn('codex app-server --stdio', { cwd: root, shell: true, stdio: ['pipe', 'pipe', 'ignore'] })
    : spawn('codex', ['app-server', '--stdio'], { cwd: root, stdio: ['pipe', 'pipe', 'ignore'] });
  const pending = new Map();
  let nextId = 0;
  const lines = createInterface({ input: server.stdout });
  lines.on('line', (line) => {
    let message;
    try { message = JSON.parse(line); } catch { return; }
    const done = pending.get(message.id);
    if (done) { pending.delete(message.id); done(message); }
  });
  const request = (method, params) => new Promise((resolve, reject) => {
    const id = ++nextId;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`${method} timed out`)); }, 30000);
    pending.set(id, (message) => {
      clearTimeout(timer);
      if (message.error) reject(new Error(JSON.stringify(message.error)));
      else resolve(message.result);
    });
    server.stdin.write(JSON.stringify({ id, method, params }) + '\n');
  });
  server.on('error', (error) => {
    for (const done of pending.values()) done({ error: { message: error.message } });
    pending.clear();
  });
  await request('initialize', { clientInfo: { name: 'koan-discovery-check', version: '1.0' } });
  server.stdin.write(JSON.stringify({ method: 'initialized' }) + '\n');
  const result = await request('skills/list', { cwds: [root], forceReload: true });
  const entries = result.data ?? [];
  const local = entries.flatMap((entry) => entry.skills ?? []).filter((skill) => skill.path.startsWith(root + sep));
  assert.deepEqual(local.map((skill) => skill.name).sort(), ['koan', 'koan-init', 'koan-jazz', 'koan-lint', 'koan-readback', 'koan-wrap']);
  assert.ok(local.every((skill) => skill.enabled), 'all six local skills enabled');
  assert.deepEqual(entries.flatMap((entry) => entry.errors ?? []).filter((error) => error.path.startsWith(root + sep)), []);
  console.log('Codex host discovery: all six native skills loaded and enabled; no local parse errors.');
} finally {
  server?.stdin.end();
  server?.kill();
  rmSync(root, { recursive: true, force: true });
}
