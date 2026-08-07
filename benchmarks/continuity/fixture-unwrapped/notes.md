# dev notes — todo-api

## mon
starting the todo api. plain node http, no framework — not pulling in express for
four routes. server is src/server.js, and all the data access lives in
src/store.js. store is just a Map right now with add() and list().

almost reached for sqlite on day one so restarts wouldn't wipe everything — even
sketched a schema. backed it out though: there's no deploy target yet and the
point of this pass is getting the api surface right (add / list / complete /
delete), not persistence. so it stays an in-memory Map, and a db-backed store
only swaps in later, when DATABASE_URL is actually set. sqlite from the start was
premature; postgres more so (nothing to deploy to). no database until there's a
real reason for one.

added complete() as well. it's meant to return null when the id doesn't exist,
but i only checked that by hand — no test for the missing-id path. everything is
hand-tested so far, no automated coverage at all. committed add / list / complete
as f1c2b3a.

list() currently returns every todo in the map. fine for a demo, but i'm not
sure it's actually correct — should list() hand back completed todos too, or only
the open ones? left it returning all for now, but that's a genuine product call
somebody has to make; not mine to just settle.

## tue
back on it. the obvious next move is delete — there's no DELETE route and no
remove(id) on the store yet, so that's top of the pile. after that, finally write
`node --test` coverage for the store, especially that complete()-on-missing-id
claim that's still unverified.

tangential but don't lose it: whenever auth shows up, it must NOT live in
middleware. the check goes in the route handler itself. middleware-level auth
reads clean but it's too easy to bypass, and the handler is where you've got the
full request context anyway. so auth belongs in handlers — full stop — unless
some vetted library ever makes middleware checks genuinely safe.

to run: `node src/server.js`. heads up, if DATABASE_URL isn't set it just stays
in-memory and resets on every restart — expected, per the mon note.

still open and NOT decided: that list() completed-vs-open question from monday.
flagging it again so it doesn't slip.
