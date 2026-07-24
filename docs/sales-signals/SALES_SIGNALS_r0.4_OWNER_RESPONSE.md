# ControlStack Sales Signals — Owner Response to Brief r0.4

**Document type:** Owner response (brief lifecycle: authored → peer reviewed → **owner response** → build)
**Responds to:** Program Brief Revision 0.4 — Peer-Reviewed Consolidated Draft
**Decision date:** 2026-07-23
**Decision:** **Accept all.** Revision 0.4, together with this response, constitutes the approved program brief.

---

## 1. Acceptance

All 23 agreed decisions in r0.4 §23 are accepted without exception. The following peer-review additions are specifically endorsed as improvements over r0.3:

* the canonical information model (§5) — separating source event, project and opportunity is the structural control that prevents duplicate deals;
* the correction corpus and gated rule promotion (§10) — the system learns cautiously; no correction silently becomes a production exclusion;
* the HubSpot Lead-first hierarchy with entitlement gate (§7.3, §15.1);
* the EstimateOne integration gate (§7.2) — no automation without an approved API route or written permission;
* "Tender window passed" terminology (§13.4) — a passed tender is a changed sales route, not a dead project;
* removal of "AI assessed" as a pipeline stage (§15.3);
* chips for short structured values, review panel for longer AI output (§6.2);
* security, retention and audit minimums (§19) and the expanded risk register (§22).

## 2. Amendment A — headline positioning of noise filtering *(owner addition)*

Signal noise filtering is elevated from a capability to the **headline product feature** of Sales Signals.

The primary user-visible value of the module is that keyword alert streams arrive polluted — structural steel matching "Austube", accounting software matching "Xero" — and Sales Signals removes that noise **with evidence retained and nothing deleted**. Presentation requirements:

* the main queue displays a visible noise summary (signals filtered as false positive / wrong company, with count);
* filtered signals remain one action away in the Rejected / false positive queue, each carrying its exclusion evidence per §17;
* demonstration and internal presentation material leads with this feature;
* acceptance criterion §20.4 (false-positive and genuine-match performance reported separately) is confirmed as the headline metric of the pilot.

This amendment adds emphasis and presentation requirements only; it changes no control in r0.4.

## 3. Conditions carried into build

1. Confirm HubSpot Leads entitlement and available features (§7.3) **before** the CRM handover design is finalised — this determines §15.1.
2. The EstimateOne integration gate (§7.2) remains a hard precondition to any automated Q retrieval; Historical Replay proceeds on authorised emails, user-opened records and manual exports in the interim.
3. Historical Replay remains read-only with respect to HubSpot; live writes stay gated behind the Pilot Scoreboard.

## 4. Status

Brief status advances to **Approved for bounded discovery**. Build of the Historical Replay parcel may be scheduled subject to the §7 gates.
