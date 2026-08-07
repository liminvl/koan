# Handoff

> _Last drift-audit: never_

## Objective
A minimal todo HTTP API. Done when add / list / complete / delete all work and are tested.

## Current state
add, list, and complete are implemented in src/store.js on commit `f1c2b3a`. Tested by hand only.

## Next steps
1. Implement the DELETE endpoint and a `remove(id)` in the store.
2. Add `node --test` coverage for the store.

## Not yet verified
- complete() behavior on a missing id (claims to return null; no test yet).

## Open questions for the human
- Should list() return completed todos, or only open ones?
