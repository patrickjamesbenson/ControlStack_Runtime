# Work shape for Program & Integrate — the governance layer

*Written 2026-07-20 by the cross-lane advisory session, at Patrick's request.*
*Proposal only. Program owns lane assignment, sequencing and seam approval.*

**Purpose:** everything agreed but not yet built, organised so Patrick can run several lanes in
parallel. Read `RULE_one_owner_one_kind.md` first — it carries the reasoning. This file carries the
work.

---

## The shape in one paragraph

The Boundary Ruling split the system in two. **Inside** is the kitchen: selections in, verified
output out, deterministic, already stable and tested. **Outside** is the governance layer: identity,
project, timeline, ownership, handoff, CRM and AI. Almost all remaining work is in the outside
layer, it does not touch the Engine, and it can therefore be built in parallel without risk to what
is already proven.

---

## PROPOSED LANE SPLIT

Program to confirm or override. The reason for proposing a **new lane** rather than loading this
onto Selector & Engine is that the Boundary Ruling makes the two genuinely independent — and
Patrick wants to run them at the same time.

| Lane | Owns | Status |
|---|---|---|
| **Selector & Engine** (existing) | The kitchen. Selection surface, Engine, thermal chain, Seam G. | Active |
| **Governance & Shell** (NEW — proposed) | Project, identity, permissions, data retrieval, CRM push. | To be created |
| **CRM & Integration** (NEW — proposed, or fold into Governance) | HubSpot connector, deal lifecycle, leads, sync. | Blocked on Patrick |
| **Program & Integrate** (existing) | Seams, rulings, promotion. | Active |
| **Lab / IES** (existing) | Measured evidence. Complete through LAB-042. | Idle |

**New-lane setup required if approved:** worktree + `lane/governance-shell` branch, an entry in
`controlstack-services.v2.json` with its own MCP scoping, write globs, allowed gates and required
branch. **The advisory session owns creating this** — it is the same infrastructure work as the
existing lanes. No new tool code is needed; the shared `controlstack_mcp.py` already supports
per-lane scoping via environment variables.

---

## WORK ITEM 1 — Retire Gate 1 and Gate 2 · *Selector & Engine*

**Now:** two named CRM push gates — Gate 1 creates the HubSpot deal (requires job ref), Gate 2
updates it with spec and quote.

**Problem:** a **two-milestone** push model against a **three-state** engineering model. They do not
line up. This is the same class of defect as Tier — an old shape that survived a design change.

**Do:** delete Gate 1 and Gate 2 as named gates. Replace with **push on state entry**. The push
becomes a *consequence* of a state change, never a separate thing to reason about or block on.

**Also:** anything still called a "gate" that is a CRM push must be renamed. Reading "gate" in six
months will suggest an Engine gate, which is exactly the confusion that cost weeks.

Size: moderate. No Engine impact.

---

## WORK ITEM 2 — The three readiness states · *Selector & Engine*

**Verified in code:** `specReady` and `buildReady` exist, are computed and surfaced, and there is a
`pathToSpecReady` telling the user what is still missing. **`factoryReady` does not exist anywhere.**

| State | Requires | Marries to |
|---|---|---|
| **Spec Read** | optic slug | deal floor |
| **Build Ready** | optic + luminaire slug | deal floor |
| **Factory Ready** | + runs (post-run completion) | deal floor |

These are **Derived** facts owned by ControlStack. They are never entered by a user.

**Build:** `factoryReady` on the existing pattern. Each state entry pushes to HubSpot (item 1) and
raises the customer-visible deal floor.

**Note:** deal stages were deliberately renamed for the customer view so buyers do not feel they are
being walked down a sales pipeline. Keep those names; do not "correct" them to HubSpot defaults.

Size: moderate.

---

## WORK ITEM 3 — Single data retrieval point · *Governance & Shell*

**One page. Every download in every module passes through it.** It opens when a user tries to take
data away — which is **after** the Engine has run.

Mockup exists: `MOCKUP_DATA_RETRIEVAL.html`.

**Two separate conditions. Do not merge them.**

| | Question it answers | Owner |
|---|---|---|
| **Readiness** | *Is there anything worth giving you?* | ControlStack (Factory Ready etc.) |
| **Identity** | *Who are you?* | Governance layer (email + project) |

Merging these will eventually make identity a precondition for readiness, or the reverse. Name them
separately from the first line of code.

**A downloadable exists at every state.** Spec Read, Build Ready and Factory Ready each yield
something worth taking away.

**Validation is deliberately loose. Patrick's ruling: "bogus is fine, it's a net — casting is a good
idea to catch."** Do not build hard email verification. A false address still records that somebody
engaged and what they wanted. Optimise for capture, not for purity.

**The page also carries the discovery list** — what this module gives, and what the other modules
*could* give. Most users never learn the rest exists.

Size: structural, but self-contained.

---

## WORK ITEM 4 — Restore project persistence · *Governance & Shell*

**This is restoration, not design.** The donor already built it:

- Server: one JSON file per project, `data\session_projects\<job_id>.json`, atomic writes, via
  `/api/session/save` and `/api/session/read`
- Client: envelope store in localStorage, schema `workspace_saved_project.v2`

The runtime's current `savedProjectStore.js` is ~4,800 lines of working save / restore / hydrate
with **no filesystem, localStorage or database calls at all** — a process-memory singleton. So
projects die on server restart. That is a **regression against built donor design**, not a gap.

**Also:** replace `PROJECT_FIXTURES` (Alpha/Bravo/Charlie hardcoded) with real project identity, and
restore `hubspotDealId` / `hubspotContactId` / `hubspotCompanyId`, which the donor type carried and
the extraction dropped.

Brief already drafted: `BRIEF_PROJECT_RESTORATION.md`.

Size: moderate. Well-specified.

---

## WORK ITEM 5 — Fix the misleading save/restore copy · *Selector & Engine*

`projectService.js` reports save and restore as `live: true`. `selectorViewModel.js` displays
*"Save is shell-owned and deferred"*. Both ship in the same runtime. The screen contradicts the
machinery and has misled Patrick repeatedly.

Also present in `emergenceViewModel.js` and `sceneBuilderViewModel.js`.

Size: **one-line parcel class.** Do it early — it removes a standing source of confusion.

---

## WORK ITEM 6 — User module · *Governance & Shell*

Partially wired in the shell already. The donor holds the identity and permissions shape, so expect
restoration rather than design.

**Lookup order is NVB first, then HubSpot. Do not reverse it** — access is decided by Novon's own
authority, not by whether somebody happens to exist in the CRM.

**NVB determines view and access:**
- particular domain → default **internal** view; otherwise **external**
- matched user name **and** domain → that particular internal view
- recognised NVB email → **special parts** access

**HubSpot determines CRM presence:** all users matched; no match → created in the **leads pipeline**
(see item 7).

**Donor identity shape:** status, email, name, actual role, display role — roles being
`external_user | internal_user | internal_engineer | developer`. Permissions block covers
moduleVisible, canRead, canEdit, canExport, canAdmin, requiresIdentity, requiresProject,
fallbackReason.

Two-factor is explicitly deferred.

Size: moderate.

---

## WORK ITEM 7 — HubSpot · *CRM & Integration* · **BLOCKED ON PATRICK**

**Blocked item, and the only one on the whole board that needs Patrick rather than a lane: the
private-app portal scope pre-check.** Recorded as parked in the project shell provenance panel.

**Decision made 2026-07-20:** do **not** block on consolidating to one connector. HubSpot is fully
connected and working in the donor. Swap the data path later — there are no further holes either
way. **Record the deferral in the dev view deferred-decisions panel** (item 9) so it is not lost.

**Ownership split:**

| HubSpot owns | ControlStack owns |
|---|---|
| Contacts, project handling, broad quoting, project management, **price** | The intricate project data layer, **build detail**, the project product component |

**ControlStack must never display or compute a price.** Two places holding a price will drift and
both will look correct.

**Deal lifecycle:**
- Deal creation triggers on **module open** — not on Engine run. No module opens without email and
  project.
- **Hazard: do not wire deal creation into the run path.** Local write succeeds first; the push
  queues. Otherwise the Engine fails whenever HubSpot is unreachable, which also breaks the Boundary
  Ruling.
- Existing deal split → sub-deal, mirrored for CRM tracking. Donor briefs hold the full
  orders/RFQ split-reattach design — ten locked decisions D1–D10, **zero code**.
- Idempotency key is the mandatory pair `controlstack_project_key` + `controlstack_job_ref`.
- Push order is fixed and donor-tested: contact → company → deal → associations → quote rollup.

**Leads:** the portal exposes no LEAD object and the higher tier is deliberately not being bought.
Leads are **deals in a separate leads pipeline**; converted leads are promoted to another pipeline.
Multiple pipelines confirmed available. If a pipeline limit is ever hit, a tag achieves the same
thing — do not bend the design around a tooling limit.

**Storage model:** local is the system of record for engineering state; HubSpot push is best-effort.
**Reads are cached too**, with visible data age, so lookups survive an outage. Push must be
idempotent and replayable.

**Existing runtime code:** contact and company lookups are real and working. **Deal lookup was never
implemented anywhere** — that is the genuine new work.

**Portal housekeeping:** timezone is US/Eastern while currency is AUD, so dates land ~14 hours out.
Fix before reporting is built on it.

Size: large, but mostly restoration once unblocked.

---

## WORK ITEM 8 — AI slots · *cross-cutting, add as surfaces are built*

**The rule:** AI may suggest, explain, rank and draft. **It must never own a fact that has an
authoritative source.** The lumen figure comes from the curve — never from AI, not as a fallback.

**Patrick's pattern, and it is the whole design: MACHINE SURFACES, HUMANS APPROVE.**

**Every AI contribution must be a NAMED SLOT** with five parts — name, input contract, output
contract, approval step, and off-state. **The product must work fully with AI disabled.** Slots are
per-surface, never one global switch.

**Why this matters now:** AI content written as prose in a mockup reads as decoration and gets
dropped at implementation. A named slot survives because somebody has to build it.

**Slots identified so far:**

| Where | Slot |
|---|---|
| **At every readiness state change** | Next steps · who has been in the conversation · what has happened in HubSpot · usage stats · contact stats · what else this client is working on |
| New Project form | Fill this in from an uploaded spec or tender document |
| CRM contact lookup | "Did you mean…" when exact-email match misses |
| Audit log | Summarise what changed |
| Hierarchy / split panel | Suggest sub-envelope names from a site plan |
| Data retrieval page | What is missing here? |
| Selector | Help me fill my selections |
| Drawing take-off | Read the scale on this PDF and mark up take-offs — **high value, high risk; approval mandatory, never implied** |

---

## WORK ITEM 9 — Deferred decisions panel · *Governance & Shell*

A visible list, in the dev view, of every decision consciously parked and why.

**This is not housekeeping.** The project shell was sidelined with a sound rationale that then lived
only in a chat, and recovering it cost weeks. Deferrals that live in documents get lost; deferrals
rendered in the running system do not.

**The mechanism already exists** — the provenance panel in `MOCKUP_PROJECT_SHELL.html` is a working
decision registry distinguishing donor-verified / ruled / planned / parked, with citations. Promote
it from mockup to product.

First entries: the HubSpot two-connector deferral, and two-factor authentication.

Size: small. High leverage.

---

## WORK ITEM 10 — Single data-retrieval choke point · *architectural constraint, applies now*

**Build every module's data retrieval through one gateway.** If each module grows its own download
path, the identity trigger has to be inserted a dozen times and the ones that are missed will fail
silently — they will simply work, without capturing anything.

**This constrains work happening right now**, not later work. Worth telling Selector & Engine while
Seam G is being opened.

---

## STANDING TESTS — must not be dropped

1. **Boundary regression.** Identical selections, different traceability envelopes → identical
   output. Extend to: the Engine must be provably runnable with **no envelope at all**, even though
   the UI will never do that. *(The governance-independence fixture already passes — keep it and
   extend it.)*
2. **Changed-optic.** Changing one optic's measured rise must change both lookup temperature and
   verified output. Non-negotiable while thermal values are placeholders and identical across rows.
3. **Placeholder rule, general form.** Wherever looked-up values are currently identical across
   rows, acceptance must vary one row and prove the output moves. Otherwise the lookup is unproven
   until real data arrives, when it fails silently.
4. **Ownership tests, not instance tests.** *"Indirect capability must equal the selected SYSTEM
   row's value, for every system"* — not *"DNX 60 must report false."* The first fixes a fitting;
   the second kills the class.

---

## SEQUENCING NOTE

Items 1, 2 and 5 sit with Selector & Engine and can proceed immediately.
Items 3, 4, 6 and 9 need the new lane, if approved.
Item 7 is blocked on one decision from Patrick.
Item 8 is added as each surface is built, never retrofitted.
Item 10 constrains work already in flight and should be communicated today.
