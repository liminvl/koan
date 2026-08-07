#!/usr/bin/env node
// Stage 2 — continuity benchmark (lose-less axis). Can a FRESH agent, given only
// the notes, resume correctly? This is what ponytail can't measure.
//
//   node run.mjs --selftest    # offline: prove each corpus is fair + discriminating
//   node run.mjs               # real run: feed notes to `claude`, LLM-judge answers
//
// Two arms hold the INFORMATION constant and vary only the DISCIPLINE:
//   koan     — the wrapped fixture/ (snapshot + Next-steps/Open-questions/Decision labels)
//   baseline — fixture-unwrapped/notes.md (same facts as an undisciplined dev diary)
// koan can only win on structure, not on more info — the corpora are ~equal size
// and every fact is derivable from both. Same questions, same judge; the diary
// phrases facts differently, so its offline fairness anchors are `unwrapped`.
//
// The real run needs the `claude` CLI; the selftest needs nothing.
// Scoring is two-layer: a strict substring floor (free, deterministic) plus the
// judge.md LLM rubric (0-3), which scores meaning so paraphrases aren't misses.
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lint } from '../../src/lifecycle/lint.mjs';
import { claudeArm, available, arg } from '../claude-cli.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURE = join(HERE, 'fixture');
const gt = JSON.parse(readFileSync(join(HERE, 'groundtruth.json'), 'utf8')).questions;

const ARMS = ['koan', 'baseline'];
// The un-wrapped arm reads its `unwrapped` anchors (its own phrasing); the koan
// arm reads the canonical `expect` keys, which its docs use verbatim.
const anchors = (arm, q) => arm === 'baseline' ? q.unwrapped : q.expect;
const corpus = (arm) => arm === 'baseline'
  ? readFileSync(join(HERE, 'fixture-unwrapped', 'notes.md'), 'utf8')
  : ['CLAUDE.md', 'docs/HANDOFF.md', 'docs/DECISIONS.md']
    .map((f) => readFileSync(join(FIXTURE, f), 'utf8')).join('\n');

const JUDGE_MODEL = 'claude-sonnet-4-6'; // pinned — see judge.md

const judgePrompt = (q, ans, expect) => `You are a strict benchmark judge. A fresh agent resumed a project cold and answered a question using only the project's notes. Score the answer against the groundtruth keys.

Question: ${q}
Answer: ${ans}
Groundtruth keys: ${expect.join(' · ')}

Rubric: 0 = wrong or contradicts the keys · 1 = vague but not wrong · 2 = correct but missing a stated detail · 3 = correct and complete. Judge meaning, not wording — a paraphrase of a key counts as covering it.

Reply with ONLY this JSON: {"score": <0-3>, "fact": "<the specific groundtruth fact you judged present or absent>"}`;

function parseJudge(text) {
  const m = (text || '').match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    const j = JSON.parse(m[0]);
    return Number.isInteger(j.score) && j.score >= 0 && j.score <= 3 && typeof j.fact === 'string' ? j : null;
  } catch { return null; }
}

if (process.argv.includes('--selftest')) selftest();
else realRun();

function selftest() {
  let failed = 0;
  // a) the koan fixture's own docs must be lint-clean — a broken fixture is an unfair test
  const { errors } = lint(FIXTURE);
  if (errors.length) { for (const e of errors) console.error(`FAIL fixture lint: ${e}`); failed += errors.length; }
  else console.log('  ok  fixture docs are lint-clean');

  // Both corpora must be fair + discriminating on their OWN anchors — otherwise
  // the A/B is rigged (koan can't win by the diary omitting a fact, and the diary
  // can't win by leaking an answer the strip should have removed).
  for (const arm of ARMS) {
    const text = corpus(arm);
    for (const q of gt) {
      const keys = anchors(arm, q);
      // b) FAIR: every fact is derivable from this arm's corpus
      const missing = keys.filter((e) => !text.includes(e));
      if (missing.length) { console.error(`FAIL [${arm}] "${q.q}": not derivable — ${missing.join(', ')}`); failed++; continue; }
      // c) DISCRIMINATING: strip the lines carrying the fact → it must become underivable
      const stripped = text.split('\n').filter((l) => !keys.some((e) => l.includes(e))).join('\n');
      if (keys.every((e) => !stripped.includes(e))) console.log(`  ok  [${arm}] "${q.q}" — fair and discriminating`);
      else { console.error(`FAIL [${arm}] "${q.q}": answer survives removal of its source — test doesn't discriminate`); failed++; }
    }
  }
  // Structural fairness: the two corpora must be comparable in size, so koan can
  // only win on discipline, not on carrying more (or less) raw information.
  const [kn, bl] = ARMS.map((a) => corpus(a).length);
  const ratio = Math.max(kn, bl) / Math.min(kn, bl);
  if (ratio <= 1.5) console.log(`  ok  corpora comparable in size (koan ${kn} vs baseline ${bl} chars, ${ratio.toFixed(2)}x)`);
  else { console.error(`FAIL corpora sizes differ ${ratio.toFixed(2)}x (koan ${kn} vs baseline ${bl}) — A/B would measure info volume, not discipline`); failed++; }
  // d) judge plumbing works offline: the parser takes clean or chatty verdicts, rejects noise
  const parses = parseJudge('{"score": 2, "fact": "names the DELETE endpoint"}')?.score === 2
    && parseJudge('Here is my verdict:\n{"score":0,"fact":"contradicts YAGNI"}')?.score === 0
    && parseJudge('no json at all') === null
    && parseJudge('{"score": 7, "fact": "out of range"}') === null;
  if (parses) console.log('  ok  judge parser: accepts verdicts, rejects noise and out-of-range scores');
  else { console.error('FAIL judge parser'); failed++; }
  const p = judgePrompt(gt[0].q, 'some answer', gt[0].expect);
  if ([gt[0].q, 'some answer', ...gt[0].expect].every((s) => p.includes(s))) console.log('  ok  judge prompt: carries question, answer, and every groundtruth key');
  else { console.error('FAIL judge prompt is missing an input'); failed++; }

  console.log(failed ? `\nselftest: ${failed} failure(s)` : '\nselftest: fixture is a fair, discriminating cold-resume test');
  process.exit(failed ? 1 : 0);
}

function realRun() {
  if (!available()) {
    console.error('The real run needs the `claude` CLI on PATH. Run `node run.mjs --selftest` offline.');
    process.exit(2);
  }
  // --model <id> pins the RESUME agent only — "can a weaker reader still resume
  // from these notes?". The judge stays pinned to JUDGE_MODEL (D-011) regardless.
  const model = arg('--model');
  // --arms koan,baseline — the wrapped-vs-unwrapped A/B; default runs both.
  const armNames = (arg('--arms') || ARMS.join(',')).split(',').filter((a) => ARMS.includes(a));
  const resumeArgs = ['-p', '--output-format', 'text', ...(model ? ['--model', model] : [])];
  // Resume agent and judge run context-free (D-012): the notes ride the prompt
  // inline, so --safe-mode + neutral cwd cost nothing here — and without them
  // both calls inherit the koan repo's CLAUDE.md chain and global skills.
  const judge = (q, ans, expect) =>
    parseJudge(claudeArm(['-p', '--output-format', 'text', '--model', JUDGE_MODEL], judgePrompt(q, ans, expect)).stdout);
  // judge.md discipline: the judge must rank a known-good answer above a known-bad
  // one for a question before its scores there are trusted. Calibration depends
  // only on the question (not the arm), so memoize it across arms.
  const calibrated = new Map();
  const judgeTrusted = (q, expect) => {
    if (!calibrated.has(q)) {
      const good = judge(q, `The notes state: ${expect.join('; ')}.`, expect);
      const bad = judge(q, 'The notes never mention this; it is unspecified.', expect);
      calibrated.set(q, Boolean(good && bad && good.score > bad.score));
    }
    return calibrated.get(q);
  };
  const rows = [];
  const summary = [];
  for (const arm of armNames) {
    const docs = corpus(arm);
    for (const { q, expect } of gt) {
      const prompt = `You are resuming a project cold. Using ONLY these notes, answer in one sentence.\n\n--- NOTES ---\n${docs}\n--- END ---\n\nQuestion: ${q}`;
      const ans = (claudeArm(resumeArgs, prompt).stdout || '').trim();
      // strict floor: free, deterministic, but literal — treats paraphrases as misses
      const hit = expect.every((e) => ans.toLowerCase().includes(e.toLowerCase()));
      // untrusted calibration ⇒ report strict only for this question
      const j = judgeTrusted(q, expect) ? judge(q, ans, expect) : null;
      rows.push({
        arm,
        question: q.slice(0, 34),
        strict: hit ? 'yes' : 'no',
        judge: j ? `${j.score}/3` : 'untrusted',
        fact: (j?.fact ?? '').slice(0, 44),
        answer: ans.slice(0, 52),
      });
    }
    const armRows = rows.filter((r) => r.arm === arm);
    const strict = armRows.filter((r) => r.strict === 'yes').length;
    const trusted = armRows.filter((r) => r.judge !== 'untrusted');
    const judged = trusted.reduce((s, r) => s + Number(r.judge[0]), 0);
    summary.push({ arm, chars: docs.length, strict: `${strict}/${armRows.length}`,
      judge: `${judged}/${trusted.length * 3}`, untrusted: armRows.length - trusted.length });
  }
  console.table(rows);
  console.table(summary);
  console.log(`\nWrapped-vs-unwrapped cold-resume. koan > baseline on judge = the wrap's`
    + ` structure (Next-steps / Open-questions / Decision labels) earns its keep on accuracy;`
    + ` equal at ~equal chars = structure adds nothing here (an honest null). A wrap that`
    + ` drops or misclassifies a fact shows up as a miss.`);
}
