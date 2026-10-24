// Both hosts receive complete bundles from src; only host-facing Markdown differs.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { readSkill, listSources, write, copy, stampMd, restampDir } from './lib.mjs';

export function buildSkill(path, dir, { render = (text) => text, templateName = (name) => name, alsoDirs = [] } = {}) {
  const { raw, name } = readSkill(path);
  const src = listSources();
  write(join(dir, 'SKILL.md'), stampMd(render(raw, name)));
  if (name === 'koan-init') {
    for (const [sub, from] of [['templates', src.templates], ['references', src.references]]) {
      for (const file of readdirSync(from)) {
        write(join(dir, sub, sub === 'templates' ? templateName(file) : file), render(readFileSync(join(from, file), 'utf8').replace(/\r\n/g, '\n')));
      }
    }
  }
  if (name === 'koan-wrap') {
    write(join(dir, 'references/document-routing.md'), render(readFileSync(join(src.references, 'document-routing.md'), 'utf8').replace(/\r\n/g, '\n')));
  }
  if (name === 'koan-lint') {
    copy(src.lintEngine, join(dir, 'lint.mjs'));
    copy(src.debtEngine, join(dir, 'debt.mjs'));
  }
  restampDir(dir, alsoDirs);
  return name;
}
