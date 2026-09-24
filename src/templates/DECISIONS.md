# Decisions

> Auto-loaded every session — keep it lean (≤ ~30k chars). Choice + why only.
> An entry is five short fields, not an essay: reasoning that needs paragraphs
> belongs in the commit. Settled/implemented entries get archived to
> DECISIONS-archive.md with a stub below. IDs are permanent — never renumber.

### D-001: <title>
- **Decision:** <what was chosen>
- **Why:** <the reason a future session shouldn't re-litigate>
- **Alternatives rejected:** <what and why not>
- **Status:** proposed · _<date>_
- **Revisit if:** <what would reopen this>

<!-- A filled entry, for shape:
     ### D-001: Authorization in route handlers, never middleware
     - **Decision:** All authz checks live in route handlers, not middleware/proxy.
     - **Why:** Middleware runs on the edge without full session context;
       centralizing authz there caused bypass risk. Handlers have the verified session.
     - **Alternatives rejected:** edge middleware authz (bypass risk), per-component guards (easy to forget).
     - **Status:** accepted · 2026-06-30
     - **Revisit if:** the framework gives middleware reliable verified-session access. -->

## Archived decisions index
<!-- one stub per archived decision: - **D-0NN** — <title> — <status> · archived -->
