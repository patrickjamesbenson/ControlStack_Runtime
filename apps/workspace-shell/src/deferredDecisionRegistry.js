const freezeEntry = (entry) => Object.freeze({ ...entry });

export const DEFERRED_DECISION_REGISTRY_CONTRACT = Object.freeze({
  id: "GOVERNANCE-DEFERRED-DECISION-REGISTRY",
  version: "1.0.0",
  owner: "Governance & Shell",
  kind: "governance-decision-registry",
  surface: "developer-context-inspector",
  behavior: "read-only-static-registry",
});

export const DEFERRED_DECISION_STATUS_DEFINITIONS = Object.freeze([
  freezeEntry({
    status: "DONOR-VERIFIED",
    label: "Donor verified",
    meaning: "Observed in the donor and not promoted as a new ruling.",
  }),
  freezeEntry({
    status: "RULED",
    label: "Ruled",
    meaning: "Settled by Program; implementation must preserve the ruling.",
  }),
  freezeEntry({
    status: "PLANNED",
    label: "Planned",
    meaning: "Ordered future work without current implementation authority.",
  }),
  freezeEntry({
    status: "PARKED",
    label: "Parked",
    meaning: "Consciously deferred with a named owner and reason.",
  }),
  freezeEntry({
    status: "OPEN",
    label: "Open",
    meaning: "Unresolved; the product must not infer or silently settle it.",
  }),
]);

export const DEFERRED_DECISIONS = Object.freeze([
  freezeEntry({
    id: "hubspot-two-connector-deferral",
    title: "HubSpot two-connector deferral",
    status: "RULED",
    owner: "Program & Integrate",
    kind: "governance-decision",
    disposition: "Keep the two working connectors for now; consolidate the data path later.",
    reason: "Connector consolidation must not block delivery while the donor integration is working.",
    citation: "PROGRAM_WORK_SHAPE.md · Work item 7 · decision 2026-07-20",
  }),
  freezeEntry({
    id: "hubspot-private-app-scope-precheck",
    title: "HubSpot private-app scope pre-check",
    status: "PARKED",
    owner: "Patrick",
    kind: "governance-decision",
    disposition: "Wait for the portal scope pre-check before any private-app cutover work.",
    reason: "The required HubSpot portal scope has not yet been confirmed.",
    citation: "PROGRAM_WORK_SHAPE.md · Work item 7",
  }),
  freezeEntry({
    id: "two-factor-authentication",
    title: "Two-factor authentication",
    status: "PARKED",
    owner: "Governance & Shell",
    kind: "governance-decision",
    disposition: "Do not implement or claim two-factor authentication in the current shell.",
    reason: "Two-factor authentication was explicitly deferred.",
    citation: "PROGRAM_WORK_SHAPE.md · Work items 6 and 9",
  }),
  freezeEntry({
    id: "identity-first-question",
    title: "Identity-first question",
    status: "OPEN",
    owner: "Program & Integrate",
    kind: "governance-decision",
    disposition: "No implementation choice is authorised.",
    reason: "No Program ruling is recorded; keep the question visible and unresolved.",
    citation: "WORK_QUEUE.md · GOV-002",
  }),
  freezeEntry({
    id: "state-to-deal-floor-mapping",
    title: "State → deal-floor mapping",
    status: "OPEN",
    owner: "Program & Integrate",
    kind: "governance-decision",
    disposition: "Do not infer a mapping from the current readiness states.",
    reason: "The mapping remains an open Program decision.",
    citation: "WORK_QUEUE.md · GOV-002",
  }),
]);

export function deferredDecisionRegistrySnapshot() {
  return Object.freeze({
    contract: DEFERRED_DECISION_REGISTRY_CONTRACT,
    statusDefinitions: DEFERRED_DECISION_STATUS_DEFINITIONS,
    decisions: DEFERRED_DECISIONS,
  });
}
