import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { createEmergenceState } from "../packages/modules/emergence/emergenceState.js";
import { createEmergenceViewModel } from "../packages/modules/emergence/emergenceViewModel.js";

function rowValue(rows, key) {
  const match = rows.find(([label]) => label === key);
  return match?.[1];
}

function createAdapter(downstream = {}) {
  const selector = {
    status: "foundation-placeholder",
    readiness: { egres: "contract-only", compliance: "blocked-until-egres-package" },
    runRefs: [],
    areaRefs: [],
    fittingRefs: [],
    optionRefs: [],
    emergencyCandidates: [],
    sceneBuilderCandidates: [],
    complianceCandidates: [],
    ceilingCandidates: [],
    ...(downstream.selector || {}),
  };

  const snapshot = {
    route: { moduleId: "emergence" },
    identity: {
      owner: "identity",
      status: "ready",
      currentUser: { name: "Workspace User", email: "safe@example.test" },
      identityState: "internal_user",
      classification: "internal",
      actualRole: "developer",
      derivedActualRole: "developer",
      displayRole: "developer",
    },
    project: {
      owner: "shell",
      status: "ready",
      metadata: { title: "EGRES Diagnostic Project", projectId: "P-001", readiness: "not-ready" },
      currentProject: { title: "EGRES Diagnostic Project", projectId: "P-001" },
      selection: { source: "test-fixture" },
    },
    company: { owner: "shell", status: "placeholder", companyName: "No company loaded" },
    crm: { owner: "shell", status: "placeholder", writePolicy: { enabled: false } },
    handoff: { owner: "shell", status: "deferred", available: false },
    visibility: {
      owner: "shell",
      status: "ready",
      visibleModules: ["emergence"],
      hiddenModules: [],
      moduleReasons: { emergence: { visible: true, reason: "test" } },
      inputs: { projectMode: "auto", projectPresent: true },
      rule: "test",
    },
    downstream: {
      owner: "shell",
      status: "foundation-ready",
      source: "test-downstream-context",
      consumers: {
        egres: { label: "Emergency / EGRES", status: "not-implemented" },
        compliance_matters: { label: "Compliance Matters", status: "not-implemented" },
      },
      ...downstream,
      selector,
    },
    flags: { owner: "shell", values: {} },
    diagnostics: { phase: "test" },
  };

  return {
    moduleId: "emergence",
    readSnapshots() {
      return snapshot;
    },
    hasCapability() {
      return false;
    },
    isFlagEnabled() {
      return false;
    },
  };
}

function createModel(downstream = {}) {
  return createEmergenceViewModel({
    adapter: createAdapter(downstream),
    emergenceState: createEmergenceState(),
  });
}

function safeSelectedResult() {
  return {
    selectedResultAvailable: true,
    accepted: true,
    engineVerified: true,
    stale: false,
    selectedFamilySubsetLock: { boardFamily: "B-01", pitchFamily: "P-01" },
    perRunLookupNormalised: true,
    sourceInputFingerprint: "fingerprint-should-not-render",
    boardDataSourceVersion: "board-data-version-should-not-render",
  };
}

test("default EGRES package evidence state is absent and fail-closed", () => {
  const model = createModel();
  const rows = model.egresPackageEvidenceReadinessRows;

  assert.equal(rowValue(rows, "schema / contract name"), "controlstack.egres.package_evidence_readiness_map.v1");
  assert.equal(rowValue(rows, "readOnly"), "true");
  assert.equal(rowValue(rows, "diagnosticOnly"), "true");
  assert.equal(rowValue(rows, "packageEvidenceState"), "absent");
  assert.equal(model.egresPackageEvidenceReadinessMap.overallReadinessState, "absent");
  assert.deepEqual(model.egresPackageEvidenceReadinessMap.safeStates, [
    "absent",
    "waiting_for_selected_result",
    "waiting_for_ies_candidate",
    "waiting_for_lab_proof",
    "waiting_for_compliance_review",
    "metadata_present_unreviewed",
    "blocked_no_proof_authority",
  ]);
});

test("EGRES package evidence readiness map is read-only and diagnostic-only", () => {
  const model = createModel({ egresPackageEvidence: { present: true, status: "received" } });

  assert.equal(model.egresPackageEvidenceReadinessMap.readOnly, true);
  assert.equal(model.egresPackageEvidenceReadinessMap.diagnosticOnly, true);
  assert.equal(rowValue(model.egresPackageEvidenceReadinessRows, "packageEvidenceState"), "metadata_present_unreviewed");
  assert.equal(model.packageDiagnostics.packageAcceptanceEnabled, false);
  assert.equal(model.packageDiagnostics.rowTagWorkflowRestored, false);
  assert.equal(model.packageDiagnostics.serverEndpointAdded, false);
  assert.equal(model.packageDiagnostics.rawPackageJsonExposed, false);
});

test("Selector emergency and egress intent is shown as intent only, not placement authority", () => {
  const model = createModel({
    selector: {
      intent: {
        egressLight: "Maintained",
        egressSound: "EWIS",
        sensor: "PIR Sensor",
        emergencyAccessoryIntent: "Emergency pack",
        runPlacementIntent: "Run 1 start preference",
      },
    },
  });

  assert.equal(rowValue(model.egresPackageEvidenceReadinessRows, "selectorIntentPresent"), "true");
  assert.match(rowValue(model.selectorIntentRows, "egress light preference"), /intent only/);
  assert.match(rowValue(model.selectorIntentRows, "egress sound / EWIS preference"), /intent only/);
  assert.match(rowValue(model.selectorIntentRows, "sensor preference"), /intent only/);
  assert.match(rowValue(model.selectorIntentRows, "emergency \/ accessory intent"), /downstream placement remains unresolved/);
  assert.match(rowValue(model.selectorIntentRows, "run-level placement intent"), /unresolved input only/);
  assert.match(rowValue(model.engineRunTableBlockedFieldRows, "resolved emergency placement"), /blocked/);
  assert.match(rowValue(model.engineRunTableBlockedFieldRows, "resolved accessory placement"), /not Selector authority/);
});

test("Engine/RunTable selected result dependency remains blocked unless safe selected-result metadata exists", () => {
  const missing = createModel({ egresPackageEvidence: { present: true } });
  assert.equal(rowValue(missing.egresPackageEvidenceReadinessRows, "selectedEngineResultRequired"), "true");
  assert.equal(rowValue(missing.egresDependencyRows, "selected Engine/RunTable result dependency"), "waiting_for_selected_result");
  assert.equal(rowValue(missing.engineRunTableBlockedFieldRows, "selected result acceptance"), "blocked; accepted selected Engine/RunTable result required");

  const incomplete = createModel({
    egresPackageEvidence: { present: true },
    selectedResultProjection: {
      selectedResultAvailable: true,
      accepted: true,
      engineVerified: true,
      stale: false,
      perRunLookupNormalised: true,
    },
  });
  assert.equal(incomplete.egresPackageEvidenceReadinessMap.selectedEngineResultState, "waiting_for_selected_result");

  const ready = createModel({
    egresPackageEvidence: { present: true },
    selectedResultProjection: safeSelectedResult(),
  });
  assert.equal(ready.egresPackageEvidenceReadinessMap.selectedEngineResultState, "metadata_present_unreviewed");
  assert.equal(ready.egresPackageEvidenceReadinessMap.selectedEngineResultMetadataPresent, true);
  assert.equal(rowValue(ready.engineRunTableBlockedFieldRows, "source fingerprint"), "metadata present; raw fingerprint not exposed");
  assert.equal(rowValue(ready.engineRunTableBlockedFieldRows, "Board Data source version"), "metadata present; raw Board Data rows not exposed");
  assert.equal(JSON.stringify(ready).includes("fingerprint-should-not-render"), false);
  assert.equal(JSON.stringify(ready).includes("board-data-version-should-not-render"), false);
});

test("IES Builder dependency remains candidate-output only", () => {
  const model = createModel({
    egresPackageEvidence: { present: true },
    selectedResultProjection: safeSelectedResult(),
    iesBuilderCandidate: { metadataPresent: true, candidateOutputOnly: true, candidateManifestRef: "opaque-candidate-ref" },
  });

  assert.equal(rowValue(model.egresPackageEvidenceReadinessRows, "iesCandidateRequired"), "true");
  assert.equal(model.egresPackageEvidenceReadinessMap.iesCandidateState, "metadata_present_unreviewed");
  assert.equal(model.egresPackageEvidenceReadinessMap.iesCandidateOutputOnly, true);
  assert.match(rowValue(model.egresDependencyRows, "IES Builder candidate dependency"), /candidate-output-only/);
  assert.equal(model.egresPackageEvidenceReadinessMap.productionClaimAllowed, false);
});

test("Lab Proof, Compliance, Controlled Records, and RREG dependencies do not grant authority", () => {
  const model = createModel({
    egresPackageEvidence: { present: true },
    selectedResultProjection: safeSelectedResult(),
    iesBuilderCandidate: { metadataPresent: true, candidateOutputOnly: true },
  });

  assert.equal(rowValue(model.egresPackageEvidenceReadinessRows, "labProofRequired"), "true");
  assert.equal(rowValue(model.egresPackageEvidenceReadinessRows, "complianceReviewRequired"), "true");
  assert.equal(rowValue(model.egresPackageEvidenceReadinessRows, "controlledRecordRequired"), "true");
  assert.equal(rowValue(model.egresPackageEvidenceReadinessRows, "rregMappingRequired"), "true");
  assert.match(rowValue(model.egresDependencyRows, "Lab Proof dependency"), /blocked_no_proof_authority/);
  assert.match(rowValue(model.egresDependencyRows, "Compliance review dependency"), /review-only, not certification/);
  assert.match(rowValue(model.egresDependencyRows, "Controlled Records provenance dependency"), /no write here/);
  assert.match(rowValue(model.egresDependencyRows, "RREG responsibility\/reviewer\/approver\/custody dependency"), /no approval or custody transfer/);
});

test("AS2293 certification, commissioning signoff, compliance approval, and production claim flags are false", () => {
  const model = createModel({ egresPackageEvidence: { present: true } });

  assert.equal(rowValue(model.egresPackageEvidenceReadinessRows, "productionClaimAllowed"), "false");
  assert.equal(rowValue(model.egresPackageEvidenceReadinessRows, "certificationAuthority"), "false");
  assert.equal(rowValue(model.egresPackageEvidenceReadinessRows, "commissioningSignoffEnabled"), "false");
  assert.equal(rowValue(model.egresPackageEvidenceReadinessRows, "as2293CertificationEnabled"), "false");
  assert.equal(rowValue(model.egresProductionClaimRows, "emergency design proof"), "false");
  assert.equal(rowValue(model.egresProductionClaimRows, "AS/NZS 2293 certification"), "false");
  assert.equal(rowValue(model.egresProductionClaimRows, "commissioning signoff"), "false");
  assert.equal(rowValue(model.egresProductionClaimRows, "Compliance approval"), "false");
});

test("raw evidence, IES, PDF, artefacts, package JSON, local paths, credentials, USERS, and private details are not exposed", () => {
  const model = createModel({
    egresPackageEvidence: {
      present: true,
      rawPackageJson: "C:\\ControlStack\\secret\\package.json USERS password token raw.ies raw.pdf",
      localPath: "C:\\ControlStack\\secret",
    },
    selector: {
      intent: {
        egressLight: "C:\\ControlStack\\secret\\fixture.ies",
        egressSound: "password token USERS",
      },
    },
  });

  assert.equal(rowValue(model.egresRedactionRows, "rawEvidenceExposed"), "false");
  assert.equal(rowValue(model.egresRedactionRows, "rawIesExposed"), "false");
  assert.equal(rowValue(model.egresRedactionRows, "rawPdfExposed"), "false");
  assert.equal(rowValue(model.egresRedactionRows, "rawArtefactsExposed"), "false");
  assert.equal(rowValue(model.egresRedactionRows, "rawPackageJsonExposed"), "false");
  assert.equal(rowValue(model.egresRedactionRows, "localPathsExposed"), "false");
  assert.equal(rowValue(model.egresRedactionRows, "credentialsExposed"), "false");
  assert.equal(rowValue(model.egresRedactionRows, "usersExposed"), "false");
  assert.equal(rowValue(model.egresRedactionRows, "privateDetailsExposed"), "false");

  const rendered = JSON.stringify(model);
  assert.equal(rendered.includes("C:\\ControlStack"), false);
  assert.equal(rendered.includes("USERS password token"), false);
  assert.equal(rendered.includes("raw.ies"), false);
  assert.equal(rendered.includes("raw.pdf"), false);
});

test("no EGRES route or POST endpoint is added", async () => {
  const serverText = await readFile(new URL("../server.js", import.meta.url), "utf-8");
  const viewText = await readFile(new URL("../packages/modules/emergence/emergenceView.js", import.meta.url), "utf-8");
  const modelText = await readFile(new URL("../packages/modules/emergence/emergenceViewModel.js", import.meta.url), "utf-8");
  const combined = `${viewText}\n${modelText}`;

  assert.equal(serverText.includes("/api/egres"), false);
  assert.equal(serverText.includes("EGRES_POST"), false);
  assert.equal(/method:\s*["']POST["']/.test(combined), false);
  assert.equal(/fetch\(/.test(combined), false);
  assert.equal(/localStorage/.test(combined), false);
  assert.equal(/createElement\(["']button["']\)/.test(combined), false);
});
