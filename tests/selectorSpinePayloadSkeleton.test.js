import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { createSelectorState } from "../packages/modules/cs-selector/selectorState.js";
import { createSelectorViewModel } from "../packages/modules/cs-selector/selectorViewModel.js";
import { deriveSelectorReferenceOptionsFromSnapshot } from "../packages/workspace-kernel/selectorReferenceOptionsService.js";
import { buildSelectedResultProjectionContract } from "../packages/workspace-kernel/selectedResultProjectionService.js";

const viewSourceUrl = new URL("../packages/modules/cs-selector/selectorView.js", import.meta.url);
const viewModelSourceUrl = new URL("../packages/modules/cs-selector/selectorViewModel.js", import.meta.url);
const serverSourceUrl = new URL("../server.js", import.meta.url);
const testSourceUrl = new URL("./selectorSpinePayloadSkeleton.test.js", import.meta.url);

function createAdapter() {
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
          status: "anonymous-fallback",
          currentUser: {},
          classification: "anonymous",
          identityState: "external_anonymous",
        },
        authority: { owner: "shell", status: "fallback", source: "shell-safe-fallback" },
        company: { owner: "shell", status: "placeholder", companyName: "" },
        crm: { status: "placeholder", writePolicy: { enabled: false } },
        visibility: {
          owner: "shell",
          status: "resolved",
          testMode: false,
          moduleReasons: { cs_selector: { visible: true, reason: "test" } },
          visibleModules: ["cs_selector"],
          hiddenModules: [],
          inputs: { projectMode: "auto", projectPresent: false },
          rule: "test",
        },
        timelinePolicy: {},
      };
    },
    isFlagEnabled() {
      return false;
    },
  };
}

function sourceReady() {
  return { present: true, readable: true, parseable: true };
}

function selectorReferenceStatus() {
  return {
    ok: true,
    status: "loaded",
    readOnly: true,
    diagnosticOnly: true,
    source: sourceReady(),
    selectorOptions: deriveSelectorReferenceOptionsFromSnapshot({}, { source: sourceReady() }),
  };
}

function createModel(options = {}) {
  const selectorState = createSelectorState();
  options.configureState?.(selectorState);
  return createSelectorViewModel({
    adapter: createAdapter(),
    selectorState,
    selectorReferenceStatus: selectorReferenceStatus(),
  });
}

function spineSection(spine, sectionKey) {
  const section = spine.sections.find((item) => item.sectionKey === sectionKey);
  assert.ok(section, `expected spine section ${sectionKey}`);
  return section;
}

function spineRow(spine, sectionKey, rowKey) {
  const row = spineSection(spine, sectionKey).rows.find((item) => item.rowKey === rowKey);
  assert.ok(row, `expected spine row ${sectionKey}.${rowKey}`);
  return row;
}

test("Selector product surface renders selected-truth and canonical workflow before spine, payload, readiness, handoff, and Diagnostics", async () => {
  const source = await readFile(viewSourceUrl, "utf-8");

  const truthRenderIndex = source.indexOf("appendSelectorSelectionTruthSummary(section");
  const workflowRenderIndex = source.indexOf("appendSelectorWorkflowSections(section");
  const spineRenderIndex = source.indexOf("appendSelectorProductSpine(section");
  const payloadRenderIndex = source.indexOf("appendPayloadPreviewObject(section");
  const selectedEngineResultIndex = source.indexOf("appendSelectedEngineResultHandoff(section");
  const readinessRenderIndex = source.indexOf("appendSelectorSourceSpecReadinessExplanation(section");
  const disabledHandoffIndex = source.indexOf("appendSelectorDisabledHandoffSummary(section");
  const diagnosticsIndex = source.indexOf("const diagnosticsDetails = document.createElement(\"details\")");

  assert.ok(truthRenderIndex > 0, "selected-truth summary should render first in the product surface");
  assert.ok(workflowRenderIndex > truthRenderIndex, "canonical workflow should render after selected-truth summary");
  assert.ok(spineRenderIndex > workflowRenderIndex, "product spine should render after canonical workflow");
  assert.ok(payloadRenderIndex > spineRenderIndex, "payload preview should render after checklist spine");
  assert.ok(selectedEngineResultIndex > payloadRenderIndex, "selected engine-result handoff should render after payload preview");
  assert.ok(readinessRenderIndex > selectedEngineResultIndex, "source/spec readiness explanation should render after selected engine-result handoff");
  assert.ok(disabledHandoffIndex > readinessRenderIndex, "disabled handoff summary should render after source/spec readiness");
  assert.ok(diagnosticsIndex > disabledHandoffIndex, "Diagnostics should remain below the product surface");
  assert.match(source, /dataset\.selectorProductSpine = "checklist"/);
  assert.match(source, /dataset\.selectorPayloadPreview = "skeleton"/);
  assert.match(source, /dataset\.selectorSelectedEngineResult = "read-only"/);
  assert.match(source, /dataset\.selectedResultProjectionState = handoff\.selectedResultProjectionState \|\| "no_selected_result"/);
  assert.match(source, /Projection per-run display row shape/);
  assert.match(source, /dataset\.selectorSourceSpecReadiness = "read-only"/);
  assert.match(source, /dataset\.selectorDisabledHandoffSummary = "read-only"/);
});

test("Selector product surface parity lock keeps summary, spine, payload, readiness, and handoffs aligned", () => {
  const surface = createModel().selectorSurface;
  const lock = surface.productSurfaceParityLock;
  const readiness = surface.sourceSpecReadinessExplanation;
  const handoffs = surface.disabledHandoffSummary;
  const selectedEngineResult = surface.selectedEngineResultHandoff;
  const selectedResultProjection = surface.selectedResultProjection;
  const expectedProjection = buildSelectedResultProjectionContract();
  const expectedProjectionSummary = {
    source: expectedProjection.source,
    sourceAvailable: expectedProjection.sourceAvailable,
    sourceState: expectedProjection.sourceState,
    state: expectedProjection.state,
    stateEnum: expectedProjection.stateEnum,
    approvedStateLabels: expectedProjection.approvedStateLabels,
    staleHistoricalLabel: expectedProjection.staleHistoricalLabel,
    staleSensitiveInputKeys: expectedProjection.staleSensitiveInputKeys,
    redactionRuleCount: expectedProjection.redactionRules.length,
  };
  const payload = surface.payloadPreview;

  assert.deepEqual(lock.blockOrder, [
    "selected-truth summary",
    "canonical workflow sections",
    "product spine",
    "payload preview",
    "selected engine-result handoff",
    "source/spec readiness explanation",
    "disabled handoff summary",
    "collapsed diagnostics",
  ]);
  assert.equal(lock.selectedTruthBeforeProductSpine, true);
  assert.equal(lock.canonicalWorkflowBeforePayloadPreview, true);
  assert.equal(lock.productSpineBeforePayloadPreview, true);
  assert.equal(lock.selectedEngineResultAfterPayloadPreview, true);
  assert.equal(lock.selectedEngineResultBeforeSourceReadiness, true);
  assert.equal(lock.selectedEngineResultSafetyAgrees, true);
  assert.equal(lock.sourceSpecReadinessAfterPayloadPreview, true);
  assert.equal(lock.disabledHandoffAfterReadiness, true);
  assert.equal(lock.diagnosticsCollapsedBehindProductSurface, true);
  assert.equal(lock.workflowSectionsCanonical, true);
  assert.equal(lock.flatFieldsPrimary, false);
  assert.equal(lock.sourceReadinessAgreesWithPayload, true);
  assert.equal(lock.specGateAgreesWithPayload, true);
  assert.equal(lock.disabledHandoffsAgreeWithPayload, true);
  assert.equal(lock.allGenerationProofWriteDisabled, true);
  assert.equal(lock.rawRowsExposed, false);

  assert.equal(readiness.sourceReady, payload.sourceReady);
  assert.equal(readiness.readinessState, payload.specGateCandidateReadiness.readinessState);
  assert.equal(readiness.specReady, payload.specGateCandidateReadiness.specReady);
  assert.equal(readiness.rawRowsExposed, false);
  assert.equal(readiness.rawHeadersExposed, false);
  assert.equal(readiness.rawUsersExposed, false);
  assert.equal(readiness.rawLabEvidenceExposed, false);

  assert.deepEqual(selectedResultProjection, expectedProjectionSummary);
  assert.deepEqual(selectedEngineResult.selectedResultProjection, expectedProjectionSummary);
  assert.equal(selectedEngineResult.projectionConsumed, true);
  assert.equal(selectedEngineResult.selectedResultProjectionSource, expectedProjection.source);
  assert.equal(selectedEngineResult.selectedResultProjectionState, expectedProjection.state);
  assert.deepEqual(selectedEngineResult.selectedResultProjection.stateEnum, expectedProjection.stateEnum);
  assert.deepEqual(selectedEngineResult.selectedResultProjection.approvedStateLabels, expectedProjection.approvedStateLabels);
  assert.deepEqual(selectedEngineResult.selectedResultProjection.staleSensitiveInputKeys, expectedProjection.staleSensitiveInputKeys);
  assert.equal(selectedEngineResult.selectedResultAvailable, false);
  assert.equal(selectedEngineResult.selectedResultUnavailableReason, "no selected engine result available");
  assert.equal(selectedEngineResult.resultStateLabel, "Estimated preview");
  assert.equal(selectedEngineResult.engineVerified, false);
  assert.equal(selectedEngineResult.stale, false);
  assert.equal(selectedEngineResult.accepted, false);
  assert.equal(selectedEngineResult.selectedFamilySubsetLock, null);
  assert.equal(selectedEngineResult.selectedSubsetFamilyLock, null);
  assert.equal(selectedEngineResult.engineVerificationEnabled, false);
  assert.equal(selectedEngineResult.safetyFlags.engineExecutionEnabled, false);
  assert.equal(selectedEngineResult.safetyFlags.rawSelectedPayloadExposed, false);
  assert.equal(selectedEngineResult.safetyFlags.rawEngineDebugPayloadExposed, false);

  assert.equal(handoffs.allDisabled, true);
  assert.equal(handoffs.handoffCount, 11);
  assert.equal(handoffs.handoffs.every((handoff) => handoff.status === "disabled"), true);
  assert.equal(handoffs.safetyFlags.specGeneration, false);
  assert.equal(handoffs.safetyFlags.slugGeneration, false);
  assert.equal(handoffs.safetyFlags.iesGeneration, false);
  assert.equal(handoffs.safetyFlags.payloadGeneration, false);
  assert.equal(handoffs.safetyFlags.runTableGeneration, false);
  assert.equal(handoffs.safetyFlags.drawingGeneration, false);
  assert.equal(handoffs.safetyFlags.labProofAuthority, false);
  assert.equal(handoffs.safetyFlags.controlledRecordsWrites, false);
  assert.equal(handoffs.safetyFlags.rregApprovalCustodyTransfer, false);
  assert.equal(handoffs.safetyFlags.hubSpotCrmWriteBack, false);
  assert.equal(handoffs.safetyFlags.boardDataMutation, false);
});

test("Selected engine-result handoff defaults to no selected result and Estimated preview", () => {
  const handoff = createModel().selectorSurface.selectedEngineResultHandoff;
  const rows = Object.fromEntries(handoff.rows);
  const fieldRows = Object.fromEntries(handoff.fieldRows);

  assert.equal(handoff.readOnly, true);
  assert.equal(handoff.displayOnly, true);
  assert.equal(handoff.scaffoldOnly, true);
  assert.equal(handoff.projectionConsumed, true);
  assert.equal(handoff.selectedResultProjectionSource, "future Engine/RunTable selected-result projection");
  assert.equal(handoff.selectedResultProjectionState, "no_selected_result");
  assert.equal(handoff.selectedResultProjection.sourceState, "no_source");
  assert.ok(handoff.selectedResultProjection.stateEnum.includes("selected_accepted"));
  assert.ok(handoff.selectedResultProjection.approvedStateLabels.includes("Run table changed — verify again"));
  assert.equal(handoff.selectedResultAvailable, false);
  assert.equal(handoff.selectedResultUnavailableReason, "no selected engine result available");
  assert.equal(handoff.resultStateLabel, "Estimated preview");
  assert.notEqual(handoff.resultStateLabel, "Engine verified");
  assert.equal(handoff.estimatedPreviewOnly, true);
  assert.equal(handoff.engineVerified, false);
  assert.equal(handoff.stale, false);
  assert.equal(handoff.accepted, false);
  assert.equal(handoff.selectedFamilySubsetLock, null);
  assert.equal(handoff.selectedSubsetFamilyLock, null);
  assert.equal(handoff.engineVerificationEnabled, false);
  assert.equal(handoff.selectedResultIngestionEnabled, false);
  assert.equal(handoff.selectedResultPersistenceEnabled, false);
  assert.equal(handoff.staleResult, false);
  assert.equal(handoff.staleResultDetectionEnabled, false);
  assert.equal(rows["selected result availability"], "no selected engine result available");
  assert.equal(rows["engine verification"], "disabled");
  assert.equal(rows["selected subset/family lock"], "not established");
  assert.equal(fieldRows["run identity placeholder"], "unavailable — future read-only Engine/RunTable result source required");
  assert.equal(fieldRows["board family placeholder"], "unavailable — future read-only Engine/RunTable result source required");
  assert.equal(fieldRows["sanitised warnings placeholder"], "unavailable — future read-only Engine/RunTable result source required");
  assert.ok(handoff.projectionFieldRows.some(([field]) => field === "runLengthMm"));
  assert.ok(handoff.projectionFieldRows.some(([field]) => field === "boardFamily"));
  assert.ok(handoff.projectionFieldRows.some(([field]) => field === "sanitisedWarnings"));
  assert.equal(handoff.futureRequiredShape.oneSelectedResultOnly, true);
  assert.equal(handoff.futureRequiredShape.perRunLookupKey, "run id / run number");
  assert.equal(handoff.futureRequiredShape.weightedAlternativesHiddenForNormalUsers, true);
});

test("Selected engine-result scaffold keeps execution, generation, proof, writes, raw payloads, and routes disabled", async () => {
  const handoff = createModel().selectorSurface.selectedEngineResultHandoff;
  const serverText = await readFile(serverSourceUrl, "utf-8");
  const flags = handoff.safetyFlags;
  const text = JSON.stringify(handoff);

  assert.equal(flags.engineExecutionEnabled, false);
  assert.equal(flags.engineVerificationEnabled, false);
  assert.equal(flags.selectedResultIngestionEnabled, false);
  assert.equal(flags.selectedResultPersistenceEnabled, false);
  assert.equal(flags.staleResultDetectionEnabled, false);
  assert.equal(flags.runTableGenerationEnabled, false);
  assert.equal(flags.payloadGenerationEnabled, false);
  assert.equal(flags.iesGenerationEnabled, false);
  assert.equal(flags.drawingGenerationEnabled, false);
  assert.equal(flags.labProofAuthority, false);
  assert.equal(flags.controlledRecordsWriteEnabled, false);
  assert.equal(flags.rregApprovalEnabled, false);
  assert.equal(flags.rregCustodyTransferEnabled, false);
  assert.equal(flags.hubSpotCrmWriteBackEnabled, false);
  assert.equal(flags.boardDataMutationEnabled, false);
  assert.equal(flags.hiddenWriteBackEnabled, false);
  assert.equal(flags.rawSelectedPayloadExposed, false);
  assert.equal(flags.rawEngineDebugPayloadExposed, false);
  assert.equal(flags.rawCandidateAlternativesExposedAsFinalOutputs, false);
  assert.equal(flags.rawRowsExposed, false);
  assert.equal(flags.rawLabEvidenceExposed, false);
  assert.equal(flags.rawIesExposed, false);
  assert.equal(flags.credentialsExposed, false);
  assert.equal(flags.privatePathsExposed, false);
  assert.equal(handoff.routesAdded, false);
  assert.equal(handoff.postEndpointsAdded, false);
  assert.equal(handoff.writes, false);
  assert.equal(handoff.generation, false);
  assert.equal(handoff.proof, false);
  assert.equal(text.includes("rough_electrical_payload"), false);
  assert.equal(text.includes("\"debug\":"), false);
  assert.equal(text.includes("candidate_alternatives"), false);
  assert.equal(serverText.includes("/api/engine/run"), false);
  assert.equal(serverText.includes("/api/selector/run"), false);
  assert.equal(serverText.includes("SELECTOR_POST"), false);
});

test("Selector checklist sections appear in the target order", () => {
  const model = createModel();
  const spine = model.selectorSurface.productSpine;

  assert.deepEqual(spine.order, [
    "SYSTEM",
    "ENVIRONMENT",
    "LIGHT & CONTROL",
    "MOUNTING",
    "FINISHES",
    "EGRESS & ACCESSORIES",
    "RUNS & DISABLED OUTPUTS",
    "SPEC GATE / CANDIDATE READINESS",
    "FOOT / STATUS",
  ]);
  assert.deepEqual(spineSection(spine, "system").rows.map((row) => row.label), [
    "Profile / system",
    "Optic Direct",
  ]);
  assert.deepEqual(spineSection(spine, "egressAccessories").rows.map((row) => row.label), [
    "Egress light",
    "EWIS/sound",
    "Sensors",
    "Accessories",
  ]);
  assert.deepEqual(spineSection(spine, "runs").rows.map((row) => row.label), [
    "Run count",
    "Run qty",
    "Run length",
    "Length mode",
    "Run placement",
    "Override status",
    "RunTable generation",
    "Payload generation",
    "IES generation",
    "Drawing generation",
    "Lab Proof authority",
    "Controlled Records writes",
    "RREG approval / custody",
    "HubSpot / CRM write-back",
  ]);
});

test("Empty and unmapped values render as em dash rather than fake values", () => {
  const model = createModel();
  const spine = model.selectorSurface.productSpine;

  assert.equal(spine.emptyValue, "—");
  assert.equal(spineRow(spine, "system", "profileSystem").displayValue, "—");
  assert.equal(spineRow(spine, "lightControl", "lexWeight").displayValue, "—");
  assert.equal(spineRow(spine, "lightControl", "lexWeight").status, "missing");
  assert.match(spineRow(spine, "lightControl", "lexWeight").reason, /no value is faked/i);
});

test("Split egress, sensors, and accessories appear as separate checklist rows and payload fields", () => {
  const model = createModel();
  const spine = model.selectorSurface.productSpine;
  const payload = model.selectorSurface.payloadPreview;

  assert.equal(spineRow(spine, "egressAccessories", "egressLight").label, "Egress light");
  assert.equal(spineRow(spine, "egressAccessories", "egressSound").label, "EWIS/sound");
  assert.equal(spineRow(spine, "egressAccessories", "sensors").label, "Sensors");
  assert.equal(spineRow(spine, "egressAccessories", "accessories").label, "Accessories");
  assert.deepEqual(Object.keys(payload.egress), ["light", "sound"]);
  assert.deepEqual(Object.keys(payload.sensorsAccessories), ["sensors", "accessories"]);
  assert.equal(payload.egress.light, null);
  assert.equal(payload.egress.sound, null);
  assert.equal(payload.sensorsAccessories.sensors, null);
  assert.equal(payload.sensorsAccessories.accessories, null);
});

test("Runs & Disabled Outputs rows render em dash when empty and keep every output handoff disabled", () => {
  const model = createModel();
  const runsSection = spineSection(model.selectorSurface.productSpine, "runs");
  const payload = model.selectorSurface.payloadPreview;

  for (const row of runsSection.rows) {
    assert.equal(row.displayValue, "—", `expected ${row.rowKey} to render empty as em dash`);
    assert.equal(row.rawRowsExposed, false);
    assert.equal(row.writes, false);
  }

  assert.deepEqual(payload.runs, {
    runCount: null,
    qty: null,
    lengthMm: null,
    lengthMode: null,
    placementStatus: null,
    overrideStatus: null,
    rows: [],
  });
  assert.deepEqual(payload.disabledOutputs, {
    specGeneration: false,
    slugGeneration: false,
    runTableGeneration: false,
    payloadGeneration: false,
    iesGeneration: false,
    drawingGeneration: false,
    labProofAuthority: false,
    controlledRecordsWrites: false,
    rregApprovalCustodyTransfer: false,
    hubSpotCrmWriteBack: false,
    boardDataMutation: false,
  });
});

test("Donor-supported run manual constraints can fill preview rows without enabling generation", () => {
  const model = createModel({
    configureState(selectorState) {
      selectorState.setDbBackedSelectorFieldValue("runQty", "2", "2");
      selectorState.setDbBackedSelectorFieldValue("runLength", "3500", "3500 mm");
      selectorState.setDbBackedSelectorFieldValue("runLengthMode", "cut_to_length", "Cut to length");
    },
  });
  const spine = model.selectorSurface.productSpine;
  const payload = model.selectorSurface.payloadPreview;

  assert.equal(spineRow(spine, "runs", "runQty").displayValue, "2");
  assert.equal(spineRow(spine, "runs", "runLength").displayValue, "3500");
  assert.equal(spineRow(spine, "runs", "runLengthMode").displayValue, "cut_to_length");
  assert.equal(spineRow(spine, "runs", "runTableGeneration").displayValue, "—");
  assert.equal(payload.runs.qty, "2");
  assert.equal(payload.runs.lengthMm, "3500");
  assert.equal(payload.runs.lengthMode, "cut_to_length");
  assert.equal(payload.disabledOutputs.runTableGeneration, false);
  assert.equal(payload.safetyFlags.runTableGeneration, false);
  assert.equal(payload.safetyFlags.payloadGeneration, false);
  assert.equal(payload.safetyFlags.iesGeneration, false);
  assert.equal(payload.safetyFlags.drawingGeneration, false);
});

test("Payload preview exposes the expected top-level shape and safety flags", () => {
  const payload = createModel().selectorSurface.payloadPreview;

  for (const key of [
    "project",
    "identity",
    "system",
    "profile",
    "tier",
    "optics",
    "environment",
    "lightControl",
    "mounting",
    "finishes",
    "egress",
    "sensorsAccessories",
    "runs",
    "disabledOutputs",
    "specGateCandidateReadiness",
    "safetyFlags",
  ]) {
    assert.ok(Object.prototype.hasOwnProperty.call(payload, key), `expected payload key ${key}`);
  }

  assert.equal(payload.previewOnly, true);
  assert.equal(payload.productionPayload, false);
  assert.equal(payload.safetyFlags.readOnly, true);
  assert.equal(payload.safetyFlags.writes, false);
  assert.equal(payload.safetyFlags.generation, false);
  assert.equal(payload.safetyFlags.runTableGeneration, false);
  assert.equal(payload.safetyFlags.payloadGeneration, false);
  assert.equal(payload.safetyFlags.iesGeneration, false);
  assert.equal(payload.safetyFlags.drawingGeneration, false);
  assert.equal(payload.safetyFlags.labProofAuthority, false);
  assert.equal(payload.safetyFlags.controlledRecordsWrites, false);
  assert.equal(payload.safetyFlags.rregApprovalCustodyTransfer, false);
  assert.equal(payload.safetyFlags.hubSpotCrmWriteBack, false);
  assert.equal(payload.safetyFlags.boardDataMutation, false);
  assert.equal(payload.safetyFlags.rawRowsExposed, false);
  assert.equal(payload.safetyFlags.rawHeadersExposed, false);
  assert.equal(payload.safetyFlags.rawUsersExposed, false);
});

test("Raw rows and private source details are not exposed through the spine or payload preview", () => {
  const surface = createModel().selectorSurface;
  const text = JSON.stringify({ spine: surface.productSpine, payload: surface.payloadPreview });

  assert.equal(surface.productSpine.rawRowsExposed, false);
  assert.equal(surface.payloadPreview.safetyFlags.privatePathsExposed, false);
  assert.equal(text.includes("novondb.json"), false);
  assert.equal(text.includes("C:\\"), false);
  assert.equal(text.includes("raw_lab_evidence"), false);
  assert.equal(text.includes("token"), false);
});

test("Direct and indirect optic rows follow runtime capability state", () => {
  const spine = createModel().selectorSurface.productSpine;
  const systemRows = spineSection(spine, "system").rows;

  assert.ok(systemRows.some((row) => row.rowKey === "opticDirect"));
  assert.equal(systemRows.some((row) => row.rowKey === "opticIndirect"), false);
});

test("Future or unmapped rows are shown as missing, future-mapped, or blocked, not faked", () => {
  const spine = createModel().selectorSurface.productSpine;
  const lex = spineRow(spine, "lightControl", "lexWeight");
  const electrical = spineRow(spine, "environment", "electricalClass");

  assert.ok(["missing", "future-mapped", "blocked", "not-selected"].includes(lex.status));
  assert.equal(lex.value, null);
  assert.equal(lex.missing, true);
  assert.ok(["missing", "future-mapped", "blocked", "not-selected"].includes(electrical.status));
  assert.equal(electrical.writes, false);
});

test("The slice does not introduce a named user or authority fixture", async () => {
  const viewModelSource = await readFile(viewModelSourceUrl, "utf-8");
  const testSource = await readFile(testSourceUrl, "utf-8");
  const payload = createModel().selectorSurface.payloadPreview;

  const forbiddenName = String.fromCharCode(65, 108, 108, 97, 110, 32, 79, 114, 103, 97, 110);
  const usersTableLiteral = ["US", "ERS:"].join("");
  assert.equal(viewModelSource.includes(forbiddenName), false);
  assert.equal(testSource.includes(forbiddenName), false);
  const atSignLiteral = String.fromCharCode(64);
  assert.equal(viewModelSource.includes(atSignLiteral), false);
  assert.equal(testSource.includes(usersTableLiteral), false);
  assert.equal(payload.identity.email, null);
  assert.equal(payload.identity.authorityStatus, "fallback");
});
