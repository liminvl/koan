#!/usr/bin/env node
// koan-lint: deterministic checks on a project's koan docs. Read-only.
// Exported `lint(root)` is reused by benchmarks/selfcheck.mjs (one engine, one home).
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { harvest } from './debt.mjs';

// Budgets ration ATTENTION, not context window or cost. At ~4 chars/token these
// files are ~3k + ~7.5k tokens: under 1% of a 1M-token window, and cents to load
// even uncached. Neither number moves when windows grow or prices fall — what
// they bound is how many standing facts a model can still weigh on every call.
// Raise one only with evidence a log that size still lands, and say why in the
// same commit (the friction IS the gate). DECISIONS_HARD stays ~1.5x the soft
// warning: room to finish the session you're in, not room to keep growing.
// HANDOFF 12_000 → 15_000 (2026-08-04, human sign-off). Unlike DECISIONS, this
// doc is REWRITTEN each wrap, not accumulated — it has no axis to split and no
// archive to drain, so a wall here has only one exit. koan's own sat at
// 11968/12000 while still reading as current.
// DECISIONS went 30_000 → 25_000 and back (2026-08-05). koan's own log compressed
// to 22.4k under koan-wrap §3's five fields, and the ratchet-down rule said lower
// the ceiling to match. That rule is right for koan's BUILD ARTIFACTS, whose sizes
// this repo controls; it was wrong to export as a gate. One repo's compression is
// not evidence about every consumer's log, and the tightening immediately fired on
// two healthy field repos that had never been over — the "noise on healthy repos"
// trigger D-019's revisit-if names. A consumer log that should compress is a
// judgement for that project, not a number shipped from here.
// Exported for benchmarks/selfcheck.mjs, which asserts the prose surfaces that
// restate these numbers still agree — they have drifted twice (12k→15k; 30k→25k→30k).
export const HANDOFF_BUDGET = 15_000;
export const DECISIONS_BUDGET = 30_000;
export const DECISIONS_HARD = 45_000;
// A domain decision set (docs/DECISIONS-<domain>.md) is read on demand, so it
// rations the attention of ONE task rather than every session — half the
// auto-loaded ceiling. It is not a loophole: a set that outgrows this is a
// domain that wants splitting, not a bigger allowance.
export const SET_BUDGET = 15_000;

const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null);

export function lint(root = '.') {
  root = resolve(root);
  const errors = [];
  const warnings = [];
  const p = (f) => join(root, f);

  // 1. constitution file
  const constitution = existsSync(p('CLAUDE.md')) ? 'CLAUDE.md'
    : existsSync(p('AGENTS.md')) ? 'AGENTS.md' : null;
  if (!constitution) errors.push('No CLAUDE.md or AGENTS.md at project root.');
  const constText = constitution ? read(p(constitution)) ?? '' : '';

  // Project phase — sets where a choice lands, nothing else. Absent or
  // unrecognised resolves to `build` SILENTLY: that is today's behavior, and
  // warning here would fire on every project that never opted in.
  const phase = /\*\*Phase:\*\*\s*(explore|build|harden)\b/i.exec(constText)?.[1]?.toLowerCase() ?? 'build';

  const handoff = read(p('docs/HANDOFF.md'));
  const decisions = read(p('docs/DECISIONS.md'));
  const archive = read(p('docs/DECISIONS-archive.md'));
  // Domain decision sets: live but domain-scoped, so out of context by design.
  // Everything matching DECISIONS-*.md except the archive is one.
  const setFiles = (existsSync(p('docs')) ? readdirSync(p('docs')) : [])
    .filter((f) => /^DECISIONS-.+\.md$/.test(f) && f !== 'DECISIONS-archive.md')
    .map((f) => ({ name: `docs/${f}`, text: read(p(`docs/${f}`)) }));
  if (handoff == null) errors.push('Missing docs/HANDOFF.md.');
  if (decisions == null) errors.push('Missing docs/DECISIONS.md.');
  if (archive == null) warnings.push('Missing docs/DECISIONS-archive.md (created on first archive).');

  // 2. import wiring
  if (constitution) {
    if (!/@docs\/DECISIONS\.md/.test(constText))
      warnings.push(`${constitution} does not import @docs/DECISIONS.md.`);
    if (/@docs\/DECISIONS-archive\.md/.test(constText))
      errors.push(`${constitution} imports the archive — it must stay out of context.`);
    // Importing a set re-imposes the tax the split removed — the whole point is
    // that a domain's decisions load when that domain is worked on, not always.
    for (const s of setFiles)
      if (constText.includes(`@${s.name}`))
        errors.push(`${constitution} imports ${s.name} — a domain set must stay out of context.`);
  }

  // 3. budgets
  const budget = [];
  if (handoff != null) {
    const n = handoff.length;
    budget.push(`HANDOFF ${n}/${HANDOFF_BUDGET}`);
    if (n > HANDOFF_BUDGET) warnings.push(`docs/HANDOFF.md is ${n} chars (> ${HANDOFF_BUDGET}). Prune.`);
  }
  if (decisions != null) {
    const n = decisions.length;
    budget.push(`DECISIONS ${n}/${DECISIONS_BUDGET}`);
    if (n > DECISIONS_HARD) errors.push(`docs/DECISIONS.md is ${n} chars (> hard ${DECISIONS_HARD}). Archive now.`);
    else if (n > DECISIONS_BUDGET) {
      // Name the fattest entries: budgets price the file, but when nothing is
      // archivable the fix is compressing entries, and without names "archive
      // settled entries" dead-ends (field: one 9.2k entry was 31% of a log).
      // Diagnostic only fires when already over — a fat entry in a log under
      // budget is that project's judgement, and this stays silent on it.
      // An entry ends at the NEXT heading of any kind, not the next D-heading —
      // otherwise a parallel series (check 14's shape) inflates the D-entry
      // above it and the diagnostic names the wrong culprit.
      const fat = [...decisions.matchAll(/^###\s+(D-\d+)\b/gm)]
        .map((h) => {
          const rest = decisions.slice(h.index + h[0].length);
          const nx = rest.search(/^#{2,3}\s/m);
          return [h[1], h[0].length + (nx >= 0 ? nx : rest.length)];
        })
        .sort((a, b) => b[1] - a[1]).slice(0, 3)
        .map(([id, s]) => `${id} ${(s / 1000).toFixed(1)}k`).join(', ');
      warnings.push(`docs/DECISIONS.md is ${n} chars (> ${DECISIONS_BUDGET}). Archive settled entries, or compress the largest — ${fat} — to five short fields; overflow reasoning belongs in the commit.`);
    }
  }
  for (const s of setFiles) {
    budget.push(`${s.name.replace('docs/DECISIONS-', '').replace('.md', '')} ${s.text.length}/${SET_BUDGET}`);
    if (s.text.length > SET_BUDGET)
      warnings.push(`${s.name} is ${s.text.length} chars (> ${SET_BUDGET}). Split the domain or archive settled entries.`);
  }

  // 4. decision-ID integrity
  if (decisions != null) {
    const ids = (s) => [...(s ?? '').matchAll(/^###\s+(D-\d+)\b/gm)].map((m) => m[1]);
    const mainFull = ids(decisions);
    const archFull = ids(archive);
    const stubs = [...decisions.matchAll(/^\s*-\s+\*\*(D-\d+)\*\*.*archived/gim)].map((m) => m[1]);

    const setFull = setFiles.flatMap((s) => ids(s.text));
    // The "Domain decision sets" index is the main log's only record that these
    // IDs exist — without it a citation into a set looks like a phantom, and the
    // set itself becomes unfindable from the file everyone reads.
    // Split rather than match a section regex: the index is often the LAST
    // section, and an end-anchored regex silently matches nothing there.
    const setIndex = decisions.split(/^##\s+/m).find((s) => /^Domain decision sets/.test(s)) ?? '';
    const listed = [...setIndex.matchAll(/\b(D-\d+)\b/g)].map((m) => m[1]);

    for (const dup of duplicates([...mainFull, ...archFull, ...setFull]))
      errors.push(`Decision ${dup} has a full entry in more than one place.`);
    for (const id of new Set(stubs))
      if (!archFull.includes(id)) errors.push(`Index stub ${id} has no full entry in DECISIONS-archive.md.`);
    for (const id of new Set(archFull))
      if (!stubs.includes(id)) errors.push(`Archived ${id} has no stub in the main "Archived decisions index".`);
    for (const id of new Set(setFull))
      if (!listed.includes(id)) errors.push(`${id} lives in a domain set but is not listed in "Domain decision sets".`);
    for (const id of new Set(listed))
      if (!setFull.includes(id)) errors.push(`"Domain decision sets" lists ${id}, which has no full entry in any set.`);

    const known = new Set([...mainFull, ...archFull, ...stubs, ...setFull, ...listed]);
    // Same `<repo>:D-nnn` escape check 10 advertises — a qualified ID belongs to
    // another repo's log and cannot resolve here. Check 10 honoured it and this
    // one did not, so the fix the linter recommends did nothing in the main log.
    const cited = [...decisions.matchAll(/(?<!\w:)\b(D-\d+)\b/g)].map((m) => m[1]);
    for (const id of new Set(cited))
      if (!known.has(id)) warnings.push(`Citation ${id} resolves to no entry or stub.`);
  }

  // 5. canonical-example paths
  if (constitution) {
    const block = constText.match(/##\s*Canonical examples([\s\S]*?)(\n##\s|$)/i);
    if (block) {
      // A PATH, not any dotted code span. Requiring a separator is what keeps this
      // check honest in a prose-rich section: without it, `EffectRef.kind` (a type
      // field) and bare filenames whose full path sits on the same line all read as
      // dead paths — 15 false warnings in one field repo, which teaches the reader
      // to skip the check entirely (the D-025 lesson). A bare name is ambiguous by
      // construction; the template asks for paths, so only paths are verified.
      for (const m of block[1].matchAll(/`([^`]*\/[^`]*\.[a-z0-9]+)`/gi)) {
        const rel = m[1];
        if (existsSync(p(rel))) continue;
        // A path whose first segment isn't a local entry is a sibling-repo pointer
        // (9arty's "copy from rtime/…"), not a typo — an agent here can't open it.
        const seg = rel.split(/[\\/]/)[0];
        warnings.push(seg && !existsSync(p(seg))
          ? `Canonical example path does not exist locally: ${rel} — looks like a sibling-repo path; use an absolute path or copy the example in-repo so an agent here can open it.`
          : `Canonical example path does not exist: ${rel}`);
      }
    }
  }

  // 6. staleness vs git — skipped while HANDOFF has uncommitted edits: dirty
  // means it's being refreshed right now (the wrap flow), and the commit-based
  // count can't clear before the very commit the pre-commit hook is gating.
  // Also skipped in the explore phase: committing ahead of the HANDOFF is what
  // fast iteration looks like, so the lag is the intended state, not rot.
  if (handoff != null && phase !== 'explore') {
    try {
      const dirty = execSync('git status --porcelain -- docs/HANDOFF.md', { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
      const last = execSync('git log -1 --format=%H -- docs/HANDOFF.md', { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
      if (!dirty && last) {
        const behind = execSync(`git rev-list --count ${last}..HEAD`, { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
        if (Number(behind) > 0) warnings.push(`docs/HANDOFF.md is ${behind} commit(s) behind HEAD — may be stale.`);
      }
    } catch { /* not a git repo or git unavailable — skip */ }
  }

  // 7. required sections
  if (handoff != null && !/##\s*Objective/i.test(handoff)) warnings.push('docs/HANDOFF.md has no ## Objective section.');
  if (constitution && !/##\s*Checks/i.test(constText))
    warnings.push(`${constitution} has no ## Checks section (defines "done").`);

  // 8. (retired 2026-08-05) The retired-ritual check. Its regex hardcoded koan's
  // own June-2026 rename (handoff-*/ponytail-*/radar-*), so no consumer who never
  // used those names could trip it, and it needed a scaffolding-stripper purely to
  // stop firing on koan's own archive. The three legacy repos were fixed by hand.

  // 9. archive candidates — settled, old, uncited, claiming no seat.
  // Skipped in the explore phase: the few entries a prototype does mint are the
  // active frontier by definition, and the 14-day gate would flag them anyway.
  if (decisions != null && phase !== 'explore') {
    const idx = decisions.search(/^##\s+Archived decisions index/m);
    const heads = [...decisions.matchAll(/^###\s+(D-\d+)\b/gm)];
    for (let i = 0; i < heads.length; i++) {
      const start = heads[i].index;
      const end = i + 1 < heads.length ? heads[i + 1].index : idx > start ? idx : decisions.length;
      const body = decisions.slice(start, end);
      const status = body.match(/\*\*Status:\*\*\s*_?([a-z]+)/i)?.[1]?.toLowerCase();
      if (status !== 'implemented' && status !== 'superseded') continue;
      if (/\*\*Load-bearing/i.test(body)) continue;
      const date = body.match(/\*\*Status:\*\*[^\n]*?(\d{4}-\d{2}-\d{2})/)?.[1];
      if (!date || Date.now() - Date.parse(date) < 14 * 86_400_000) continue;
      const id = heads[i][1];
      // "Uncited" must mean uncited ANYWHERE live: the constitution and domain
      // sets carry citations too (field: koan's own CLAUDE.md cites D-033), and
      // missing them flagged entries whose reasoning was still load-bearing.
      const elsewhere = decisions.slice(0, start) + decisions.slice(end) + (handoff ?? '')
        + constText + setFiles.map((s) => s.text).join('\n');
      if (new RegExp(`\\b${id}\\b`).test(elsewhere)) continue;
      warnings.push(`${id} is ${status} (${date}), uncited by any active entry or HANDOFF, and claims no Load-bearing seat — archive candidate.`);
    }
  }

  // 10. phantom decision IDs — IDs minted outside the log collide later
  if (existsSync(p('docs'))) {
    const known = new Set([...`${decisions ?? ''}\n${archive ?? ''}`.matchAll(/\b(D-\d+)\b/g)].map((m) => m[1]));
    for (const f of readdirSync(p('docs'))) {
      // Domain sets are the sanctioned home for a full entry outside the main
      // log; check 4 already holds them to index parity, so exempt them here.
      if (!f.endsWith('.md') || /^DECISIONS(-.+)?\.md$/.test(f)) continue;
      const t = read(join(p('docs'), f)) ?? '';
      const hit = t.match(/^###\s+(D-\d+)\b/m);
      if (hit) warnings.push(`docs/${f} declares a decision heading (${hit[1]}) — full entries live only in DECISIONS.md or its archive.`);
      const phantom = [...new Set([...t.matchAll(/(?<!\w:)\b(D-\d+)\b/g)].map((m) => m[1]))].filter((id) => !known.has(id));
      if (phantom.length) warnings.push(`docs/${f} cites ${phantom.join(', ')} — no such entry or stub. IDs are minted in DECISIONS.md at log time; planning docs say "next free ID", never a number. Citing another repo's log? Qualify it: \`<repo>:D-nnn\`.`);
    }
  }

  // 11. stale git-state claims — a plain-prose "uncommitted" claim outlives its commit.
  // SECTION-SCOPED to `## Current state`: that is the only section where the word is a
  // live claim about the repo right now. Elsewhere — Next steps, Not yet verified, prose
  // about this very check — it is description, and matching it there is what taught
  // writers to phrase around the check instead of writing the truth. Quoted spans are
  // still stripped inside the section: match the act, not the mention (D-014).
  if (handoff != null) {
    const section = handoff.split(/^##\s+/m).find((s) => /^Current state/i.test(s)) ?? '';
    const claim = section.replace(/`[^`]*`|"[^"]*"/g, '');
    if (/\buncommitted\b|\bnot (?:yet )?committed\b/i.test(claim)) {
      try {
        const dirty = execSync('git status --porcelain', { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
        if (!dirty) warnings.push('docs/HANDOFF.md "Current state" claims uncommitted work but the working tree is clean — the claim outlived its commit. Rewrite as committed state (with the hash).');
      } catch { /* not a git repo or git unavailable — skip */ }
    }
  }

  // 12. harden phase — every deliberate shortcut needs a disposition before a
  // project calls itself hardened. Reuses the same harvester `--debt` prints
  // (one scanner, one home); this only counts, it doesn't list.
  if (phase === 'harden') {
    let owed = 0;
    // Only UNDISPOSITIONED shortcuts gate: a note citing a D-nnn has its
    // reasoning and its revisit trigger in the log, which is what "accept" means.
    try { owed = harvest(root).filter((h) => !h.accepted).length; } catch { /* unreadable tree — skip */ }
    // Don't spell a live-looking marker into this string: the quoted-span
    // stripper in debt.mjs can't see through escaped backticks inside a template
    // literal, so the message would harvest itself as a shortcut (observed).
    if (owed) warnings.push(`Phase is harden and ${owed} shortcut${owed > 1 ? 's remain' : ' remains'} without a disposition — run \`lint.mjs --debt\`, then either fix it or accept it by naming the decision that took it in the note, e.g. "(D-014)".`);
  }

  // 13. (attempted and rejected 2026-08-06) A commit-hash check for `## Current
  // state` — D-027's deferred "lint the stale hash" item. Built, pinned, and run
  // against 14 real repos: 13 hits, and only 5 were live claims that rot ("on HEAD
  // `aa58785`", "live at `f87cee8`"). The other 8 were durable references that never
  // go stale ("tagged v1.0.0 on `4f92c21`", "the reorg is committed in `ee78a8f`").
  // Verification (`git cat-file`) and a same-line date exemption were not enough —
  // the only thing left separating the two is prose wording ("committed ON" vs
  // "committed IN"), and a regex fitted to one author's phrasing is exactly why
  // check 8 was retired. D-027's condition was "if it can be done without false
  // positives"; the measured answer is no. Recorded on D-027's revisit-if — do not
  // rebuild it without a discriminator that isn't wording.

  // 14. parallel decision series — a hand-rolled ID scheme inside the main log
  // (field: ~25k of one repo's 30k budget sat in a ## W-001…W-018 series) gets
  // none of the integrity checks: no ID parity, no archive candidates, no
  // phantom detection. Only heading blocks that LOOK like entries (a
  // **Decision:**/**Status:** field) count — "## HTTP-2 support" is prose, not
  // an escape. One warning per series, not per entry: 18 lines is noise.
  if (decisions != null) {
    const series = new Map();
    for (const h of decisions.matchAll(/^#{2,3}\s+(([A-Z]{1,5})-\d+)\b/gm)) {
      if (h[2] === 'D') continue;
      const rest = decisions.slice(h.index + h[0].length);
      const nx = rest.search(/^#{1,3}\s/m);
      const block = nx >= 0 ? rest.slice(0, nx) : rest;
      if (!/\*\*(Decision|Status):\*\*/.test(block)) continue;
      if (!series.has(h[2])) series.set(h[2], []);
      series.get(h[2]).push(h[1]);
    }
    for (const [prefix, ids] of series)
      warnings.push(`docs/DECISIONS.md carries a parallel ${prefix}-series (${ids[0]}…${ids[ids.length - 1]}, ${ids.length} entr${ids.length > 1 ? 'ies' : 'y'}) the integrity checks cannot see — full entries use ### D-nnn, or the series is a domain split by another name: move it to docs/DECISIONS-<domain>.md.`);
  }

  return { errors, warnings, budget, phase };
}

function duplicates(arr) {
  const seen = new Set(), dup = new Set();
  for (const x of arr) (seen.has(x) ? dup : seen).add(x);
  return [...dup];
}

// CLI
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const i = process.argv.indexOf('--path');
  const root = i >= 0 ? process.argv[i + 1] : '.';

  // --debt: print the `koan:` shortcut ledger instead of linting docs. Same
  // engine the harden-phase check 12 counts — one harvester, one home.
  if (process.argv.includes('--debt')) {
    const hits = harvest(root);
    if (!hits.length) console.log('koan debt: no `koan:` shortcuts found — ledger empty.');
    else {
      // Accepted entries stay LISTED — they are still debt someone may want to
      // pay. They just don't gate the harden phase. Hiding them would trade one
      // silent ledger for another.
      const owed = hits.filter((h) => !h.accepted).length;
      console.log(`koan debt ledger (${hits.length} shortcut${hits.length > 1 ? 's' : ''}, ${owed} undispositioned):\n`);
      for (const h of hits) console.log(`  ${h.accepted ? 'accepted' : 'open    '}  ${h.file}:${h.line}  ${h.note}`);
    }
    process.exit(0);
  }

  const { errors, warnings, budget, phase } = lint(root);
  for (const e of errors) console.error(`ERROR: ${e}`);
  for (const w of warnings) console.error(`WARN:  ${w}`);
  if (budget.length) console.log(`budget: ${budget.join(' · ')} · phase ${phase}`);
  const verdict = errors.length ? `${errors.length} error(s) to fix`
    : warnings.length ? `${warnings.length} warning(s)` : 'clean';
  console.log(`koan-lint: ${verdict}`);
  process.exit(errors.length ? 2 : warnings.length ? 1 : 0);
}
