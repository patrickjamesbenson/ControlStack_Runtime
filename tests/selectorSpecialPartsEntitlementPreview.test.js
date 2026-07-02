import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  buildSelectorSpecialPartsEntitlementPreview,
  SELECTOR_SPECIAL_PARTS_ENTITLEMENT_FAIL_CLOSED_CODES,
} from "../packages/modules/cs-selector/selectorSpecialPartsEntitlementPreview.js";
import { createSelectorState } from "../packages/modules/cs-selector/selectorState.js";
import { createSelectorViewModel } from "../packages/modules/cs-selector/selectorViewModel.js";

const CODES = SELECTOR_SPECIAL_PARTS_ENTITLEMENT_FAIL_CLOSED_CODES;

function internalRole(role = "internal_user") {
  return { displayRole: role, actualRole: role, roleAuthority: "safe-nvb-redacted" };
}

function externalRole() {
  return { displayRole: "external_user", actualRole: "external_user", roleAuthority: "safe-fallback" };
}

function matchedIdentity() {
  return { status: "matched-redacted", identityAuthority: "matched-redacted", matchedRedacted: true };
}

function unknownIdentity() {
  return { status: "unknown", identityAuthority: "unknown", identityState: "unverified" };
}

function redactedProjection(candidates = [], overrides = {}) {
  return {
    redacted: true,
    identityAuthority: "matched-redacted",
    matchedRedacted: true,
    redactedEntitlementCount: candidates.length,
    redactedCandidates: candidates,
    ...overrides,
  };
}

function candidate(overrides = {}) {
  return {
    redactedRef: overrides.redactedRef || "redacted:special-a",
    redacted: true,
    status: "available",
    system: "linear60",
    variants_all: "core",
    ip_class: "IP65",
    effective_to: "2099-12-31",
    safelyEntitled: true,
    ...overrides,
  };
}

function preview(input = {}) {
  return buildSelectorSpecialPartsEntitlementPreview({
    safeRoleContext: internalRole(),
    safeIdentityContext: matchedIdentity(),
    redactedEntitlementProjection: redactedProjection([candidate()]),
    selectorSelectionContext: {
      selectedSystem: { system: "linear60", variantKey: "core" },
      selectedVariant: { key: "core" },
      environment: { ipClass: "IP44" },
      timeline: { today: "2026-07-02" },
    },
    specialPartsOptInPreview: { status: "not-live-placeholder", writeEnabled: false },
    ...input,
  });
}

function assertNoRawExposure(result) {
  assert.equal(result.rawUsersReturned, false);
  assert.equal(result.rawContactsReturned, false);
  assert.equal(result.rawCrmReturned, false);
  assert.equal(result.rawProductRowsReturned, false);
  assert.equal(result.rawComponentRowsReturned, false);
  assert.equal(result.privatePathsReturned, false);
  assert.equal(result.credentialsReturned, false);
  assert.equal(result.activeBuildMutationEnabled, false);
  assert.equal(result.hubSpotWriteEnabled, false);
  assert.equal(result.contactCreationEnabled, false);
}

test("unknown identity fails closed as review-required without exposing raw data", () => {
  const result = preview({ safeIdentityContext: unknownIdentity() });
  assert.equal(result.entitlementStatus, "review-required");
  assert.equal(result.specialPartsEntitlementPreviewReady, false);
  assert.match(result.diagnostics.failClosedReasons.join("|"), /unknown-identity-authority/);
  assertNoRawExposure(result);
});

test("unknown role clamps to external_user and external users have no entitlement by default", () => {
  const unknownRole = preview({ safeRoleContext: { displayRole: "super_admin", actualRole: "super_admin", roleAuthority: "unsafe-token" } });
  assert.equal(unknownRole.displayRole, "external_user");
  assert.equal(unknownRole.entitlementStatus, "none");
  assert.ok(unknownRole.diagnostics.failClosedReasons.includes(CODES.unknownRoleContext));
  assert.ok(unknownRole.diagnostics.failClosedReasons.includes(CODES.externalUserSpecialPartsNotEntitled));

  const external = preview({ safeRoleContext: externalRole() });
  assert.equal(external.displayRole, "external_user");
  assert.equal(external.entitlementStatus, "none");
  assert.equal(external.compatibleRedactedCandidateCount, 0);
  assertNoRawExposure(external);
});

test("internal matched-redacted entitlement exposes counts and safe refs only", () => {
  const result = preview();
  assert.equal(result.entitlementStatus, "matched-redacted");
  assert.equal(result.redactedEntitlementCount, 1);
  assert.equal(result.compatibleRedactedCandidateCount, 1);
  assert.equal(result.candidateRows[0].redactedRef, "redacted:special-a");
  assert.equal(result.candidateRows[0].rawRowsReturned, false);
  assert.equal(Object.prototype.hasOwnProperty.call(result.candidateRows[0], "raw"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(result.candidateRows[0], "id"), false);
  assertNoRawExposure(result);
});

test("staged roadmap and business-case candidates stay blocked without safe preview approval", () => {
  const result = preview({
    redactedEntitlementProjection: redactedProjection([
      candidate({ redactedRef: "redacted:staged", status: "staged" }),
      candidate({ redactedRef: "redacted:roadmap", status: "roadmap" }),
      candidate({ redactedRef: "redacted:business", status: "business_case" }),
    ]),
  });
  assert.equal(result.entitlementStatus, "blocked");
  assert.equal(result.compatibleRedactedCandidateCount, 0);
  assert.equal(result.blockedRedactedCandidateCount, 3);

  const approved = preview({
    redactedEntitlementProjection: redactedProjection([
      candidate({ redactedRef: "redacted:approved-staged", status: "staged", previewApproved: true }),
    ]),
  });
  assert.equal(approved.entitlementStatus, "matched-redacted");
  assert.equal(approved.compatibleRedactedCandidateCount, 1);
});

test("selected blocked values are preserved visibly as blocked", () => {
  const result = preview({ selectedBlockedValues: [{ redactedRef: "redacted:selected-blocked", value: "do-not-show-raw-id" }] });
  assert.equal(result.selectedBlockedValuesPreserved, true);
  assert.equal(result.selectedBlockedValueCount, 1);
  const selected = result.candidateRows.find((row) => row.selected === true);
  assert.equal(selected.redactedRef, "redacted:selected-blocked");
  assert.equal(selected.status, "blocked");
  assert.equal(selected.reason, "selected-blocked-value-preserved");
});

test("special-parts opt-in remains preview-only and build HubSpot contact writes stay disabled", () => {
  const result = preview({ specialPartsOptInPreview: { enabled: true, writeEnabled: true } });
  assert.equal(result.specialPartsOptInPreviewEnabled, false);
  assert.equal(result.specialPartsOptInPreviewOnly, true);
  assert.equal(result.specialPartsOptInActiveEnabled, false);
  assert.equal(result.activeBuildMutationEnabled, false);
  assert.equal(result.hubSpotWriteEnabled, false);
  assert.equal(result.contactCreationEnabled, false);
  assert.ok(result.diagnostics.failClosedReasons.includes(CODES.specialPartsOptInNotApproved));
  assert.ok(result.diagnostics.failClosedReasons.includes(CODES.activeBuildMutationNotApproved));
});

test("raw USERS contact CRM component rows private paths and credentials fail closed and are never returned", () => {
  const result = preview({
    redactedEntitlementProjection: {
      redacted: true,
      rawUsers: [{ email_login: "person@example.com" }],
      rawContacts: [{ id: "contact-1" }],
      rawCrm: { hubspotContactId: "123" },
      rawComponentRows: [{ id: "component-1" }],
      privatePath: "C:/ControlStack/private.json",
      credentials: { token: "secret" },
    },
  });
  assert.equal(result.entitlementStatus, "review-required");
  assert.ok(result.diagnostics.failClosedReasons.includes(CODES.rawUsersInputNotApproved));
  assert.ok(result.diagnostics.failClosedReasons.includes(CODES.rawContactInputNotApproved));
  assert.ok(result.diagnostics.failClosedReasons.includes(CODES.rawCrmInputNotApproved));
  assert.ok(result.diagnostics.failClosedReasons.includes(CODES.rawComponentRowInputNotApproved));
  assert.ok(result.diagnostics.failClosedReasons.includes(CODES.privatePathReturnNotApproved));
  assert.ok(result.diagnostics.failClosedReasons.includes(CODES.credentialReturnNotApproved));
  assertNoRawExposure(result);
});

function createAdapter({ authority = {}, identity = {}, specialPartsEntitlement = {}, specialPartsOptIn = {} } = {}) {
  return {
    moduleId: "cs_selector",
    services: {},
    readSnapshots() {
      return {
        route: { moduleId: "cs_selector" },
        flags: { owner: "shell", values: {} },
        project: {
          owner: "shell",
          status: "loaded",
          metadata: { title: "", projectId: "" },
          currentProject: {},
        },
        handoff: { owner: "shell", status: "deferred", available: false },
        identity: {
          owner: "shell",
          status: "matched-redacted",
          currentUser: {},
          classification: "known-redacted",
          identityState: "matched-redacted",
          ...identity,
        },
        authority: {
          owner: "shell",
          status: "matched-redacted",
          source: "shell-safe-redacted-authority",
          actualRole: { value: "internal_user", source: "safe-nvb-redacted" },
          ...authority,
        },
        company: { owner: "shell", status: "placeholder", companyName: "" },
        crm: { status: "placeholder", writePolicy: { enabled: false } },
        visibility: {
          owner: "shell",
          status: "resolved",
          testMode: false,
          moduleReasons: { cs_selector: { visible: true, reason: "test" } },
          visibleModules: ["cs_selector"],
          hiddenModules: [],
          inputs: { projectMode: "auto", projectPresent: false, displayRole: "internal_user" },
          rule: "test",
        },
        timelinePolicy: {},
      };
    },
    createSelectorTimelineContext() {
      return {
        owner: "cs_selector",
        status: "passive-consumer-test",
        source: "test-safe-context",
        projectRequirementDate: { value: "2026-07-02", label: "2026-07-02", source: "test", requiredForFutureProducts: true },
        timelineAccess: { status: "not-enabled-placeholder", writeEnabled: false },
        specialPartsEntitlement: {
          status: "matched-redacted",
          source: "test-redacted-projection",
          userEmailMatched: true,
          readOnly: true,
          entitledParts: [candidate({ redactedRef: "redacted:view-model", system: "", variants_all: "", ip_class: "" })],
          ...specialPartsEntitlement,
        },
        specialPartsOptIn: { status: "not-live-placeholder", writeEnabled: false, ...specialPartsOptIn },
        moduleConsumption: { csSelector: { consumesTimelineContext: true, ownsSelectionCompatibility: true } },
        implementation: {
          entitlementLookupLive: false,
          optInLive: false,
          projectWritesLive: false,
          backendRoutesLive: false,
          slugMutationLive: false,
          buildMutationLive: false,
        },
      };
    },
    isFlagEnabled() {
      return false;
    },
  };
}

function selectorReferenceStatus() {
  return {
    ok: true,
    status: "loaded",
    readOnly: true,
    diagnosticOnly: true,
    source: { present: true, readable: true, parseable: true },
    selectorOptions: {
      status: "loaded",
      candidateSummary: { state: "default preview" },
      fields: [],
      workflowSections: [],
      manualConstraints: [],
      autoConsequences: [],
      blockedItems: [
        { fieldKey: "specialParts", label: "Special parts", value: "blocked", valueLabel: "blocked special", redactedRef: "redacted:blocked" },
      ],
      pathToSpecReady: [],
    },
  };
}

test("view-model exposes safe entitlement preview diagnostics and blocked downstream/write flags", () => {
  const model = createSelectorViewModel({
    adapter: createAdapter(),
    selectorState: createSelectorState(),
    selectorReferenceStatus: selectorReferenceStatus(),
  });
  assert.equal(model.specialPartsEntitlementPreview.entitlementStatus, "matched-redacted");
  assert.equal(model.specialPartsEntitlementPreviewReady, true);
  assert.equal(model.specialPartsEntitlementPreview.rawUsersReturned, false);
  assert.equal(model.specialPartsEntitlementPreview.rawComponentRowsReturned, false);
  assert.equal(model.specialPartsEntitlementPreview.privatePathsReturned, false);
  assert.equal(model.specialPartsEntitlementPreview.credentialsReturned, false);
  assert.equal(model.blockedDownstreamWriteFlags.activeBuildMutationEnabled, false);
  assert.equal(model.blockedDownstreamWriteFlags.hubSpotWriteEnabled, false);
  assert.equal(model.blockedDownstreamWriteFlags.contactCreationEnabled, false);
  assert.equal(model.specialPartsCompatibility.results.some((item) => Object.prototype.hasOwnProperty.call(item, "part")), false);
  assert.equal(model.specialPartsEntitlementPreview.candidateRows.some((item) => item.selected === true), true);
});

test("view source displays disabled HubSpot contact build flags and safe candidate rows only", () => {
  const viewSource = readFileSync(new URL("../packages/modules/cs-selector/selectorView.js", import.meta.url), "utf-8");
  assert.match(viewSource, /HubSpot write enabled/);
  assert.match(viewSource, /Contact creation enabled/);
  assert.match(viewSource, /Build mutation live/);
  assert.match(viewSource, /raw USERS returned/);
  assert.match(viewSource, /Special-parts entitlement preview candidates/);
  assert.doesNotMatch(viewSource, /email_login/);
});

test("no route POST endpoint RuntimeData Engine RunTable or IES surfaces are introduced by preview helper", () => {
  const helperSource = readFileSync(new URL("../packages/modules/cs-selector/selectorSpecialPartsEntitlementPreview.js", import.meta.url), "utf-8");
  assert.doesNotMatch(helperSource, /fetch\s*\(/);
  assert.doesNotMatch(helperSource, /POST/);
  assert.doesNotMatch(helperSource, /run_engine|donor Engine|readFile|writeFile|appendFile|execFile|spawn/i);
  const result = preview();
  assert.equal(result.donorEngineInvoked, false);
  assert.equal(result.runtimeDataMutated, false);
  assert.equal(result.runTableGenerated, false);
  assert.equal(result.iesGenerated, false);
  assert.equal(result.routesAdded, false);
  assert.equal(result.postEndpointsAdded, false);
});
