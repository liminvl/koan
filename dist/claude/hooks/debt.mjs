// Harvest every `koan:` shortcut comment into a ledger, so deliberate deferrals
// get tracked instead of rotting into "later means never". Read-only, no CLI —
// `lint.mjs --debt` is the one entry point (one harvester, one home).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, resolve, relative } from 'node:path';

const SKIP = new Set(['node_modules', '.git', 'dist', '.cache']);
const CODE = /\.(m?js|cjs|ts|tsx|jsx|py|go|rs|java|rb|php|c|h|cpp|cs|sh|ps1|sql)$/i;

export function harvest(root = '.') {
  root = resolve(root);
  const hits = [];
  for (const file of sources(root)) {
    let text;
    try { text = readFileSync(file, 'utf8'); } catch { continue; }
    text.split('\n').forEach((line, i) => {
      // Quoted spans go first: a `koan:` inside a string literal is a fixture or
      // a test expectation, not a shortcut this project owes. Same idiom lint
      // check 11 uses to tell an act from a mention.
      const code = line.replace(/'[^']*'|"[^"]*"|`[^`]*`/g, '');
      // What's left must be a comment (has a leader) carrying `koan:` + a space
      // + the note. The space excludes the `koan:core` build markers.
      const m = code.match(/(?:\/\/|#|\/\*|--).*?koan:\s+(.+?)\s*(?:\*\/\s*)?$/);
      // A note that cites a decision is DISPOSITIONED: the shortcut was taken on
      // purpose, the reasoning is logged, and the revisit trigger lives in the
      // entry. That is the whole disposition check 12 asks for — so the ledger
      // still lists it (it is real debt) but the harden gate stops counting it.
      // Without this, "fix or accept each one" offers an action nothing supports,
      // and the only way past the gate is deleting the marker — which throws away
      // the note. Citing the log is koan's existing idiom, not a new mechanism.
      if (m) hits.push({
        file: relative(root, file),
        line: i + 1,
        note: m[1].trim(),
        accepted: /\bD-\d+\b/.test(m[1]),
      });
    });
  }
  return hits;
}

// Tracked files only. Debt is what the project ships; a `koan:` note in an
// ignored build artifact or a scratch run directory is noise the ledger used to
// report as owed. Falls back to a plain walk outside a git repo.
function sources(root) {
  try {
    return execSync('git ls-files -z', { cwd: root, stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1 << 26 })
      .toString().split('\0').filter((f) => CODE.test(f)).map((f) => join(root, f));
  } catch {
    const out = [];
    walk(root, (p) => out.push(p));
    return out;
  }
}

function walk(dir, onFile) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name);
    // Unreadable entries (permission-denied dirs, broken symlinks) are skipped,
    // not fatal — same idiom as the guarded readFileSync above.
    try {
      if (statSync(p).isDirectory()) walk(p, onFile);
      else if (CODE.test(name)) onFile(p);
    } catch { /* skip */ }
  }
}
