# Document routing

Use when init or wrap encounters mixed notes, durable supporting material, or
an oversized core file. Applies to code, operations, research and creative work.

## Choose the home by the question it answers

- **What did we choose, why, and what would reopen it?** DECISIONS. Keep enough
  rationale to understand the choice without opening the supporting evidence.
- **Where are we now; what's next or unverified?** HANDOFF. Detailed per-film or
  workstream status may live locally; the shared handoff keeps the next action
  and a pointer. Reuse the project's backlog for work outside the active frontier.
- **What must every session respect?** Constitution: project-wide constraints,
  orientation and entry commands. Area-specific mechanics belong in reference.
- **How do we repeat this task and check the outcome?** Procedure, workflow or
  runbook. Include prerequisites, steps and proof; recovery where applicable.
  Don't invent a rollback or claim a procedure has been exercised.
- **What are the identities, definitions or capabilities?** Reference: inventory,
  glossary, schema or asset catalogue. A script catalogue need not be a runbook.
- **What did we observe, under which conditions?** Evidence: research notes,
  experiment record or findings. Retain date, settings/version, source or artifact,
  outcome and uncertainty. Correct/retract findings without erasing their evidence.
- **What must the result satisfy?** Spec, brief, contract or style/continuity guide.
  Decisions hold the choice and why; the governing document holds the requirements.

## Create or reuse

Reuse an existing suitable home first. Create a document when there is concrete,
durable content with a distinct task or reader and a clear reason to open it.
Don't wait for the core files to overflow; don't create empty folders or one file
per observation. A short related finding can be a section in an existing document.
Names follow the project, not a mandatory taxonomy or universal RUNBOOK.md.

Give supporting docs a short purpose and read trigger; evidence also needs its
scope/source. Link from the constitution or the relevant task document:
“Restoring the service? Read docs/restore.md”; “Checking this film's continuity?
Read films/current/brief.md.” Keep critical project-wide constraints in the
constitution. One authoritative home per fact permits a brief summary + pointer.

For a large reference, add useful headings and a contents/search pointer; split
when different tasks need different subsets. “Editing the Qwen workflow? Read
its section in docs/engines.md” beats requiring every engine's findings. Moving
a monolith without narrowing its read trigger does not save task context.

## Preserve meaning

Move procedures and detailed evidence without losing provenance. Keep decision
IDs/citations valid and rationale intelligible; don't bury needed explanations
only in commit messages. Current live state is queried (record how), while a
past measurement is retained with its date and conditions. “Restore passed on
this date” is evidence; “restore works” is an unsupported ongoing claim.

Examples: a deployment choice stays in DECISIONS, restore steps in a procedure,
and the drill result in dated evidence. A film's identity-consistency choice
stays in DECISIONS, its character requirements in the brief, measured render
comparisons in findings, and the pending approval in HANDOFF.

## Budgets

Core continuity limits are guardrails, not targets; leave room for the next
session. Don't ratchet consumer limits down after each cleanup. Supporting
knowledge may grow: check the material a representative task must read, not all
stored knowledge. `koan-lint --context <path>` (repeat for each selected file)
reports a whole-file estimate including the core docs; it cannot infer triggers
or measure a section-only read. Narrow retrieval before cutting useful evidence.
