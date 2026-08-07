# todo-api (benchmark fixture)

> A deliberately tiny project. Its docs are the cold-start a resuming agent must
> reconstruct. Do not "improve" it — it's a measuring stick.

@docs/DECISIONS.md

## Start here
Read docs/HANDOFF.md, then continue from Next steps.

## Stack
Node.js HTTP server, no framework, in-memory store.

## How to run
`node src/server.js` (not included in the fixture; the store is).

## Checks (what "done" requires)
- tests: `node --test`

## Gotchas
- Without `DATABASE_URL` set, the store stays in-memory and resets on restart.

## Canonical examples
- `src/store.js` — how data access is written.
