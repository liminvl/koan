// Claude Code target: a plugin dir with the full skills verbatim (+ build stamp).
import { cpSync } from 'node:fs';
import { join } from 'node:path';
import { readSkill, listSources, write, copy, stampMd, restampDir, DIST, VERSION } from '../lib.mjs';

export function buildClaude() {
  const out = join(DIST, 'claude');
  const src = listSources();
  const all = [src.core, ...src.lifecycle];
  const skills = [];

  // The SessionStart hook config. Auto-discovered at hooks/hooks.json in the
  // plugin root. Exec form (command + args) rather than a shell string: it is
  // the one form that needs no quoting and behaves identically on Windows.
  const hooksJson = JSON.stringify({
    hooks: {
      SessionStart: [{
        hooks: [{
          type: 'command',
          command: 'node',
          args: ['${CLAUDE_PLUGIN_ROOT}/hooks/session-start.mjs'],
          timeout: 10,
        }],
      }],
    },
  }, null, 2);

  // The hook dir is its own install unit, so it carries its own copies of the
  // engines rather than reaching across into skills/ — same call D-034 made for
  // koan-lint, for the same reason: an install resolves nothing but itself.
  // Written BEFORE the skills so the koan skill can fold it into its stamp.
  const hooksDir = join(out, 'hooks');
  write(join(hooksDir, 'hooks.json'), hooksJson);
  copy(src.hookEngine, join(hooksDir, 'session-start.mjs'));
  copy(src.lintEngine, join(hooksDir, 'lint.mjs'));
  copy(src.debtEngine, join(hooksDir, 'debt.mjs'));

  for (const path of all) {
    const { raw, name } = readSkill(path);
    const dir = join(out, 'skills', name);
    write(join(dir, 'SKILL.md'), stampMd(raw));
    skills.push(name);
    if (name === 'koan-init') cpSync(src.templates, join(dir, 'templates'), { recursive: true });
    // koan-lint ships debt.mjs too — lint.mjs imports it (one harvester, one
    // home), so a skill dir with only lint.mjs is broken as installed (D-034).
    if (name === 'koan-lint') {
      copy(src.lintEngine, join(dir, 'lint.mjs'));
      copy(src.debtEngine, join(dir, 'debt.mjs'));
    }
    // Re-stamp over the finished directory: whatever this skill ended up
    // shipping is now in its hash, with nothing to remember to declare.
    // The koan skill also folds in hooks/ — push compares SKILL.md stamps only,
    // so the hook layer needs a stamped file to ride on or a hook-only edit
    // reads as "already current" at every install.
    restampDir(dir, name === 'koan' ? [hooksDir] : []);
  }

  write(join(out, '.claude-plugin', 'plugin.json'), JSON.stringify({
    name: 'koan', version: VERSION,
    description: 'Zen discipline for coding agents: build less, lose less.',
    skills: skills.map((s) => `./skills/${s}`),
  }, null, 2));
  // No marketplace.json here: the repo-root .claude-plugin/marketplace.json is
  // the one marketplace (source ./dist/claude), and a second file under the same
  // name would collide — a user can register only one marketplace per name.

  return { target: 'claude', skills };
}
