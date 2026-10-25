#!/bin/sh
# Shared eval fixture: a tiny Express orders service with koan continuity docs.
# Sourced by each case's scaffold.sh (claude plugin eval runs it in the empty
# workspace, only under --scaffold). `wip` as $1 leaves an uncommitted edit so
# a checkpoint has something to record.
set -e
mkdir -p docs
cat > package.json <<'EOF'
{ "name": "orders-service", "private": true }
EOF
cat > db.js <<'EOF'
// In-memory stand-in for the Postgres adapter.
module.exports = { orders: { create: async (order) => ({ id: 1, ...order }) } };
EOF
cat > app.js <<'EOF'
const express = require("express");
const app = express();
app.use(express.json());
app.post("/api/orders", async (req, res) => {
  const order = await db.orders.create(req.body);
  res.status(201).json(order);
});
module.exports = app;
EOF
cat > docs/DECISIONS.md <<'EOF'
# Decisions

> Choice + why only. IDs are permanent — never renumber.

### D-001: Express + Postgres for the orders service
- **Decision:** Plain Express handlers over a framework; Postgres via `db.*`.
- **Why:** Smallest stack that serves the three endpoints we have.
- **Status:** accepted
EOF
cat > docs/HANDOFF.md <<'EOF'
# Handoff

## Objective
Orders service: three endpoints, keep it small.

## Current state
Create endpoint works.

## In progress
Reported bug: POST /api/orders throws `ReferenceError: db is not defined`.

## Next steps
1. Fix the reported bug.
2. Rate limiting on POST /api/orders.
EOF
git init -q -b main
git add -A
git -c user.email=eval@koan -c user.name=koan commit -qm init
if [ "$1" = "wip" ]; then
  printf '// WIP: sliding-window limiter, untested\nmodule.exports = () => (req, res, next) => next();\n' > rateLimit.js
fi
