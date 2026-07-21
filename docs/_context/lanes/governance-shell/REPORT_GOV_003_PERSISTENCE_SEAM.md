# GOV-003 — Project persistence seam closeout

**From:** Governance & Shell  
**To:** Program & Integrate  
**Status:** IMPLEMENTED AND GATED  
**Closed:** 2026-07-22

## Program ruling applied

- Canonical persisted schema is `workspace_saved_project.v2`.
- Server-owned JSON is authoritative; browser storage is cache/recovery only.
- Stable lowercase project identity is required and fixture identities are rejected.
- Passive CRM fields are `hubspotDealId`, `hubspotContactId`, and `hubspotCompanyId`.
- Explicit donor-v1 migration, browser-v2 migration, live-memory flush, and rollback are bounded and non-destructive.
- Only bounded project save and read operations were restored; no sharing, handoff, email, CRM, token, cleanup, retrieval, or Engine seam was added.

## Delivered boundary

- One JSON file per stable project under the configured project directory.
- UTF-8 sibling temporary write followed by atomic replacement.
- Failed replacement preserves the previous authoritative file.
- Malformed records are skipped without blocking shell boot or Engine execution.
- Unsafe ids and traversal attempts are rejected before filesystem access.
- Browser cache writes occur only after successful server save.
- Fixtures are absent from the live project list.
- Nullable CRM identifiers round-trip without any provider call.
- Migration is explicit and idempotent; legacy backups remain intact.
- Persistence ownership remains in Governance.

## Evidence

The fixed Governance lane gate passed 175/175 after implementation. The repository feature checkpoint was committed and pushed before this documentation closeout.

## Next authorised parcel

GOV-005 user identity and permissions is the sole ready Governance parcel. Identity remains outside Engine eligibility and output. CRM mutation and two-factor authentication remain blocked.
