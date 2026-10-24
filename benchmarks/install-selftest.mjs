// Exercise actual installs in scratch directories; never touch user-level skills.
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync, writeFileSync, appendFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fixtureGitEnv } from './claude-cli.mjs';

const root = mkdtempSync(join(tmpdir(), 'koan-install-'));
const push = (...args) => spawnSync(process.execPath, ['push.mjs', root, ...args], { encoding: 'utf8' });
try {
  const ownInstructions = join(root, 'AGENTS.md');
  writeFileSync(ownInstructions, '# Project-owned instructions\n');
  const unmanaged = push();
  assert.equal(unmanaged.status, 1);
  assert.match(unmanaged.stderr, /no koan build stamp/);
  assert.doesNotMatch(unmanaged.stderr, /Re-run with --force/);
  assert.equal(readFileSync(ownInstructions, 'utf8'), '# Project-owned instructions\n');
  rmSync(ownInstructions);
  assert.equal(push().status, 0);
  const agents = join(root, 'AGENTS.md');
  const original = readFileSync(agents, 'utf8');
  writeFileSync(agents, original.replace(/\r?\n/g, '\r\n'));
  assert.equal(push('--check').status, 0, 'line endings alone are not drift');
  appendFileSync(agents, '\nLocal edit\n');
  assert.equal(push('--check').status, 1, 'same stamp must not conceal modified content');
  assert.equal(push().status, 1, 'normal push must preserve local edits');
  assert.equal(push('--force').status, 0);
  assert.equal(push('--check').status, 0);

  assert.equal(push('--target', 'plugin').status, 0);
  const plugin = join(root, '.claude/skills/koan');
  for (const rel of ['skills/koan-init/templates/HANDOFF.md', 'hooks/session-start.mjs', '.claude-plugin/plugin.json']) {
    const path = join(plugin, rel);
    const content = readFileSync(path, 'utf8');
    appendFileSync(path, '\nmodified\n');
    assert.equal(push('--target', 'plugin', '--check').status, 1, rel);
    assert.equal(push('--target', 'plugin').status, 1, 'do not silently accept corrupt bundles');
    writeFileSync(path, content);
  }
  rmSync(join(plugin, 'skills/koan-lint/debt.mjs'));
  assert.equal(push('--target', 'plugin', '--check').status, 1, 'missing bundled script');
  assert.equal(push('--target', 'plugin', '--force').status, 0);
  assert.equal(push('--target', 'plugin', '--check').status, 0);

  // A GitHub clone/ZIP can install either host or both without a build toolchain.
  const expected = ['koan', 'koan-init', 'koan-jazz', 'koan-lint', 'koan-readback', 'koan-wrap'];
  const invoke = (args, home) => spawnSync(process.execPath, ['--input-type=module', '-e',
    "import {main} from './push.mjs'; process.exitCode = main(JSON.parse(process.argv[1]), {home:process.argv[2]});",
    JSON.stringify(args), home], { encoding: 'utf8' });
  for (const target of ['claude', 'codex', 'both']) {
    const project = join(root, target);
    mkdirSync(project);
    const instructions = '# Local rules\nRead docs/DECISIONS.md at session start.\n## Checks\nnode --test\n';
    writeFileSync(join(project, 'AGENTS.md'), instructions);
    mkdirSync(join(project, 'docs'));
    writeFileSync(join(project, 'docs/HANDOFF.md'), '# Handoff\n## Objective\nAn existing project.\n');
    writeFileSync(join(project, 'docs/DECISIONS.md'), '# Decisions\n');
    writeFileSync(join(project, 'docs/DECISIONS-archive.md'), '# Archive\n');
    const args = [project, '--target', target];
    for (const flags of [[], [], ['--check']]) {
      const result = invoke([...args, ...flags], root);
      assert.equal(result.status, 0, result.stdout + result.stderr);
    }
    assert.equal(readFileSync(join(project, 'AGENTS.md'), 'utf8'), instructions);
    assert.equal(readFileSync(join(project, 'docs/HANDOFF.md'), 'utf8'), '# Handoff\n## Objective\nAn existing project.\n');
    for (const [host, path] of [['claude', '.claude'], ['codex', '.agents']]) {
      const installed = join(project, path, 'skills');
      if (target !== 'both' && target !== host) { assert.equal(existsSync(installed), false); continue; }
      assert.deepEqual(readdirSync(installed).sort(), expected);
      const constitution = host === 'codex' ? 'AGENTS.md' : 'CLAUDE.md';
      assert.ok(existsSync(join(installed, 'koan-init/templates', constitution)));
      assert.ok(existsSync(join(installed, 'koan-init/references/project-shapes.md')));
      for (const skill of ['koan-init', 'koan-wrap'])
        assert.ok(existsSync(join(installed, skill, 'references/document-routing.md')));
      const lint = spawnSync(process.execPath, [join(installed, 'koan-lint/lint.mjs'), '--path', project], { encoding: 'utf8' });
      assert.equal(lint.status, 0, lint.stdout + lint.stderr);
      for (const name of expected) {
        const text = readFileSync(join(installed, name, 'SKILL.md'), 'utf8');
        assert.ok(text.startsWith(`---\nname: ${name}\n`));
        if (host === 'codex') {
          if (name === 'koan-init') assert.match(text, /Read CLAUDE\.md and docs\/DECISIONS\.md at session start/);
          else assert.doesNotMatch(text, /CLAUDE\.md/);
          assert.doesNotMatch(text, /argument-hint:|\/koan(?:-[a-z]+)?\b|AGENTS\.md.{0,10}\(or .{0,3}AGENTS/);
        }
      }
    }
    const home = join(root, `${target}-home`);
    mkdirSync(home);
    const globalArgs = ['--target', target, '--global'];
    assert.equal(invoke(globalArgs, home).status, 0);
    assert.equal(invoke([...globalArgs, '--check'], home).status, 0);
    assert.equal(existsSync(join(home, 'AGENTS.md')), false);
  }
  // A Claude-first project retains its primary constitution and explicit Codex bridge.
  const dual = join(root, 'dual-bridge');
  mkdirSync(join(dual, 'docs'), { recursive: true });
  const primary = '# Project\n@docs/DECISIONS.md\n## Checks\nHuman review.\n';
  const bridge = 'Read CLAUDE.md and docs/DECISIONS.md at session start.\n';
  writeFileSync(join(dual, 'CLAUDE.md'), primary);
  writeFileSync(join(dual, 'AGENTS.md'), bridge);
  for (const [name, body] of [['HANDOFF', '# Handoff\n## Objective\nA film.\n'], ['DECISIONS', '# Decisions\n'], ['DECISIONS-archive', '# Archive\n']])
    writeFileSync(join(dual, 'docs', `${name}.md`), body);
  assert.equal(invoke([dual, '--target', 'both'], root).status, 0);
  assert.equal(readFileSync(join(dual, 'CLAUDE.md'), 'utf8'), primary);
  assert.equal(readFileSync(join(dual, 'AGENTS.md'), 'utf8'), bridge);
  assert.equal(spawnSync(process.execPath, [join(dual, '.agents/skills/koan-lint/lint.mjs'), '--path', dual], { encoding: 'utf8' }).status, 0);
  // Legacy generated core can coexist with a Claude constitution without edits.
  const legacy = join(root, 'legacy-core');
  mkdirSync(join(legacy, 'docs'), { recursive: true });
  writeFileSync(join(legacy, 'CLAUDE.md'), primary);
  for (const name of ['HANDOFF', 'DECISIONS', 'DECISIONS-archive'])
    writeFileSync(join(legacy, 'docs', `${name}.md`), readFileSync(join(dual, 'docs', `${name}.md`)));
  assert.equal(invoke([legacy, '--target', 'agents'], root).status, 0);
  assert.equal(spawnSync(process.execPath, ['src/lifecycle/lint.mjs', '--path', legacy], { encoding: 'utf8' }).status, 0);
  assert.equal(invoke([legacy, '--target', 'agents', '--check'], root).status, 0);
  // Both-host preflight must not write Claude files before a Codex conflict.
  const partial = join(root, 'partial');
  mkdirSync(join(partial, '.agents/skills/koan'), { recursive: true });
  writeFileSync(join(partial, '.agents/skills/koan/SKILL.md'), 'my local skill');
  assert.equal(invoke([partial, '--target', 'both'], root).status, 1);
  assert.equal(existsSync(join(partial, '.claude')), false);
  assert.equal(invoke([partial, '--target', 'both', '--check'], root).status, 1);
  assert.equal(invoke([partial, '--target', 'both', '--force'], root).status, 0);
  assert.equal(invoke([partial, '--target', 'both', '--check'], root).status, 0);
  const extraNote = join(partial, '.agents/skills/koan-wrap/notes.txt');
  writeFileSync(extraNote, 'local notes');
  const extraResult = invoke([partial, '--target', 'both', '--force'], root);
  assert.equal(extraResult.status, 1);
  assert.ok(extraResult.stderr.includes(extraNote));
  assert.equal(readFileSync(extraNote, 'utf8'), 'local notes');
  rmSync(extraNote);
  const codexScript = join(partial, '.agents/skills/koan-lint/debt.mjs');
  rmSync(codexScript);
  assert.equal(invoke([partial, '--target', 'both', '--check'], root).status, 1);
  assert.equal(invoke([partial, '--target', 'both', '--force'], root).status, 0);
  assert.equal(push('--target', 'both', '--force').status, 1, 'do not overlay a Claude plugin with loose skills');
  assert.equal(invoke([join(root, 'claude'), '--target', 'plugin', '--force'], root).status, 1);
  assert.equal(push('--target', 'unknown').status, 2);
  assert.equal(push('--target', 'codex', '--global').status, 2, 'project and global are exclusive');
  assert.equal(push('--typo').status, 2);
  console.log('native install matrix: Claude/Codex/both, repo/user scope, idempotence, resources, preservation and conflict preflight pass');
  const repo = join(root, 'repo');
  mkdirSync(repo);
  const git = (...args) => spawnSync('git', ['-C', repo, ...args], {
    encoding: 'utf8', env: fixtureGitEnv({ ...process.env, GIT_INDEX_FILE: join(root, 'hook-index') }),
  });
  assert.equal(git('init', '-b', 'main').status, 0);
  assert.equal(git('-c', 'user.name=Test', '-c', 'user.email=test@example.invalid', 'commit', '--allow-empty', '-m', 'fixture').status, 0);
  writeFileSync(join(repo, 'user-work.txt'), 'preserve this');
  const jazz = readFileSync('src/lifecycle/koan-jazz.skill.md', 'utf8');
  const command = jazz.match(/`(git worktree add[^`]+)`/)[1]
    .replaceAll('<topic>', 'test').replaceAll('<repo>', 'repo').split(/\s+/);
  const worktree = git(...command.slice(1));
  assert.equal(worktree.status, 0, `documented command creates a new worktree branch: ${worktree.stderr}`);
  assert.equal(readFileSync(join(repo, 'user-work.txt'), 'utf8'), 'preserve this');
  assert.equal(git('branch', '--show-current').stdout.trim(), 'main');
  assert.equal(git('show-ref', '--verify', 'refs/heads/jazz/test').status, 0);
  console.log('jazz selftest: documented worktree command preserves dirty checkout');
  console.log('install selftest: content drift, missing resources, newline parity, and force repair pass');
} finally {
  rmSync(root, { recursive: true, force: true });
}
