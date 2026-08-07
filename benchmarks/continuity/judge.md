# Continuity judge rubric

The real Stage 2 run scores each cold-resume answer twice: a strict substring
match (the free, deterministic floor) and this LLM judge (implemented in
`run.mjs`), which scores meaning so paraphrases aren't misses — same auditable
discipline as Stage 1.

- **Model:** fixed (`claude-sonnet-4-6` via `claude --model`). The CLI doesn't
  expose temperature — treat judge scores as near- but not fully deterministic.
- **Input:** the question, the resuming agent's one-sentence answer, the
  `groundtruth.json` `expect` keys.
- **Rubric:** `0` wrong/contradicts the docs · `1` vague but not wrong · `2` correct
  but missing a stated detail · `3` correct and complete.
- **Discipline:** every score names the specific fact it judged present or absent.
- **Self-test:** per question, the judge must score a synthetic known-good answer
  above a known-bad one before its score is trusted; a question that fails
  calibration reports `untrusted` and falls back to the strict floor.
