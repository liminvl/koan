// Shared shell-free `claude` CLI spawner for the benchmark runners.
//
// On Windows the npm-installed `claude` is a .cmd shim: it only runs under a
// shell, and a shell concatenates args — a multiline --append-system-prompt
// arm arrives mangled (and Node warns DEP0190). So resolve what `claude`
// actually is: a real .exe spawns shell-free as-is; a .cmd shim is parsed for
// the cli.js it wraps, which we hand to node directly. Args then travel
// verbatim on every platform, and prompts may still ride stdin via `input`.
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdtempSync, mkdirSync } from 'node:fs';
import { join, delimiter, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

// Pull the wrapped target out of an npm cmd-shim — a cli.js on older installs,
// a bundled claude.exe on newer ones (handles both the `"%~dp0\..."` and
// `"%dp0%\..."` shim styles).
function shimEntry(cmdText) {
  const m = cmdText.match(/"%(?:~dp0|dp0%)\\([^"]+)"\s+%\*/);
  return m ? m[1] : null;
}

let cached;
function resolve() {
  if (cached) return cached;
  if (process.platform !== 'win32') return (cached = ['claude']);
  for (const dir of (process.env.PATH || '').split(delimiter)) {
    for (const name of ['claude.exe', 'claude.cmd']) {
      const p = join(dir, name);
      if (!existsSync(p)) continue;
      if (name.endsWith('.exe')) return (cached = [p]);
      const entry = shimEntry(readFileSync(p, 'utf8'));
      if (entry && /\.[cm]?js$/.test(entry)) return (cached = [process.execPath, join(dir, entry)]);
      if (entry) return (cached = [join(dir, entry)]);
    }
  }
  return (cached = ['claude']); // not found — let the caller's available() check fail loudly
}

export function claude(args, input, opts) {
  const [exe, ...prefix] = resolve();
  return spawnSync(exe, [...prefix, ...args], { encoding: 'utf8', maxBuffer: 1 << 24, input, ...opts });
}

// Benchmark arms must run context-free. Spawning in the koan repo let every arm
// inherit CLAUDE.md→DECISIONS→HANDOFF (the dogfooding repo injected koan into its
// own baseline — one "baseline" answer recognized its probe in run.mjs and argued
// in koan idiom), and globally installed skills leak in too. --safe-mode disables
// CLAUDE.md/skills/plugins/hooks; the neutral tmp cwd stops repo reads on top.
let armDir;
export function claudeArm(args, input, opts) {
  if (!armDir) armDir = mkdtempSync(join(tmpdir(), 'koan-arm-'));
  // A cwd override must be a neutral fixture dir (tmp), never a real repo.
  return claude(['--safe-mode', ...args], input, { cwd: armDir, ...opts });
}

export const available = () => claude(['--version']).status === 0;

// Shared flag-value lookup for the runners' CLIs: `arg('--model')` → the next
// argv token, or null when the flag is absent.
export const arg = (f) => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : null; };

// Materialize a task's fixture files into a fresh tmp project dir — one dir per
// call, so one arm's writes can never leak into the next arm's run.
export function fixtureDir(files, label = 'fixture') {
  const dir = mkdtempSync(join(tmpdir(), `koan-${label}-`));
  for (const [rel, text] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, rel)), { recursive: true });
    writeFileSync(join(dir, rel), text);
  }
  return dir;
}

// Some probes grade a rule whose act is a git act (koan-jazz: branch, then
// return). Those fixtures need to BE a repo — otherwise the skill's own
// precondition fires ("not a git repo ⇒ say so and stop") and the probe
// measures the fixture instead of the rule.
export function gitOut(dir, args) {
  return spawnSync('git', ['-C', dir, ...args], { encoding: 'utf8' }).stdout || '';
}
export function gitInit(dir) {
  gitOut(dir, ['init', '-b', 'main']);
  gitOut(dir, ['config', 'user.email', 'bench@koan.local']);
  gitOut(dir, ['config', 'user.name', 'koan benchmark']);
  gitOut(dir, ['add', '-A']);
  gitOut(dir, ['commit', '-m', 'fixture']);
  return dir;
}

// Pre-install a probe's candidate dependency so the ARM never has to. An arm that
// runs `npm install` ends up with an untracked node_modules/ it cannot remove —
// the sandbox hard-denies `rm -rf` under every permission mode — and the denial
// cascades into abandoning whatever the probe grades (observed: opus-5 + sonnet-5,
// 2026-08-02). Installed --no-save so "should we take this dependency?" stays an
// open question in package.json. Real run only; the selftest stays offline.
export function installDeps(dir, pkgs) {
  // npm is a .cmd shim on Windows, so this needs a shell — passed as ONE command
  // string rather than an args array, which is what DEP0190 warns about. The
  // package names are probe-config literals, never user input.
  const r = spawnSync(`npm install --no-save --no-audit --no-fund ${pkgs.join(' ')}`, {
    cwd: dir, encoding: 'utf8', shell: true,
  });
  if (r.status !== 0) console.error(`  WARN: pre-install of ${pkgs.join(', ')} failed — arms may install it themselves and hit the rm -rf denial.`);
  return r.status === 0;
}

// Non-clobbering dir for a run's raw answers: results docs cite these paths as
// evidence, so a second run the same day gets -2, -3, … instead of overwriting.
export function runDir(kind) {
  const base = join(dirname(fileURLToPath(import.meta.url)), 'runs', `${kind}-${new Date().toISOString().slice(0, 10)}`);
  let dir = base;
  for (let i = 2; existsSync(dir); i++) dir = `${base}-${i}`;
  mkdirSync(dir, { recursive: true });
  return dir;
}
