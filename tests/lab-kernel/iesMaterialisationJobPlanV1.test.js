import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  adaptIesGenerationInputV1ReferenceBinding,
} from "../../packages/lab-kernel/ies-toolkit/iesGenerationInputV1ReferenceBindingAdapter.js";
import * as contract from "../../packages/lab-kernel/ies-toolkit/iesMaterialisationJobPlanV1.js";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function merge(target, source) {
  for (const [key, value] of Object.entries(source || {})) {
    if (isPlainObject(value) && isPlainObject(target[key])) merge(target[key], value);
    else target[key] = clone(value);
  }
  return target;
}

function assertDeepFrozen(value) {
  if (!value || typeof value !== "object") return;
  assert.equal(Object.isFrozen(value), true);
  for (const child of Object.values(value)) assertDeepFrozen(child);
}

function sha(character) {
  return character.repeat(64);
}

function referenceIdentity(kind = "OPT", serial = 2, character = "b", overrides = {}) {
  const prefix = kind === "MERGED" ? "MRG" : kind;
  const referenceId = `NVB-REF-${prefix}-${String(serial).padStart(6, "0")}`;
  return {
    schemaId: "controlstack.lab.reference-identity.v1",
    schemaVersion: 1,
    referenceId,
    kind,
    serial,
    sealedAtUtc: "2026-07-20T00:00:00.000Z",
    authorityRecordSha256: sha(character),
    referenceSha256: sha(character === "f" ? "e" : "f"),
    resolverPath: `/r/${referenceId}`,
    readOnly: true,
    ...overrides,
  };
}

function thermalSafety() {
  return {
    donorEngineInvoked: false,
    runtimeDataMutated: false,
    selectedResultPersisted: false,
    runTableGenerated: false,
    iesGenerated: false,
    outputGenerated: false,
    rawCurveRowsReturned: false,
    rawCurvePayloadReturned: false,
    publicRouteAdded: false,
    postEndpointAdded: false,
  };
}

function generationSafety() {
  return {
    readOnly: true,
    nonPersistent: true,
    traceabilityEnvelopeIgnored: true,
    artifactRequestConsumed: true,
    selectionRequestConsumed: true,
    referenceBound: false,
    sealedReferenceLoaded: false,
    authorityInspected: false,
    authorityMutated: false,
    referenceMutated: false,
    engineInvoked: false,
    donorEngineInvoked: false,
    labConsumerInvoked: false,
    iesGeneratorInvoked: false,
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
    postEndpointAdded: false,
    persistenceAttempted: false,
    runtimeDataMutated: false,
    downstreamActivated: false,
  };
}

function generationInput(overrides = {}) {
  const value = {
    schemaId: "controlstack.downstream.ies-generation-input.v1",
    schemaVersion: 1,
    state: "ready_read_only",
    generationInputId: null,
    replayKey: null,
    sourceRequest: {
      schemaId: "controlstack.downstream.ies-artifact-request.v1",
      schemaVersion: 1,
      requestId: null,
      replayKey: null,
    },
    artifactIntent: {
      schemaId: "controlstack.downstream.ies-artifact-intent.v1",
      schemaVersion: 1,
      artifactKind: "ies_lm63_reference_build",
    },
    engineContract: {
      outputSchemaId: "controlstack.engine.output.v1",
      outputSchemaVersion: 1,
      outputState: "complete",
      resultId: `engine-output-v1:${"3".repeat(40)}`,
      requestFingerprint: null,
      sourceVersionFingerprint: `engine-source-v1:${"5".repeat(40)}`,
      policyFingerprint: `engine-policy-v1:${"6".repeat(40)}`,
      evidenceFingerprints: [`engine-evidence-v1:${"7".repeat(40)}`],
    },
    selection: {
      system: "DNX 80",
      optic: "OPAL",
      targetLmPerM: 1200,
      roomAmbientTaC: 25,
      protocol: "DALI-2",
    },
    run: {
      runIndex: 0,
      quantity: 1,
      lengthMm: 5600,
    },
    technicalProvenance: {
      selectedOpticKey: "OPAL",
      opticBomId: "OPT-DNX80-OPAL",
      evidenceRef: "evidence-hot-test",
      programValidationState: "accepted_for_engine_thermal_lookup",
      selectedTierOrProfile: "balanced",
    },
    thermal: {
      schemaId: "controlstack.runtime.thermal-lumen-execution.v1",
      schemaVersion: 1,
      selectedOpticKey: "OPAL",
      opticBomId: "OPT-DNX80-OPAL",
      sourceRevision: "runtime-active-source-safe-v1",
      evidenceRef: "evidence-hot-test",
      programValidationState: "accepted_for_engine_thermal_lookup",
      selectedRoomTaC: 25,
      referenceRoomTaC: 25,
      referenceInternalTaC: 27,
      opticThermalRiseTaC: 2,
      derivedInternalTaC: 27,
      curveLookupTaC: 27,
      effectiveCurveTaC: 27,
      temperatureMode: "interpolated",
      requestedCurrentMa: 150,
      currentMode: "interpolated",
      verifiedLmPerM: 1350,
      curveFilename: "safe-thermal-curve.csv",
      curveChecksumVerified: true,
      opticRiseAppliedCount: 1,
      readOnly: true,
      safetyFlags: thermalSafety(),
    },
    blockers: [],
    warnings: [],
    audit: null,
    safetyFlags: generationSafety(),
  };
  merge(value, overrides);
  applyGenerationIdentity(value);
  return value;
}

function applyGenerationIdentity(value) {
  value.engineContract.requestFingerprint = stableFingerprint("engine-selection-set-v1", {
    product: {
      system: value.selection.system,
      optic: value.selection.optic,
    },
    lighting: {
      targetLmPerM: value.selection.targetLmPerM,
      roomAmbientTaC: value.selection.roomAmbientTaC,
    },
    runs: [{ qty: value.run.quantity, lengthMm: value.run.lengthMm }],
    control: { protocol: value.selection.protocol },
  });
  const artifactPayload = {
    schemaId: value.sourceRequest.schemaId,
    schemaVersion: value.sourceRequest.schemaVersion,
    artifactIntent: value.artifactIntent,
    engineContract: value.engineContract,
    blocker: null,
  };
  value.sourceRequest.requestId = stableFingerprint("ies-artifact-request-v1", artifactPayload);
  value.sourceRequest.replayKey = stableFingerprint("ies-artifact-replay-v1", {
    requestId: value.sourceRequest.requestId,
    engineReplay: {
      requestFingerprint: value.engineContract.requestFingerprint,
      sourceVersionFingerprint: value.engineContract.sourceVersionFingerprint,
      policyFingerprint: value.engineContract.policyFingerprint,
      evidenceFingerprints: [...value.engineContract.evidenceFingerprints],
      outputSchemaId: value.engineContract.outputSchemaId,
      outputSchemaVersion: value.engineContract.outputSchemaVersion,
    },
  });
  const payload = {
    schemaId: value.schemaId,
    schemaVersion: value.schemaVersion,
    sourceRequest: value.sourceRequest,
    artifactIntent: value.artifactIntent,
    engineContract: value.engineContract,
    selectionRequestFingerprint: value.engineContract.requestFingerprint,
    selection: value.selection,
    run: value.run,
    technicalProvenance: value.technicalProvenance,
    thermal: value.thermal,
    blocker: null,
  };
  const attemptFingerprint = stableFingerprint("ies-generation-input-attempt-v1", payload);
  value.generationInputId = stableFingerprint("ies-generation-input-v1", payload);
  value.replayKey = stableFingerprint("ies-generation-input-replay-v1", {
    generationInputId: value.generationInputId,
    artifactReplayKey: value.sourceRequest.replayKey,
    selectionRequestFingerprint: value.engineContract.requestFingerprint,
  });
  value.audit = {
    schemaId: "controlstack.downstream.ies-generation-input-audit.v1",
    schemaVersion: 1,
    attemptFingerprint,
    state: "accepted_read_only",
    accepted: true,
    generationInputId: value.generationInputId,
    replayKey: value.replayKey,
    deterministic: true,
    traceabilityInspected: false,
    artifactRequestValidated: true,
    selectionRequestValidated: true,
    referenceBound: false,
    sealedReferenceLoaded: false,
    generatorInvoked: false,
    routeInvoked: false,
    persistenceAttempted: false,
    artifactWriteAttempted: false,
    emailAttempted: false,
  };
}

function labProjection(reference = referenceIdentity(), overrides = {}) {
  const value = {
    schemaId: "controlstack.lab.nvb-lab-projection.v2",
    schemaVersion: 2,
    path: "optic",
    family: 80,
    selection: {
      opticBomId: "OPT-DNX80-OPAL",
      opticVariant: "OPAL",
      specCode: "OP",
      emissionPermission: "direct",
    },
    governingThermals: {
      systemLabel: "DNX 80 worst case",
      systemVariant: "direct",
      metalAreaMm2: 1200,
      airAreaMm2: 800,
    },
    references: {
      gearTray: referenceIdentity("GT", 1, "a"),
      optic: reference,
    },
    thermalEvidence: {
      opticBomId: "OPT-DNX80-OPAL",
      referenceRoomTaC: 25,
      referenceInternalTaC: 27,
      opticThermalRiseTaC: 2,
      evidenceRef: "evidence-hot-test",
      authorityState: null,
    },
    unresolved: [],
    assemblyVerification: {
      emergency: null,
      ewisCartridge: null,
    },
    readOnly: true,
  };
  merge(value, overrides);
  return value;
}

function inspectionSafety() {
  return {
    readOnly: true,
    nonPersistent: true,
    referenceValidated: true,
    jobValidated: false,
    materialiseInvoked: false,
    generatorInvoked: false,
    iesGenerated: false,
    rawIesReturned: false,
    metadataReturned: false,
    anglesReturned: false,
    candelaReturned: false,
    keywordValuesReturned: false,
    provenancePathsReturned: false,
    sealedReferenceReturned: false,
    multiplierDerived: false,
    projectMetadataAccepted: false,
    resolverInvoked: false,
    storageAccessed: false,
    routeAdded: false,
    persistenceAttempted: false,
    fileWritten: false,
    networkWritten: false,
    emailSent: false,
    readinessActivated: false,
  };
}

function referenceInspection(reference = referenceIdentity(), overrides = {}) {
  const inspectionId = `ies-reference-generation-inspection-v1:${reference.referenceSha256}`;
  const value = {
    schemaId: "controlstack.lab.ies-reference-generation-inspection.v1",
    schemaVersion: 1,
    state: "ready_read_only",
    inspectionId,
    referenceIdentity: clone(reference),
    keywordProfileId: "controlstack.lab.ies-keywords.v1",
    baseline: {
      cct: 4000,
      cri: 85,
      internalAmbientTaC: 27,
      fluxPerMm: 1,
      wallWattsPerMm: 0.01,
      circuitWattsPerMm: 0.011,
      baselineLmPerM: 1000,
      baselineWallWattsPerM: 10,
      baselineCircuitWattsPerM: 11,
    },
    missingKeywordOverrides: [],
    materialisationWithoutOverrides: true,
    blockers: [],
    warnings: [],
    audit: {
      schemaId: "controlstack.lab.ies-reference-generation-inspection-audit.v1",
      schemaVersion: 1,
      attemptId: inspectionId,
      state: "accepted_read_only",
      accepted: true,
      inspectionId,
      referenceId: reference.referenceId,
      deterministic: true,
      referenceValidated: true,
      jobValidated: false,
      materialiseInvoked: false,
      generatorInvoked: false,
      routeInvoked: false,
      persistenceAttempted: false,
      artifactWriteAttempted: false,
      emailAttempted: false,
    },
    safetyFlags: inspectionSafety(),
  };
  merge(value, overrides);
  return value;
}

function acceptedInputs({ generation = {}, lab = {}, inspection = {}, reference } = {}) {
  const generationValue = generationInput(generation);
  const referenceValue = reference || referenceIdentity();
  const binding = adaptIesGenerationInputV1ReferenceBinding(
    generationValue,
    labProjection(referenceValue, lab),
  );
  assert.equal(binding.state, "ready_read_only", binding.blockers?.[0]);
  return {
    generation: generationValue,
    binding,
    inspection: referenceInspection(referenceValue, inspection),
  };
}

function build(input = acceptedInputs()) {
  return contract.buildIesMaterialisationJobPlanV1(
    input.generation,
    input.binding,
    input.inspection,
  );
}

function assertBlocked(result, blocker) {
  assert.equal(result.schemaId, contract.IES_MATERIALISATION_JOB_PLAN_SCHEMA_ID);
  assert.equal(result.schemaVersion, contract.IES_MATERIALISATION_JOB_PLAN_SCHEMA_VERSION);
  assert.equal(result.state, contract.IES_MATERIALISATION_JOB_PLAN_STATES.blockedFailClosed);
  assert.equal(result.planId, null);
  assert.equal(result.replayKey, null);
  assert.equal(result.job, null);
  assert.deepEqual(result.blockers, [blocker]);
  assert.equal(result.audit.accepted, false);
  assert.equal(result.safetyFlags.jobPlanned, false);
  assert.equal(result.safetyFlags.generatorInvoked, false);
  assert.equal(result.safetyFlags.iesGenerated, false);
}

test("exports only the approved version-1 job-plan interface", () => {
  assert.deepEqual(Object.keys(contract).sort(), [
    "IES_MATERIALISATION_JOB_PLAN_AUDIT_SCHEMA_ID",
    "IES_MATERIALISATION_JOB_PLAN_AUDIT_SCHEMA_VERSION",
    "IES_MATERIALISATION_JOB_PLAN_SCHEMA_ID",
    "IES_MATERIALISATION_JOB_PLAN_SCHEMA_VERSION",
    "IES_MATERIALISATION_JOB_PLAN_STATES",
    "buildIesMaterialisationJobPlanV1",
  ].sort());
});

test("builds one exact immutable ready no-generation materialisation job plan", () => {
  const result = build();

  assert.equal(result.state, contract.IES_MATERIALISATION_JOB_PLAN_STATES.readyReadOnly);
  assert.match(result.planId, /^ies-materialisation-job-plan-v1:[0-9a-f]{40}$/);
  assert.match(result.replayKey, /^ies-materialisation-job-plan-replay-v1:[0-9a-f]{40}$/);
  assert.deepEqual(result.job, {
    runLengthMm: 5600,
    outputMultiplier: 1.35,
    selections: {},
  });
  assert.deepEqual(result.multiplierBasis, {
    verifiedLmPerM: 1350,
    baselineLmPerM: 1000,
    targetLmPerM: 1200,
    targetLmPerMIsIntentOnly: true,
    formula: "verifiedLmPerM / baselineLmPerM",
    outputMultiplier: 1.35,
  });
  assert.equal(result.referenceIdentity.kind, "OPT");
  assert.equal(result.audit.multiplierDerived, true);
  assert.equal(result.audit.jobPlanned, true);
  assert.equal(result.safetyFlags.sealedReferenceLoaded, false);
  assert.equal(result.safetyFlags.materialiseInvoked, false);
  assert.equal(result.safetyFlags.generatorInvoked, false);
  assert.equal(result.safetyFlags.callerSelectionsAccepted, false);
  assertDeepFrozen(result);
});

test("uses Engine verified lm per metre rather than Selector target intent", () => {
  const lowTarget = build(acceptedInputs({
    generation: {
      selection: { targetLmPerM: 0 },
      thermal: { verifiedLmPerM: 1500 },
    },
  }));
  const highTarget = build(acceptedInputs({
    generation: {
      selection: { targetLmPerM: 5000 },
      thermal: { verifiedLmPerM: 1500 },
    },
  }));

  assert.equal(lowTarget.job.outputMultiplier, 1.5);
  assert.equal(highTarget.job.outputMultiplier, 1.5);
  assert.equal(lowTarget.multiplierBasis.targetLmPerM, 0);
  assert.equal(highTarget.multiplierBasis.targetLmPerM, 5000);
  assert.notEqual(lowTarget.planId, highTarget.planId);
});

test("is replay-identical and does not mutate accepted public inputs", () => {
  const input = acceptedInputs();
  const snapshot = clone(input);
  const first = build(input);
  const second = build(clone(input));

  assert.deepEqual(first, second);
  assert.equal(JSON.stringify(first), JSON.stringify(second));
  assert.deepEqual(input, snapshot);
});

test("moves plan identity when generation, run or reference identity moves", () => {
  const baseline = build();
  const changedVerified = build(acceptedInputs({
    generation: { thermal: { verifiedLmPerM: 1500 } },
  }));
  const changedRun = build(acceptedInputs({
    generation: { run: { lengthMm: 6000 } },
  }));
  const movedReference = referenceIdentity("OPT", 3, "c");
  const changedReference = build(acceptedInputs({ reference: movedReference }));

  for (const candidate of [changedVerified, changedRun, changedReference]) {
    assert.equal(candidate.state, contract.IES_MATERIALISATION_JOB_PLAN_STATES.readyReadOnly);
    assert.notEqual(candidate.planId, baseline.planId);
    assert.notEqual(candidate.replayKey, baseline.replayKey);
  }
});

test("fails closed unless verified output, baseline and ratio are strictly positive finite", () => {
  const zeroVerified = acceptedInputs({ generation: { thermal: { verifiedLmPerM: 0 } } });
  assertBlocked(build(zeroVerified), "verified_lm_per_m_positive_required");

  const zeroBaseline = acceptedInputs({ inspection: {
    baseline: { fluxPerMm: 0, baselineLmPerM: 0 },
  } });
  assertBlocked(build(zeroBaseline), "baseline_lm_per_m_positive_required");

  const overflowingRatio = acceptedInputs({
    generation: { thermal: { verifiedLmPerM: Number.MAX_VALUE } },
    inspection: {
      baseline: {
        fluxPerMm: 0.0005,
        baselineLmPerM: 0.5,
      },
    },
  });
  assertBlocked(build(overflowingRatio), "output_multiplier_positive_finite_required");
});

test("fails closed on source, selection, run and reference contradictions", () => {
  const valid = acceptedInputs();

  const sourceMismatch = clone(valid);
  sourceMismatch.binding.sourceGeneration.generationInputId =
    `ies-generation-input-v1:${"0".repeat(40)}`;
  assertBlocked(build(sourceMismatch), "binding_generation_identity_mismatch");

  const selectionMismatch = clone(valid);
  selectionMismatch.binding.selection.targetLmPerM = 999;
  assertBlocked(build(selectionMismatch), "binding_selection_mismatch");

  const runMismatch = clone(valid);
  runMismatch.binding.run.lengthMm = 1200;
  assertBlocked(build(runMismatch), "binding_run_mismatch");

  const referenceMismatch = clone(valid);
  const otherReference = referenceIdentity("OPT", 4, "d");
  referenceMismatch.inspection = referenceInspection(otherReference);
  assertBlocked(build(referenceMismatch), "inspection_binding_reference_mismatch");
});

test("fails closed on missing overrides, contradictory inspection and any caller override", () => {
  const missingOverrides = acceptedInputs({ inspection: {
    missingKeywordOverrides: ["lumcat"],
    materialisationWithoutOverrides: false,
  } });
  assertBlocked(build(missingOverrides), "inspection_missing_keyword_overrides");

  const contradictoryReady = acceptedInputs({ inspection: {
    materialisationWithoutOverrides: false,
  } });
  assertBlocked(build(contradictoryReady), "inspection_materialisation_without_overrides_required");

  const input = acceptedInputs();
  assertBlocked(contract.buildIesMaterialisationJobPlanV1(
    input.generation,
    input.binding,
    input.inspection,
    { selections: { lumcat: "CALLER-OVERRIDE" } },
  ), "materialisation_job_plan_input_arity_invalid");
});

test("fails closed on unknown, extra, private, raw and unsafe public input", () => {
  const valid = acceptedInputs();

  const unknown = clone(valid);
  unknown.generation.schemaVersion = 2;
  assertBlocked(build(unknown), "generation_input_schema_or_identity_invalid");

  const extra = clone(valid);
  extra.inspection.project = "outside";
  assertBlocked(build(extra), "inspection_invalid_shape");

  const privateGeneration = clone(valid);
  privateGeneration.generation.selection.system = "C:\\private\\DNX80";
  assertBlocked(build(privateGeneration), "generation_selection_text_invalid");

  const rawGeneration = clone(valid);
  rawGeneration.generation.technicalProvenance.evidenceRef = "IESNA:LM-63-2002";
  rawGeneration.generation.thermal.evidenceRef = "IESNA:LM-63-2002";
  assertBlocked(build(rawGeneration), "generation_provenance_invalid");

  const unsafeBinding = clone(valid);
  unsafeBinding.binding.safetyFlags.generatorInvoked = true;
  assertBlocked(build(unsafeBinding), "binding_safety_invalid");

  const unsafeInspection = clone(valid);
  unsafeInspection.inspection.safetyFlags.generatorInvoked = true;
  assertBlocked(build(unsafeInspection), "inspection_safety_invalid");
});

test("production planner has no import, sealed DTO, resolver, generator, materialise, route or write seam", () => {
  const source = readFileSync(
    new URL("../../packages/lab-kernel/ies-toolkit/iesMaterialisationJobPlanV1.js", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(source, /^\s*import\s/m);
  assert.doesNotMatch(source, /from\s+["']/);
  assert.doesNotMatch(source, /buildIesFromReference|\bmaterialise\s*\(|resolveReference|fetch\s*\(|XMLHttpRequest|WebSocket/);
  assert.doesNotMatch(source, /\b(?:writeFile|appendFile|mkdir|unlink|rename|createWriteStream)\s*\(/);
  assert.doesNotMatch(source, /\/api\/|app\.(?:get|post|put|patch|delete)\s*\(/i);
  assert.doesNotMatch(source, /IESNA:LM-63|\bTILT=/);
  assert.doesNotMatch(source, /Date\.now|Math\.random|randomUUID/i);

  const result = build();
  assert.equal(result.job.selections && Object.keys(result.job.selections).length, 0);
  assert.equal(result.safetyFlags.sealedReferenceLoaded, false);
  assert.equal(result.safetyFlags.resolverInvoked, false);
  assert.equal(result.safetyFlags.storageAccessed, false);
  assert.equal(result.safetyFlags.materialiseInvoked, false);
  assert.equal(result.safetyFlags.generatorInvoked, false);
  assert.equal(result.safetyFlags.iesGenerated, false);
  assert.equal(result.safetyFlags.fileWritten, false);
  assert.equal(result.safetyFlags.routeAdded, false);
});

function freezeForHash(value) {
  if (value === null || value === undefined) return value;
  if (["string", "number", "boolean"].includes(typeof value)) return value;
  if (Array.isArray(value)) return value.map((entry) => freezeForHash(entry));
  if (isPlainObject(value)) {
    return Object.keys(value)
      .sort((left, right) => left.localeCompare(right))
      .map((key) => [key, freezeForHash(value[key])]);
  }
  return String(value);
}

function stableFingerprint(prefix, value) {
  return `${prefix}:${sha1Hex(JSON.stringify(freezeForHash(value)))}`;
}

function utf8Bytes(text) {
  return new TextEncoder().encode(String(text));
}

function rotateLeft(value, bits) {
  return ((value << bits) | (value >>> (32 - bits))) >>> 0;
}

function sha1Hex(text) {
  const bytes = utf8Bytes(text);
  const bitLength = BigInt(bytes.length) * 8n;
  const paddedLength = Math.ceil((bytes.length + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLength);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  for (let index = 0; index < 8; index += 1) {
    padded[paddedLength - 1 - index] = Number((bitLength >> BigInt(index * 8)) & 0xffn);
  }
  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  let h4 = 0xc3d2e1f0;
  const words = new Uint32Array(80);
  for (let chunk = 0; chunk < padded.length; chunk += 64) {
    for (let index = 0; index < 16; index += 1) {
      const offset = chunk + index * 4;
      words[index] = (
        (padded[offset] << 24) | (padded[offset + 1] << 16)
        | (padded[offset + 2] << 8) | padded[offset + 3]
      ) >>> 0;
    }
    for (let index = 16; index < 80; index += 1) {
      words[index] = rotateLeft(words[index - 3] ^ words[index - 8] ^ words[index - 14] ^ words[index - 16], 1);
    }
    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    for (let index = 0; index < 80; index += 1) {
      let f;
      let k;
      if (index < 20) { f = (b & c) | ((~b) & d); k = 0x5a827999; }
      else if (index < 40) { f = b ^ c ^ d; k = 0x6ed9eba1; }
      else if (index < 60) { f = (b & c) | (b & d) | (c & d); k = 0x8f1bbcdc; }
      else { f = b ^ c ^ d; k = 0xca62c1d6; }
      const temp = (rotateLeft(a, 5) + f + e + k + words[index]) >>> 0;
      e = d;
      d = c;
      c = rotateLeft(b, 30);
      b = a;
      a = temp;
    }
    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
  }
  return [h0, h1, h2, h3, h4]
    .map((word) => word.toString(16).padStart(8, "0"))
    .join("");
}
