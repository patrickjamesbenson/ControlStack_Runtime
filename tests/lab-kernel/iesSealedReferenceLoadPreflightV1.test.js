import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  CANONICAL_KEYWORD_DEFINITIONS,
  KEYWORD_PROFILE_ID,
} from "../../packages/lab-kernel/ies-toolkit/iesKeywordContract.js";
import {
  REFERENCE_DTO_SCHEMA_ID,
  REFERENCE_DTO_SCHEMA_VERSION,
} from "../../packages/lab-kernel/ies-toolkit/iesReferenceDto.js";
import {
  inspectIesReferenceForGeneration,
} from "../../packages/lab-kernel/ies-toolkit/iesFromReference.js";
import * as contract from "../../packages/lab-kernel/ies-toolkit/iesSealedReferenceLoadPreflightV1.js";

const SHA_A = "a".repeat(64);
const SHA_B = "b".repeat(64);
const SHA_C = "c".repeat(64);
const SHA_D = "d".repeat(64);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function canonical(value) {
  if (value === null || value === undefined) return value;
  if (["string", "number", "boolean"].includes(typeof value)) return value;
  if (Array.isArray(value)) return value.map(canonical);
  return Object.keys(value).sort().map((key) => [key, canonical(value[key])]);
}

function fingerprint(prefix, value) {
  const digest = createHash("sha1").update(JSON.stringify(canonical(value))).digest("hex");
  return `${prefix}:${digest}`;
}

function assertDeepFrozen(value) {
  if (!value || typeof value !== "object") return;
  assert.equal(Object.isFrozen(value), true);
  for (const child of Object.values(value)) assertDeepFrozen(child);
}

function keywordRows(referenceId, overrides = {}) {
  const values = {
    TEST: "AUTH-42",
    TESTLAB: "Novon Engineering",
    ISSUEDATE: "2026-07-16",
    MANUFAC: "Novon Lighting",
    LUMCAT: "NVB-OPT-42",
    LUMINAIRE: "NOVON LINEAR",
    LAMP: "NOVON LED",
    _CRI: "80",
    _COLORTEMP: "3500",
    _INTERNAL_AMBIENT_TA_C: "42",
    _DRIVER: "DRV-42",
    _DRIVER_SETTING: "700mA",
    _GEAR_TRAY_REF_ID: "NVB-REF-GT-000042",
    _OPTIC_REF_ID: referenceId,
    _EMERGENCY_VERIFIED: "yes",
    _EWIS_CARTRIDGE_VERIFIED: "yes",
    ...overrides,
  };
  return CANONICAL_KEYWORD_DEFINITIONS.map((definition) => ({
    key: definition.key,
    value: values[definition.key],
    owner: definition.owner,
  }));
}

function sealedReference({
  serial = 42,
  authoritySha = SHA_A,
  originSha = SHA_B,
  approvalSha = SHA_C,
  referenceSha = SHA_D,
  metadataOverrides = {},
  keywordOverrides = {},
} = {}) {
  const id = `NVB-REF-OPT-${String(serial).padStart(6, "0")}`;
  const metadata = {
    G0: 1,
    G1: -1,
    G2: 1,
    G3: 3,
    G4: 1,
    G5: 1,
    G6: 2,
    G7: 0.1,
    G8: 0.001,
    G9: 0.05,
    G10: 1,
    G11: "1.11100",
    G12: 0.01,
    ...metadataOverrides,
  };
  const keywords = keywordRows(id, keywordOverrides);
  const keywordValue = (key) => keywords.find((row) => row.key === key)?.value ?? null;
  const numeric = (value) => value == null || value === ""
    ? null : Number(String(value).replace(/(?:\s*(?:K|C|°C|RA))$/i, ""));
  return {
    schemaId: REFERENCE_DTO_SCHEMA_ID,
    schemaVersion: REFERENCE_DTO_SCHEMA_VERSION,
    kind: "OPT",
    id,
    serial,
    sealedAtUtc: "2026-07-16T10:11:12.000Z",
    authorityRecordSha256: authoritySha,
    originSha256: originSha,
    derivationSha256: null,
    approval: {
      state: "reference",
      approvedAtUtc: "2026-07-16T10:10:00.000Z",
      approvalFingerprint: approvalSha,
    },
    keywordProfile: {
      profileId: KEYWORD_PROFILE_ID,
      values: keywords,
    },
    metadata,
    angles: { v_angles: [0, 90, 180], h_angles: [0] },
    candela: [[0.1, 0.1, 0.1]],
    baseline: {
      cct: numeric(keywordValue("_COLORTEMP")),
      cri: numeric(keywordValue("_CRI")),
      internalAmbientTaC: numeric(keywordValue("_INTERNAL_AMBIENT_TA_C")),
      fluxPerMm: Number(metadata.G11),
      wallWattsPerMm: Number(metadata.G12),
      circuitWattsPerMm: Number(metadata.G10),
    },
    provenanceRefs: {
      authorityRecord: { artifactRef: `lab/references/${id}/authority.json` },
      originIes: { artifactRef: `lab/references/${id}/origin.ies` },
      evidenceIndex: null,
      mutationLog: null,
      parentReferences: [{
        relation: "reference_engine",
        referenceId: "NVB-REF-GT-000042",
        kind: "GT",
        referenceSha256: "e".repeat(64),
        artifactRef: null,
        ordinal: 1,
      }],
    },
    referenceSha256: referenceSha,
  };
}

function planSafety() {
  return {
    readOnly: true,
    nonPersistent: true,
    traceabilityEnvelopeIgnored: true,
    generationInputConsumed: true,
    bindingConsumed: true,
    inspectionConsumed: true,
    multiplierDerived: true,
    jobPlanned: true,
    callerSelectionsAccepted: false,
    projectMetadataAccepted: false,
    sealedReferenceLoaded: false,
    resolverInvoked: false,
    storageAccessed: false,
    materialiseInvoked: false,
    generatorInvoked: false,
    iesGenerated: false,
    rawIesReturned: false,
    metadataReturned: false,
    anglesReturned: false,
    candelaReturned: false,
    keywordValuesReturned: false,
    sealedReferenceReturned: false,
    artifactWritten: false,
    fileWritten: false,
    networkWritten: false,
    emailSent: false,
    downloadCreated: false,
    routeAdded: false,
    persistenceAttempted: false,
    readinessActivated: false,
  };
}

function bindingSafety() {
  return {
    readOnly: true,
    nonPersistent: true,
    traceabilityEnvelopeIgnored: true,
    generationInputConsumed: true,
    labProjectionConsumed: true,
    referenceIdentityBound: true,
    resolverInvoked: false,
    storageAccessed: false,
    sealedReferenceLoaded: false,
    authorityInspected: false,
    authorityMutated: false,
    evidenceAccepted: false,
    referenceMutated: false,
    generatorInvoked: false,
    iesGenerated: false,
    rawIesReturned: false,
    rawPhotometryReturned: false,
    candelaReturned: false,
    artifactWritten: false,
    fileWritten: false,
    networkWritten: false,
    emailSent: false,
    downloadCreated: false,
    routeAdded: false,
    persistenceAttempted: false,
    readinessActivated: false,
  };
}

function makeContracts(reference = sealedReference()) {
  const inspection = inspectIesReferenceForGeneration(reference);
  assert.equal(inspection.state, "ready_read_only", inspection.blockers?.[0]);
  const sourceGeneration = {
    schemaId: "controlstack.downstream.ies-generation-input.v1",
    schemaVersion: 1,
    generationInputId: `ies-generation-input-v1:${"1".repeat(40)}`,
    replayKey: `ies-generation-input-replay-v1:${"2".repeat(40)}`,
  };
  const selection = {
    system: "DNX 80",
    optic: "OPAL",
    targetLmPerM: 1200,
    roomAmbientTaC: 25,
    protocol: "DALI-2",
  };
  const run = { runIndex: 0, quantity: 1, lengthMm: 5600 };
  const technicalBinding = {
    selectedOpticKey: "OPAL",
    opticBomId: "OPT-DNX80-OPAL",
    evidenceRef: "evidence-hot-test",
    referenceRoomTaC: 25,
    referenceInternalTaC: 27,
    opticThermalRiseTaC: 2,
  };
  const bindingPayload = {
    schemaId: "controlstack.lab.ies-generation-reference-binding.v1",
    schemaVersion: 1,
    generationInputId: sourceGeneration.generationInputId,
    generationReplayKey: sourceGeneration.replayKey,
    selection,
    run,
    technicalBinding,
    referenceIdentity: inspection.referenceIdentity,
    blocker: null,
  };
  const bindingId = fingerprint("ies-generation-reference-binding-v1", bindingPayload);
  const bindingReplay = fingerprint("ies-generation-reference-binding-replay-v1", {
    bindingId,
    generationReplayKey: sourceGeneration.replayKey,
    referenceSha256: inspection.referenceIdentity.referenceSha256,
  });
  const bindingAttempt = fingerprint("ies-generation-reference-binding-attempt-v1", bindingPayload);
  const binding = {
    schemaId: "controlstack.lab.ies-generation-reference-binding.v1",
    schemaVersion: 1,
    state: "ready_read_only",
    bindingId,
    replayKey: bindingReplay,
    sourceGeneration,
    selection,
    run,
    technicalBinding,
    referenceIdentity: clone(inspection.referenceIdentity),
    blockers: [],
    warnings: [],
    audit: {
      schemaId: "controlstack.lab.ies-generation-reference-binding-audit.v1",
      schemaVersion: 1,
      attemptFingerprint: bindingAttempt,
      state: "accepted_read_only",
      accepted: true,
      bindingId,
      replayKey: bindingReplay,
      deterministic: true,
      traceabilityInspected: false,
      generationInputValidated: true,
      labProjectionValidated: true,
      referenceIdentityBound: true,
      resolverInvoked: false,
      sealedReferenceLoaded: false,
      authorityInspected: false,
      generatorInvoked: false,
      routeInvoked: false,
      persistenceAttempted: false,
      artifactWriteAttempted: false,
      emailAttempted: false,
    },
    safetyFlags: bindingSafety(),
  };

  const verifiedLmPerM = 1350;
  const baselineLmPerM = inspection.baseline.baselineLmPerM;
  const outputMultiplier = verifiedLmPerM / baselineLmPerM;
  const multiplierBasis = {
    verifiedLmPerM,
    baselineLmPerM,
    targetLmPerM: selection.targetLmPerM,
    targetLmPerMIsIntentOnly: true,
    formula: "verifiedLmPerM / baselineLmPerM",
    outputMultiplier,
  };
  const job = { runLengthMm: run.lengthMm, outputMultiplier, selections: {} };
  const sourceBinding = {
    schemaId: binding.schemaId,
    schemaVersion: binding.schemaVersion,
    bindingId: binding.bindingId,
    replayKey: binding.replayKey,
  };
  const sourceInspection = {
    schemaId: inspection.schemaId,
    schemaVersion: inspection.schemaVersion,
    inspectionId: inspection.inspectionId,
  };
  const planPayload = {
    schemaId: "controlstack.lab.ies-materialisation-job-plan.v1",
    schemaVersion: 1,
    sourceGeneration,
    sourceBinding,
    sourceInspection,
    selection,
    run,
    referenceIdentity: inspection.referenceIdentity,
    multiplierBasis,
    job,
    blocker: null,
  };
  const planId = fingerprint("ies-materialisation-job-plan-v1", planPayload);
  const planReplay = fingerprint("ies-materialisation-job-plan-replay-v1", {
    planId,
    generationReplayKey: sourceGeneration.replayKey,
    bindingReplayKey: binding.replayKey,
    inspectionId: inspection.inspectionId,
  });
  const planAttempt = fingerprint("ies-materialisation-job-plan-attempt-v1", planPayload);
  const plan = {
    schemaId: "controlstack.lab.ies-materialisation-job-plan.v1",
    schemaVersion: 1,
    state: "ready_read_only",
    planId,
    replayKey: planReplay,
    sourceGeneration,
    sourceBinding,
    sourceInspection,
    selection,
    run,
    referenceIdentity: clone(inspection.referenceIdentity),
    multiplierBasis,
    job,
    blockers: [],
    warnings: [],
    audit: {
      schemaId: "controlstack.lab.ies-materialisation-job-plan-audit.v1",
      schemaVersion: 1,
      attemptFingerprint: planAttempt,
      state: "accepted_read_only",
      accepted: true,
      planId,
      replayKey: planReplay,
      deterministic: true,
      traceabilityInspected: false,
      generationInputValidated: true,
      bindingValidated: true,
      inspectionValidated: true,
      multiplierDerived: true,
      jobPlanned: true,
      sealedReferenceLoaded: false,
      materialiseInvoked: false,
      generatorInvoked: false,
      routeInvoked: false,
      persistenceAttempted: false,
      artifactWriteAttempted: false,
      emailAttempted: false,
    },
    safetyFlags: planSafety(),
  };
  return { reference, inspection, binding, plan };
}

async function execute(input = makeContracts(), resolver = async () => clone(input.reference)) {
  return contract.preflightSealedReferenceLoadV1(
    input.plan,
    input.binding,
    input.inspection,
    resolver,
  );
}

function assertBlocked(receipt, blocker, calls = undefined) {
  assert.equal(receipt.schemaId, contract.IES_SEALED_REFERENCE_LOAD_RECEIPT_SCHEMA_ID);
  assert.equal(receipt.schemaVersion, contract.IES_SEALED_REFERENCE_LOAD_RECEIPT_SCHEMA_VERSION);
  assert.equal(receipt.state, contract.IES_SEALED_REFERENCE_LOAD_RECEIPT_STATES.blockedFailClosed);
  assert.equal(receipt.receiptId, null);
  assert.equal(receipt.replayKey, null);
  assert.deepEqual(receipt.blockers, [blocker]);
  assert.equal(receipt.audit.accepted, false);
  assert.equal(receipt.audit.generatorInvoked, false);
  assert.equal(receipt.audit.materialiseInvoked, false);
  assert.equal(receipt.safetyFlags.sealedReferenceReturned, false);
  assert.equal(receipt.safetyFlags.generatorInvoked, false);
  assert.equal(receipt.safetyFlags.lm63Returned, false);
  if (calls !== undefined) assert.equal(receipt.resolverCallCount, calls);
  assertDeepFrozen(receipt);
}

test("exports only the approved version-1 sealed-reference load-preflight interface", () => {
  assert.deepEqual(Object.keys(contract).sort(), [
    "IES_SEALED_REFERENCE_LOAD_RECEIPT_AUDIT_SCHEMA_ID",
    "IES_SEALED_REFERENCE_LOAD_RECEIPT_AUDIT_SCHEMA_VERSION",
    "IES_SEALED_REFERENCE_LOAD_RECEIPT_SCHEMA_ID",
    "IES_SEALED_REFERENCE_LOAD_RECEIPT_SCHEMA_VERSION",
    "IES_SEALED_REFERENCE_LOAD_RECEIPT_STATES",
    "preflightSealedReferenceLoadV1",
  ].sort());
});

test("loads once, validates through the existing inspection path and returns only a redacted receipt", async () => {
  const input = makeContracts();
  let calls = 0;
  let request;
  const receipt = await execute(input, async (candidate) => {
    calls += 1;
    request = candidate;
    assertDeepFrozen(candidate);
    return clone(input.reference);
  });

  assert.equal(calls, 1);
  assert.deepEqual(request, {
    schemaId: "controlstack.lab.sealed-reference-load-request.v1",
    schemaVersion: 1,
    referenceId: input.inspection.referenceIdentity.referenceId,
    kind: "OPT",
    serial: 42,
    authorityRecordSha256: SHA_A,
    referenceSha256: SHA_D,
    readOnly: true,
  });
  assert.equal("resolverPath" in request, false);
  assert.equal(receipt.state, contract.IES_SEALED_REFERENCE_LOAD_RECEIPT_STATES.readyReadOnly);
  assert.match(receipt.receiptId, /^ies-sealed-reference-load-receipt-v1:[0-9a-f]{40}$/);
  assert.match(receipt.replayKey, /^ies-sealed-reference-load-replay-v1:[0-9a-f]{40}$/);
  assert.equal(receipt.planId, input.plan.planId);
  assert.equal(receipt.bindingId, input.binding.bindingId);
  assert.equal(receipt.inspectionId, input.inspection.inspectionId);
  assert.equal(receipt.referenceId, input.inspection.referenceIdentity.referenceId);
  assert.equal(receipt.referenceSha256, SHA_D);
  assert.equal(receipt.resolverCallCount, 1);
  assert.equal(receipt.loaded, true);
  assert.equal(receipt.referenceValidated, true);
  assert.equal(receipt.loadedBodyDiscarded, true);
  assert.deepEqual(receipt.blockers, []);
  assert.equal(receipt.audit.contractsValidated, true);
  assert.equal(receipt.audit.resolverCallCount, 1);
  assert.equal(receipt.safetyFlags.callerLocationAccepted, false);
  assert.equal(receipt.safetyFlags.providerInputAccepted, false);
  assert.equal(receipt.safetyFlags.sealedReferenceReturned, false);
  assert.equal(receipt.safetyFlags.metadataReturned, false);
  assert.equal(receipt.safetyFlags.keywordValuesReturned, false);
  assert.equal(receipt.safetyFlags.anglesReturned, false);
  assert.equal(receipt.safetyFlags.candelaReturned, false);
  assert.equal(receipt.safetyFlags.provenancePathsReturned, false);
  assert.equal(receipt.safetyFlags.lm63Returned, false);
  assert.equal(receipt.safetyFlags.generatorInvoked, false);
  assert.equal(receipt.safetyFlags.materialiseInvoked, false);
  assert.equal(receipt.safetyFlags.persistenceAttempted, false);
  assert.equal(receipt.safetyFlags.deliveryActivated, false);
  assertDeepFrozen(receipt);

  const serialized = JSON.stringify(receipt);
  assert.doesNotMatch(serialized, /NOVON LINEAR|700mA|v_angles|\[\[0\.1,0\.1,0\.1\]\]|origin\.ies|authority\.json|resolverPath/);
});

test("is replay-identical, preserves inputs and never retains resolver body", async () => {
  const input = makeContracts();
  const snapshot = clone(input);
  const first = await execute(input);
  const second = await execute(clone(input));
  assert.deepEqual(first, second);
  assert.deepEqual(input, snapshot);
  assert.equal("reference" in first, false);
  assert.equal("sealedReference" in first, false);
  assert.equal("loadedBody" in first, false);
});

test("changed reference identity moves receipt identity", async () => {
  const firstInput = makeContracts();
  const secondReference = sealedReference({
    serial: 43,
    authoritySha: "e".repeat(64),
    originSha: "f".repeat(64),
    approvalSha: "1".repeat(64),
    referenceSha: "2".repeat(64),
  });
  const secondInput = makeContracts(secondReference);
  const first = await execute(firstInput);
  const second = await execute(secondInput);
  assert.equal(first.state, "ready_read_only");
  assert.equal(second.state, "ready_read_only");
  assert.notEqual(first.receiptId, second.receiptId);
  assert.notEqual(first.replayKey, second.replayKey);
  assert.notEqual(first.referenceId, second.referenceId);
});

test("rejects malformed, extra, private, raw and caller-location input before resolver invocation", async () => {
  const fixtures = [];
  const wrongVersion = clone(makeContracts());
  wrongVersion.plan.schemaVersion = 2;
  fixtures.push([wrongVersion, "sealed_reference_load_plan_invalid"]);

  const extra = clone(makeContracts());
  extra.binding.provider = { url: "https://provider.invalid" };
  fixtures.push([extra, "sealed_reference_load_binding_invalid"]);

  const privateValue = clone(makeContracts());
  privateValue.plan.selection.system = "C:\\private\\DNX80";
  fixtures.push([privateValue, "sealed_reference_load_plan_invalid"]);

  const rawValue = clone(makeContracts());
  rawValue.inspection.warnings = ["IESNA:LM-63-2002"];
  fixtures.push([rawValue, "sealed_reference_load_inspection_invalid"]);

  for (const [input, blocker] of fixtures) {
    let calls = 0;
    const receipt = await execute(input, async () => {
      calls += 1;
      return clone(input.reference);
    });
    assert.equal(calls, 0);
    assertBlocked(receipt, blocker, 0);
  }

  const valid = makeContracts();
  assertBlocked(await contract.preflightSealedReferenceLoadV1(
    valid.plan,
    valid.binding,
    valid.inspection,
    async () => clone(valid.reference),
    "https://caller.invalid/reference",
  ), "sealed_reference_load_input_arity_invalid", 0);
});

test("independently rejects tampered binding, plan and inspection identities", async () => {
  const tamperedBinding = clone(makeContracts());
  tamperedBinding.binding.bindingId = `ies-generation-reference-binding-v1:${"0".repeat(40)}`;
  assertBlocked(await execute(tamperedBinding), "sealed_reference_load_binding_invalid", 0);

  const tamperedPlan = clone(makeContracts());
  tamperedPlan.plan.job.outputMultiplier += 0.01;
  assertBlocked(await execute(tamperedPlan), "sealed_reference_load_plan_invalid", 0);

  const tamperedInspection = clone(makeContracts());
  tamperedInspection.inspection.inspectionId = `ies-reference-generation-inspection-v1:${"0".repeat(64)}`;
  assertBlocked(await execute(tamperedInspection), "sealed_reference_load_inspection_invalid", 0);
});

test("fails closed on resolver absence, failure and non-DTO results with at most one call", async () => {
  const input = makeContracts();
  assertBlocked(await contract.preflightSealedReferenceLoadV1(
    input.plan, input.binding, input.inspection, null,
  ), "sealed_reference_load_resolver_invalid", 0);

  let failedCalls = 0;
  assertBlocked(await execute(input, async () => {
    failedCalls += 1;
    throw new Error("redacted resolver failure");
  }), "sealed_reference_load_resolver_failed", 1);
  assert.equal(failedCalls, 1);

  let emptyCalls = 0;
  assertBlocked(await execute(input, async () => {
    emptyCalls += 1;
    return null;
  }), "sealed_reference_load_resolver_result_invalid", 1);
  assert.equal(emptyCalls, 1);
});

test("fails closed on wrong DTO, identity, baseline and keyword-profile mismatch", async () => {
  const input = makeContracts();
  const malformed = clone(input.reference);
  malformed.approval.state = "compatibility_only";
  assertBlocked(await execute(input, async () => malformed), "sealed_reference_load_dto_validation_failed", 1);

  const wrongIdentity = sealedReference({
    serial: 44,
    authoritySha: "3".repeat(64),
    referenceSha: "4".repeat(64),
  });
  assertBlocked(await execute(input, async () => wrongIdentity), "sealed_reference_load_identity_mismatch", 1);

  const wrongBaseline = clone(input.reference);
  wrongBaseline.metadata.G11 = "1.22200";
  wrongBaseline.baseline.fluxPerMm = 1.222;
  assertBlocked(await execute(input, async () => wrongBaseline), "sealed_reference_load_baseline_mismatch", 1);

  const wrongProfile = clone(input.reference);
  wrongProfile.keywordProfile.profileId = "controlstack.lab.ies-keywords.v2";
  assertBlocked(await execute(input, async () => wrongProfile), "sealed_reference_load_dto_validation_failed", 1);
});

test("production loader has no generator, materialiser, route, persistence, write or delivery seam", async () => {
  const source = readFileSync(
    new URL("../../packages/lab-kernel/ies-toolkit/iesSealedReferenceLoadPreflightV1.js", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(source, /buildIesFromReference|\bmaterialise\s*\(|writeIes\s*\(|scaleToLengthM/);
  assert.doesNotMatch(source, /fetch\s*\(|XMLHttpRequest|WebSocket|\/api\/|app\.(?:get|post|put|patch|delete)\s*\(/i);
  assert.doesNotMatch(source, /\b(?:writeFile|appendFile|mkdir|unlink|rename|createWriteStream)\s*\(/);
  assert.doesNotMatch(source, /localStorage|sessionStorage|indexedDB|Date\.now|Math\.random|randomUUID/i);
  assert.doesNotMatch(source, /IESNA:LM-63|\bTILT=/);

  const receipt = await execute();
  assert.equal(receipt.safetyFlags.generatorInvoked, false);
  assert.equal(receipt.safetyFlags.materialiseInvoked, false);
  assert.equal(receipt.safetyFlags.routeAdded, false);
  assert.equal(receipt.safetyFlags.persistenceAttempted, false);
  assert.equal(receipt.safetyFlags.artifactWritten, false);
  assert.equal(receipt.safetyFlags.fileWritten, false);
  assert.equal(receipt.safetyFlags.networkWritten, false);
  assert.equal(receipt.safetyFlags.emailSent, false);
  assert.equal(receipt.safetyFlags.deliveryActivated, false);
  assert.equal(receipt.safetyFlags.readinessActivated, false);
});
