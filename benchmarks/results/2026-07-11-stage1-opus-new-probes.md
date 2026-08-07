# 2026-07-11 — Stage 1, two new probes on Opus 4.8 (dependency-reach + under-build guard)

- **koan version:** 0.1.0 (probes added in `547589a`; run on `d24a203`)
- **Stage:** 1 (outcome)
- **Model(s):** Opus 4.8 (`claude-opus-4-8`), n=1 — first Opus datapoint (matrix
  previously stopped at fable-5 / sonnet-5 / haiku-4.5)
- **Arms:** baseline, koan, rival

## Headline
Both new probes **converge across all three arms on Opus 4.8** — no dependency
reach by anyone, koan does **not** under-build, every gate passes. On the
strongest model, koan's build-less half shows **no measurable outcome delta** on
these well-specified tasks. An informative null, not a signal: the model already
does the lean, correct thing unprompted.

## Numbers
| arm | task | gate | loc | deps | trail |
|---|---|---|---|---|---|
| baseline | formatBytes | pass | 12 | — | — |
| rival | formatBytes | pass | 9 | — | — |
| koan | formatBytes | pass | 9 | — | — |
| baseline | parseConfig | pass | 19 | — | — |
| rival | parseConfig | pass | 16 | — | — |
| koan | parseConfig | pass | 17 | — | — |

- **Dependency-reach (`formatBytes`):** every arm wrote a zero-dependency stdlib
  formatter and kept the "Zero dependencies" comment; `package.json` clean for
  all three. koan's "prefer the standard library" rule had no reach to prevent —
  the `deps` axis cannot discriminate on Opus for this task.
- **Under-build guard (`parseConfig`):** koan passed the gate (threw on the
  malformed line). No over-correction into laziness — the guard fired its check
  and correctly found nothing. This is a *reassuring* negative, not a miss.
- loc deltas (koan/rival ~3 lines under baseline) are within noise at n=1; no
  trail on either task because both are fully specified with nothing to defer.

## Regression check (vs previous version)
No skill-token change this session (the probes are benchmark instruments, not
core rules). Outcome flat AND tokens flat ⇒ neither a promotion nor a cut under
D-006's rule; the instruments simply report a null. Per D-013 the probes' gates
did not flip on Opus, so they earn no core seat here (they were never in core).

## Caveats / supersession
- **n=1**, and a null — not chased. D-022 reserves replication for *promotions*;
  D-016 warns against a heavier fixture to manufacture a delta. No Fable
  comparison run: it would only re-confirm the model-dependence D-018 already
  records.
- This **extends D-017/D-018's convergence finding to `opus-4-8`** and to two
  task families built specifically to bait over- and under-building — and it
  still converges. Consistent with D-023 (frontier-model kit; core stays as-is):
  the stronger the model, the less the build-less nudge changes on small
  well-specified tasks.
- What this can't show: koan's value on genuinely vague / large-scope tasks
  (cacheDocs-style) where over-building actually surfaces, or on the lose-less
  axis (Stage 2). Does not supersede any prior run — new model, new probes.
