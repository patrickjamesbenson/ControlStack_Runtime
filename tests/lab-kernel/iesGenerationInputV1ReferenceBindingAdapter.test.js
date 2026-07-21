import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";
import * as contract from "../../packages/lab-kernel/ies-toolkit/iesGenerationInputV1ReferenceBindingAdapter.js";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function assertDeepFrozen(value) {
  if (!value || typeof value !== "object") return;
  assert.equal(Object.isFrozen(value), true);
  for (const child of Object.values(value)) assertDeepFrozen(child);
}

function sha(character) {
  return character.repeat(64);
}

function identity(kind = "OPT", serial = 2, character = "b", overrides = {}) {
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
      requestId: `ies-artifact-request-v1:${"1".repeat(40)}`,
      replayKey: `ies-artifact-replay-v1:${"2".repeat(40)}`,
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
      requestFingerprint: `engine-selection-set-v1:${"4".repeat(40)}`,
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

function labProjection(overrides = {}) {
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
      gearTray: identity("GT", 1, "a"),
      optic: identity("OPT", 2, "b"),
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

function merge(target, source) {
  for (const [key, value] of Object.entries(source || {})) {
    if (isPlainObject(value) && isPlainObject(target[key])) merge(target[key], value);
    else target[key] = clone(value);
  }
  return target;
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function applyGenerationIdentity(value) {
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

function assertBlocked(result, blocker) {
  assert.equal(result.schemaId, contract.IES_GENERATION_REFERENCE_BINDING_SCHEMA_ID);
  assert.equal(result.schemaVersion, contract.IES_GENERATION_REFERENCE_BINDING_SCHEMA_VERSION);
  assert.equal(result.state, contract.IES_GENERATION_REFERENCE_BINDING_STATES.blockedFailClosed);
  assert.equal(result.bindingId, null);
  assert.equal(result.replayKey, null);
  assert.equal(result.sourceGeneration, null);
  assert.equal(result.referenceIdentity, null);
  assert.deepEqual(result.blockers, [blocker]);
  assert.equal(result.audit.accepted, false);
  assert.equal(result.safetyFlags.referenceIdentityBound, false);
  assert.equal(result.safetyFlags.resolverInvoked, false);
  assert.equal(result.safetyFlags.sealedReferenceLoaded, false);
  assert.equal(result.safetyFlags.generatorInvoked, false);
}

test("exports only the approved import-free binding interface", () => {
  assert.deepEqual(Object.keys(contract).sort(), [
    "IES_GENERATION_REFERENCE_BINDING_AUDIT_SCHEMA_ID",
    "IES_GENERATION_REFERENCE_BINDING_AUDIT_SCHEMA_VERSION",
    "IES_GENERATION_REFERENCE_BINDING_SCHEMA_ID",
    "IES_GENERATION_REFERENCE_BINDING_SCHEMA_VERSION",
    "IES_GENERATION_REFERENCE_BINDING_STATES",
    "adaptIesGenerationInputV1ReferenceBinding",
  ].sort());
});

test("binds one exact immutable ready generation input to an OPT identity", () => {
  const result = contract.adaptIesGenerationInputV1ReferenceBinding(
    generationInput(),
    labProjection(),
    { user: "outside", project: "outside", owner: "outside" },
  );

  assert.equal(result.state, contract.IES_GENERATION_REFERENCE_BINDING_STATES.readyReadOnly);
  assert.match(result.bindingId, /^ies-generation-reference-binding-v1:[0-9a-f]{40}$/);
  assert.match(result.replayKey, /^ies-generation-reference-binding-replay-v1:[0-9a-f]{40}$/);
  assert.equal(result.sourceGeneration.schemaId, "controlstack.downstream.ies-generation-input.v1");
  assert.equal(result.selection.optic, "OPAL");
  assert.deepEqual(result.run, { runIndex: 0, quantity: 1, lengthMm: 5600 });
  assert.deepEqual(result.technicalBinding, {
    selectedOpticKey: "OPAL",
    opticBomId: "OPT-DNX80-OPAL",
    evidenceRef: "evidence-hot-test",
    referenceRoomTaC: 25,
    referenceInternalTaC: 27,
    opticThermalRiseTaC: 2,
  });
  assert.equal(result.referenceIdentity.kind, "OPT");
  assert.equal(result.referenceIdentity.resolverPath, `/r/${result.referenceIdentity.referenceId}`);
  assert.equal(result.audit.referenceIdentityBound, true);
  assert.equal(result.audit.resolverInvoked, false);
  assert.equal(result.safetyFlags.referenceIdentityBound, true);
  assert.equal(result.safetyFlags.storageAccessed, false);
  assert.equal(result.safetyFlags.sealedReferenceLoaded, false);
  assert.equal(result.safetyFlags.generatorInvoked, false);
  assert.doesNotMatch(JSON.stringify(result), /outside/);
  assertDeepFrozen(result);
});

test("preserves valid zero measured thermal values", () => {
  const generation = generationInput({
    selection: { roomAmbientTaC: 0, targetLmPerM: 0 },
    thermal: {
      selectedRoomTaC: 0,
      referenceRoomTaC: 0,
      referenceInternalTaC: 0,
      opticThermalRiseTaC: 0,
      derivedInternalTaC: 0,
      curveLookupTaC: 0,
      effectiveCurveTaC: 25,
      temperatureMode: "clamped-low",
      requestedCurrentMa: 0,
      currentMode: "clamped-low",
      verifiedLmPerM: 0,
    },
  });
  const lab = labProjection({
    thermalEvidence: {
      referenceRoomTaC: 0,
      referenceInternalTaC: 0,
      opticThermalRiseTaC: 0,
    },
  });
  const result = contract.adaptIesGenerationInputV1ReferenceBinding(generation, lab);
  assert.equal(result.state, contract.IES_GENERATION_REFERENCE_BINDING_STATES.readyReadOnly);
  assert.equal(result.selection.targetLmPerM, 0);
  assert.equal(result.technicalBinding.referenceRoomTaC, 0);
  assert.equal(result.technicalBinding.opticThermalRiseTaC, 0);
});

test("is replay-identical and ignores outer traceability", () => {
  const generation = generationInput();
  const lab = labProjection();
  const first = contract.adaptIesGenerationInputV1ReferenceBinding(
    generation,
    lab,
    { user: "a", project: "a", registration: "a" },
  );
  const second = contract.adaptIesGenerationInputV1ReferenceBinding(
    clone(generation),
    clone(lab),
    { user: "b", project: "b", registration: "b", renamedEligibility: true },
  );
  assert.deepEqual(first, second);
  assert.equal(JSON.stringify(first), JSON.stringify(second));
});

test("moves binding identity when the reference or generation identity moves", () => {
  const baseline = contract.adaptIesGenerationInputV1ReferenceBinding(generationInput(), labProjection());
  const changedReference = contract.adaptIesGenerationInputV1ReferenceBinding(
    generationInput(),
    labProjection({ references: { optic: identity("OPT", 3, "c") } }),
  );
  const changedRun = contract.adaptIesGenerationInputV1ReferenceBinding(
    generationInput({ run: { lengthMm: 6000 } }),
    labProjection(),
  );
  assert.notEqual(changedReference.bindingId, baseline.bindingId);
  assert.notEqual(changedReference.replayKey, baseline.replayKey);
  assert.notEqual(changedRun.bindingId, baseline.bindingId);
});

test("fails closed on schema, path, unresolved, reference and binding contradictions", () => {
  const validGeneration = generationInput();
  const validLab = labProjection();

  const unknown = clone(validGeneration);
  unknown.schemaVersion = 2;
  assertBlocked(contract.adaptIesGenerationInputV1ReferenceBinding(unknown, validLab),
    "generation_input_schema_or_identity_invalid");

  const extra = clone(validGeneration);
  extra.owner = "outside";
  assertBlocked(contract.adaptIesGenerationInputV1ReferenceBinding(extra, validLab),
    "generation_input_invalid_shape");

  assertBlocked(contract.adaptIesGenerationInputV1ReferenceBinding(
    validGeneration,
    labProjection({ path: "gear_tray", selection: { opticBomId: null, opticVariant: null }, references: { optic: null }, thermalEvidence: null }),
  ), "lab_projection_optic_path_required");

  assertBlocked(contract.adaptIesGenerationInputV1ReferenceBinding(
    validGeneration,
    labProjection({ unresolved: ["thermal_evidence_reference_unbound"] }),
  ), "lab_projection_unresolved");

  assertBlocked(contract.adaptIesGenerationInputV1ReferenceBinding(
    validGeneration,
    labProjection({ references: { optic: null } }),
  ), "lab_optic_reference_invalid");

  assertBlocked(contract.adaptIesGenerationInputV1ReferenceBinding(
    validGeneration,
    labProjection({ references: { optic: identity("GT", 2, "b") } }),
  ), "lab_optic_reference_invalid");

  assertBlocked(contract.adaptIesGenerationInputV1ReferenceBinding(
    validGeneration,
    labProjection({ references: { optic: identity("OPT", 2, "b", { resolverPath: "/r/wrong" }) } }),
  ), "lab_optic_reference_invalid");

  assertBlocked(contract.adaptIesGenerationInputV1ReferenceBinding(
    validGeneration,
    labProjection({ selection: { opticVariant: "ROPE" } }),
  ), "optic_key_variant_mismatch");

  assertBlocked(contract.adaptIesGenerationInputV1ReferenceBinding(
    validGeneration,
    labProjection({ selection: { opticBomId: "OPT-DNX80-OTHER" } }),
  ), "optic_bom_binding_mismatch");

  assertBlocked(contract.adaptIesGenerationInputV1ReferenceBinding(
    validGeneration,
    labProjection({ thermalEvidence: { evidenceRef: "other-evidence" } }),
  ), "evidence_reference_binding_mismatch");

  assertBlocked(contract.adaptIesGenerationInputV1ReferenceBinding(
    validGeneration,
    labProjection({ thermalEvidence: { referenceInternalTaC: 28, opticThermalRiseTaC: 3 } }),
  ), "measured_thermal_binding_mismatch");
});

test("fails closed on tampered generation identity, unsafe flags and private values", () => {
  const lab = labProjection();

  const tamperedIdentity = generationInput();
  tamperedIdentity.generationInputId = `ies-generation-input-v1:${"0".repeat(40)}`;
  tamperedIdentity.audit.generationInputId = tamperedIdentity.generationInputId;
  assertBlocked(contract.adaptIesGenerationInputV1ReferenceBinding(tamperedIdentity, lab),
    "generation_deterministic_identity_or_audit_mismatch");

  const unsafe = generationInput();
  unsafe.safetyFlags.sealedReferenceLoaded = true;
  assertBlocked(contract.adaptIesGenerationInputV1ReferenceBinding(unsafe, lab),
    "generation_safety_invalid");

  const privateSelection = generationInput({ selection: { system: "C:\\private\\DNX80" } });
  assertBlocked(contract.adaptIesGenerationInputV1ReferenceBinding(privateSelection, lab),
    "generation_selection_text_invalid");

  const rawEvidence = generationInput({ technicalProvenance: { evidenceRef: "IESNA:LM-63-2002" }, thermal: { evidenceRef: "IESNA:LM-63-2002" } });
  assertBlocked(contract.adaptIesGenerationInputV1ReferenceBinding(rawEvidence, lab),
    "generation_provenance_invalid");
});

test("production adapter has no import, resolver, generator, route, persistence or write seam", () => {
  const source = readFileSync(
    new URL("../../packages/lab-kernel/ies-toolkit/iesGenerationInputV1ReferenceBindingAdapter.js", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(source, /^\s*import\s/m);
  assert.doesNotMatch(source, /from\s+["']/);
  assert.doesNotMatch(source, /buildIesFromReference|buildProjectIes|resolveReference|fetch\s*\(|XMLHttpRequest|WebSocket/);
  assert.doesNotMatch(source, /\b(?:writeFile|appendFile|mkdir|unlink|rename|createWriteStream)\s*\(/);
  assert.doesNotMatch(source, /\/api\/|app\.(?:get|post|put|patch|delete)\s*\(/i);
  assert.doesNotMatch(source, /IESNA:LM-63|\bTILT=/);
  assert.doesNotMatch(source, /Date\.now|Math\.random|randomUUID/i);

  const result = contract.adaptIesGenerationInputV1ReferenceBinding(generationInput(), labProjection());
  assert.equal(result.safetyFlags.resolverInvoked, false);
  assert.equal(result.safetyFlags.storageAccessed, false);
  assert.equal(result.safetyFlags.sealedReferenceLoaded, false);
  assert.equal(result.safetyFlags.authorityInspected, false);
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
      words[index] = ((padded[offset] << 24) | (padded[offset + 1] << 16)
        | (padded[offset + 2] << 8) | padded[offset + 3]) >>> 0;
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
      e = d; d = c; c = rotateLeft(b, 30); b = a; a = temp;
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
