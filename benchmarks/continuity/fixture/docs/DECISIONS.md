# Decisions

> Auto-loaded; keep lean. IDs are permanent.

### D-001: In-memory store now, DB behind DATABASE_URL later
- **Decision:** Data lives in an in-memory Map; a DB-backed store swaps in only when `DATABASE_URL` is set.
- **Why:** The API surface is what's being designed; persistence is YAGNI until there's a deploy target.
- **Alternatives rejected:** SQLite from the start (premature), Postgres (no deploy yet).
- **Status:** accepted · _2026-06-30_
- **Revisit if:** a deploy target appears.

### D-002: Auth in handlers, never middleware
- **Decision:** Any future auth check lives in the route handler, not shared middleware.
- **Why:** Handlers have full request context; middleware-level checks are easy to bypass.
- **Status:** accepted · _2026-06-30_
- **Revisit if:** a vetted auth library makes middleware checks safe.

## Archived decisions index
