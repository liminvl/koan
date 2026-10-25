# Discovery evals

A `claude plugin eval` suite (D-049). Stage 1 measures whether a rule changes
behavior with the core injected as a system prompt. This suite measures the
thing Stage 1 cannot: whether the **installed** plugin fires at all from its
descriptions, on prompts a user would actually type, with a no-plugin baseline
arm for the result graders. Every `koan-*-fired` grader is a with-only
indicator; the scored graders are the outcomes.

Source of truth is this directory; the build copies it into
`dist/claude/evals/` because the tool reads the suite from inside the plugin.
`push.mjs` never ships it.

```bash
npm run build
claude plugin eval ./dist/claude --scaffold --trust-plugin \
  --allow-tools Write Edit --max-cost-usd 15
```

`--scaffold` is required: cases seed their workspace from `_fixtures/*.sh`
(plain `sh`; git is used for the init commit). `--runs 3` is the promotion-
grade shape ([[D-022]]'s 2-of-3); the cases default to one run each so a full
sweep stays cheap. Bash is deliberately not granted (native Windows has no
sandbox backend, and no case needs it). Results land under
`dist/claude/evals/results/`, which is gitignored; record a run in
`benchmarks/results/` like any other.
