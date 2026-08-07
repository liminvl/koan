# 2026-07-11 — Stage 2 wrapped-vs-unwrapped A/B on Opus 4.8

- **koan version:** 0.1.0 (probe wired this session)
- **Stage:** 2 (continuity / lose-less), now **comparative** (2 arms)
- **Model(s):** resume agent Opus 4.8; judge sonnet-4-6 (pinned, D-011). n=1.
- **Arms:** `koan` (wrapped fixture, 2068 chars) vs `baseline`
  (`fixture-unwrapped/notes.md`, an undisciplined dev diary, 2213 chars) — same
  facts, near-equal size (1.07x), so any gap is **structure**, not information.

## Headline
**Near-tie: koan judge 15/15, baseline 14/15.** On Opus 4.8, koan's wrap
structure (Next-steps / Open-questions / Decision labels) gave **no measurable
cold-resume accuracy advantage** over an equal-size, complete diary. Both
deliberate traps failed to fool the model. The lone point gap is a *terse
answer*, not a misclassification. This **tempers the same-day single-arm Stage 2
result**: that 15/15 reflected an easy fixture, not koan superiority — an
equal-size diary scores 14/15.

## Numbers
| arm | chars | strict | judge |
|---|---|---|---|
| koan | 2068 | 3/5 | **15/15** |
| baseline | 2213 | 1/5 | **14/15** |

Per-question: both arms scored 3/3 on Q0–Q3. The only difference is **Q4 (auth)**:
koan 3/3 (complete: "must live in the route handler, never in middleware"),
baseline 2/3 (terse: "Auth (the auth check).", correct subject, missing the
handlers-not-middleware detail).

- **Trap 1 (Q2, SQLite red herring):** baseline 3/3 — gave the YAGNI/no-deploy
  reasoning, did not anchor to the abandoned SQLite mention.
- **Trap 2 (Q4-open-question, impl-stated-as-decided):** baseline 3/3 — correctly
  identified list() as the *open* question, did not treat the current impl as the
  answer. The structural-label advantage did not surface on a frontier reader.
- Strict floor (koan 3/5, baseline 1/5) is the literal-vocabulary artifact — the
  diary phrases facts in its own words, so it matches the canonical keys even
  less; ignore for cross-arm comparison (D-011: the judge scores meaning).

## Regression check (vs previous version)
No skill-token change. This is the **third informative null of the day** (Stage 1
build-less ×2, now the lose-less A/B). Consistent thread: on a frontier model +
small clean fixtures, koan's disciplines produce no measurable outcome delta.

## Caveats / supersession
- **The fixture is deliberately small and the diary deliberately complete + clean**
  (D-016 — don't build a benchmark bigger than what it measures). The regime where
  snapshot-not-diary *should* pay off — real diaries at 10–100x the size, with
  accumulated stale/contradictory content and context-window pressure — is exactly
  what this fixture cannot test. **No delta here ≠ no delta at scale.**
- **n=1.** The traps are one construction; a different diary might catch Opus.
- Does not supersede `…-stage2-opus-cold-resume.md`; it reframes it (that run's
  15/15 was fixture-easiness, not a koan-vs-nothing win — this A/B is the honest
  comparative number).
- **Open decision:** keep the A/B arm and invest in a *scale* fixture (the only
  place the wrap's value is likely to show), or cut it as a converged instrument
  (D-006). Not decided this session.
