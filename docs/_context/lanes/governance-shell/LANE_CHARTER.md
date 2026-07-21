# Governance & Shell Lane — Charter
*Drafted 2026-07-20 by the design-intent advisory session, ahead of Program approval.
Becomes live only when Program approves the lane split and the infrastructure exists.*

## What this lane owns

The **outside layer** from the Boundary Ruling: project, identity, permissions, data
retrieval, deferred-decision visibility, and the shell that hosts modules. In plain
terms: who you are, which project you're in, what you may see, and how you take data
away.

## What this lane must never touch

- The kitchen. The Engine consumes a set of selections and nothing else. This lane
  never adds an input to the Engine, never blocks a run, never reaches across the
  boundary. Governance SHAPES what appears; it never BLOCKS the kitchen.
- Prices. HubSpot owns price. This lane never displays or computes one.
- HubSpot writes. `writePolicy: { enabled: false }` stays until separately approved.
- Other lanes' worktrees, donor code, `main`.

## Founding documents (read before any work)

| Document | What it carries |
|---|---|
| `C:\ControlStack_Worktrees\RULE_one_owner_one_kind.md` | The rule: one owner, one kind. The Boundary Ruling. Shaping vs blocking. AI slot rules. |
| `C:\ControlStack_Worktrees\PROGRAM_WORK_SHAPE.md` | The work, organised. This lane owns items 3, 4, 6 and 9. |
| `C:\ControlStack_Worktrees\BRIEF_PROJECT_RESTORATION.md` | The persistence/identity/CRM-link restoration slice, donor-verified. |
| `C:\ControlStack_Worktrees\MOCKUP_PROJECT_SHELL.html` | Patrick-confirmed UI truth. Its decision registry panel is binding: RULED rows are settled, OPEN rows are not yours to resolve. |
| `C:\ControlStack_Worktrees\BRIEF_HUBSPOT_SANDBOX.md` | The sandbox exploring CRM behaviour. Nothing graduates from it into this lane — proven behaviour is re-specified here, never copied. |

## Standing rules (non-negotiable)

1. **One owner, one kind.** Name the owner and the kind of every fact before building
   against it. A Derived fact is never requested as a Given. Test the rule, not the
   instance.
2. **Never fabricate project truth.** No invented envelopes, acknowledgements,
   revisions or fixtures to manufacture a green result.
3. **Restoration before design.** The donor built most of this layer. Check the donor
   (via the advisor, who has access) before designing anything new.
4. **AI is named slots only** — five parts (name, input, output, approval, off-state),
   product fully functional with AI off. Machine surfaces, humans approve.
5. **No CRM push may be called a "gate".** Pushes are consequences of state entry.
6. **Readiness and Identity stay separate conditions** at the retrieval point, named
   separately, never merged.
7. Patrick is not a developer. Evidence goes in files; instructions to Patrick are
   finished copy-paste blocks.

## STANDING ORCHESTRATOR — Governance & Shell

You are the standing orchestrator for the Governance & Shell lane. Verify lane identity
(root, branch, gate) from `LANE_STATE.md`. Read all canonical context files and the
founding documents above. You write and order queue items in `WORK_QUEUE.md`; exactly
one item is `ready` at a time. Seam changes (persistence, schema, identity, endpoints,
new producers/consumers) go to Program & Integrate for decision before implementation.
You review at batch boundaries, seams and human-observation stops, not every parcel.

## STANDING WORKER — Governance & Shell

You are a standing worker for the Governance & Shell lane. Verify lane identity from
`LANE_STATE.md`; compare recorded branch HEAD with actual HEAD and stop if stale.
Execute only the top `ready` queue item, within exactly its authorised files. Focused
evidence, full lane gate, exact staged-set equality, gated commit/push, documentation
closeout — then take the next ready item, up to five parcels per run. Stop immediately
on: seam approval required, stale lane state, gate failure, out-of-scope behaviour,
queue empty, or acceptance needing human eyes (return NEEDS YOU with exact steps).
