import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";

import {
  buildGovernanceDataRetrievalGatewayViewState,
  GOVERNANCE_DATA_RETRIEVAL_GATEWAY_CONTRACT_ID,
  GOVERNANCE_DATA_RETRIEVAL_GATEWAY_INPUT_FIELD_ORDER,
  GOVERNANCE_DATA_RETRIEVAL_GATEWAY_OUTPUT_FIELD_ORDER,
  GOVERNANCE_DATA_RETRIEVAL_GATEWAY_OWNER,
  GOVERNANCE_DATA_RETRIEVAL_GATEWAY_SCHEMA_ID,
  GOVERNANCE_DATA_RETRIEVAL_GATEWAY_SCHEMA_VERSION,
  GOVERNANCE_DATA_RETRIEVAL_GATEWAY_STATES,
} from "../packages/workspace-kernel/governance/dataRetrievalGatewayContract.js";

function validInput(overrides = {}) {
  return {
    moduleId: "cs-selector",
    moduleLabel: "Selector",
    outputId: "selected-result-summary",
    outputLabel: "Selected result summary",
    outputDescription: "A safe scalar description of the selected engineering result.",
    readinessLabel: "Spec Ready",
    projectContextPresent: true,
    identityCapturePresent: true,
    discoveryDescriptions: [
      "IES Builder may provide a future photometry output.",
      "Selector provides a selected engineering result summary.",
    ],
    ...overrides,
  };
}

function assertAllDeliveryCapabilitiesFalse(result) {
  for (const key of [
    "retrievalPermitted",
    "downloadEnabled",
    "deliveryEnabled",
    "routeAdded",
    "filesystemWriteAttempted",
    "persistenceAttempted",
    "emailAttempted",
    "crmAttempted",
    "engineInvoked",
    "readinessMutated",
    "liveCrossModuleReadAttempted",
  ]) {
    assert.equal(result[key], false, key);
  }
}

async function sourceFiles(relativeDirectory) {
  const directory = new URL(relativeDirectory, import.meta.url);
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      files.push(...await sourceFiles(`${relativeDirectory}${entry.name}/`));
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      files.push(new URL(`${relativeDirectory}${entry.name}`, import.meta.url));
    }
  }
  return files;
}

test("Governance retrieval gateway returns the four deterministic fail-closed view states", () => {
  const cases = [
    {
      input: validInput({ readinessLabel: null, projectContextPresent: false, identityCapturePresent: false }),
      state: GOVERNANCE_DATA_RETRIEVAL_GATEWAY_STATES.noUsefulOutput,
      blocker: "readiness-no-useful-output",
      futureRetrievalReady: false,
    },
    {
      input: validInput({ projectContextPresent: false, identityCapturePresent: false }),
      state: GOVERNANCE_DATA_RETRIEVAL_GATEWAY_STATES.projectRequired,
      blocker: "project-context-required",
      futureRetrievalReady: false,
    },
    {
      input: validInput({ identityCapturePresent: false }),
      state: GOVERNANCE_DATA_RETRIEVAL_GATEWAY_STATES.identityRequired,
      blocker: "identity-capture-required",
      futureRetrievalReady: false,
    },
    {
      input: validInput({ readinessLabel: "Factory Ready" }),
      state: GOVERNANCE_DATA_RETRIEVAL_GATEWAY_STATES.readyForFutureRetrieval,
      blocker: null,
      futureRetrievalReady: true,
    },
  ];

  for (const expected of cases) {
    const first = buildGovernanceDataRetrievalGatewayViewState(expected.input);
    const second = buildGovernanceDataRetrievalGatewayViewState(expected.input);

    assert.deepEqual(first, second);
    assert.deepEqual(Object.keys(first), GOVERNANCE_DATA_RETRIEVAL_GATEWAY_OUTPUT_FIELD_ORDER);
    assert.equal(first.schemaId, GOVERNANCE_DATA_RETRIEVAL_GATEWAY_SCHEMA_ID);
    assert.equal(first.schemaVersion, GOVERNANCE_DATA_RETRIEVAL_GATEWAY_SCHEMA_VERSION);
    assert.equal(first.contractId, GOVERNANCE_DATA_RETRIEVAL_GATEWAY_CONTRACT_ID);
    assert.equal(first.owner, GOVERNANCE_DATA_RETRIEVAL_GATEWAY_OWNER);
    assert.equal(first.state, expected.state);
    assert.equal(first.blocker, expected.blocker);
    assert.equal(first.futureRetrievalReady, expected.futureRetrievalReady);
    assert.equal(first.failClosed, !expected.futureRetrievalReady);
    assert.equal(Object.isFrozen(first), true);
    assert.equal(Object.isFrozen(first.discoveryDescriptions), true);
    assertAllDeliveryCapabilitiesFalse(first);
  }
});

test("readiness, project context and identity remain separate named conditions", () => {
  const noOutput = buildGovernanceDataRetrievalGatewayViewState(validInput({
    readinessLabel: null,
    projectContextPresent: true,
    identityCapturePresent: true,
  }));
  assert.equal(noOutput.readinessCheckName, "readiness");
  assert.equal(noOutput.readinessSatisfied, false);
  assert.equal(noOutput.projectContextCheckName, "project-context");
  assert.equal(noOutput.projectContextSatisfied, true);
  assert.equal(noOutput.identityCheckName, "identity");
  assert.equal(noOutput.identitySatisfied, true);

  const identityRequired = buildGovernanceDataRetrievalGatewayViewState(validInput({
    readinessLabel: "Build Ready",
    projectContextPresent: true,
    identityCapturePresent: false,
  }));
  assert.equal(identityRequired.readinessSatisfied, true);
  assert.equal(identityRequired.projectContextSatisfied, true);
  assert.equal(identityRequired.identitySatisfied, false);
  assert.equal(identityRequired.engineInvoked, false);
  assert.equal(identityRequired.readinessMutated, false);
});

test("ready-for-future-retrieval is not download or delivery permission", () => {
  const result = buildGovernanceDataRetrievalGatewayViewState(validInput({
    readinessLabel: "Factory Ready",
  }));
  assert.equal(result.state, "ready-for-future-retrieval");
  assert.equal(result.futureRetrievalReady, true);
  assert.equal(result.failClosed, false);
  assertAllDeliveryCapabilitiesFalse(result);
  for (const prohibited of [
    "path",
    "url",
    "uri",
    "blob",
    "body",
    "file",
    "filename",
    "provider",
    "traceabilityEnvelope",
  ]) {
    assert.equal(Object.hasOwn(result, prohibited), false, prohibited);
  }
});

test("static discovery descriptions are canonical, immutable and never live-read", () => {
  const result = buildGovernanceDataRetrievalGatewayViewState(validInput({
    discoveryDescriptions: [
      "Zulu output may be provided later.",
      "Alpha output is described statically.",
      "Zulu output may be provided later.",
    ],
  }));
  assert.deepEqual(result.discoveryDescriptions, [
    "Alpha output is described statically.",
    "Zulu output may be provided later.",
  ]);
  assert.equal(result.liveCrossModuleReadAttempted, false);
  assert.throws(() => result.discoveryDescriptions.push("Mutation"), TypeError);
});

test("gateway rejects unknown, nested, private, raw, URL, blob and provider-shaped input", () => {
  const invalidInputs = [
    { ...validInput(), extra: true },
    { ...validInput(), traceabilityEnvelope: {} },
    { ...validInput(), provider: { id: "hubspot" } },
    { ...validInput(), discoveryDescriptions: [{ provider: "hubspot" }] },
    { ...validInput(), outputDescription: "C:\\private\\output.ies" },
    { ...validInput(), outputDescription: "https://example.invalid/output" },
    { ...validInput(), outputDescription: "blob:unsafe-output" },
    { ...validInput(), outputDescription: "IESNA:LM-63-2002 TILT=NONE" },
    { ...validInput(), readinessLabel: "Download Ready" },
    { ...validInput(), projectContextPresent: "yes" },
    { ...validInput(), identityCapturePresent: 1 },
  ];
  for (const input of invalidInputs) {
    assert.throws(() => buildGovernanceDataRetrievalGatewayViewState(input), TypeError);
  }
});

test("input and output schemas are fixed and exclude Engine or authority envelopes", () => {
  assert.deepEqual(GOVERNANCE_DATA_RETRIEVAL_GATEWAY_INPUT_FIELD_ORDER, [
    "moduleId",
    "moduleLabel",
    "outputId",
    "outputLabel",
    "outputDescription",
    "readinessLabel",
    "projectContextPresent",
    "identityCapturePresent",
    "discoveryDescriptions",
  ]);
  for (const prohibited of [
    "engineInput",
    "engineOutput",
    "selectorPayload",
    "traceabilityEnvelope",
    "authority",
    "provider",
    "projectId",
    "identity",
  ]) {
    assert.equal(GOVERNANCE_DATA_RETRIEVAL_GATEWAY_INPUT_FIELD_ORDER.includes(prohibited), false);
  }
});

test("Governance is the sole active outward owner and the shell retains no module-owned retrieval action", async () => {
  const [contractSource, workflowSource, shellSource] = await Promise.all([
    readFile(
      new URL("../packages/workspace-kernel/governance/dataRetrievalGatewayContract.js", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../apps/workspace-shell/src/projectBrowserSelectedProjectExportsWorkflow.js", import.meta.url),
      "utf8",
    ),
    readFile(new URL("../apps/workspace-shell/src/shell.js", import.meta.url), "utf8"),
  ]);

  assert.equal((contractSource.match(/GOVERNANCE_DATA_RETRIEVAL_GATEWAY_OWNER/g) || []).length >= 2, true);
  assert.match(contractSource, /"governance-shell"/);
  assert.match(contractSource, /retrievalPermitted: false/);
  assert.match(contractSource, /downloadEnabled: false/);
  assert.match(contractSource, /deliveryEnabled: false/);

  for (const prohibited of [
    "resolveIesBuilderSelectedProjectIesExportDownloadSourceBoundary",
    "prepareIesBuilderProjectIesExportDownloadCapabilityAction",
    "PRIVATE_PREPARED_ACTIONS",
    "new Map([[\"project-ies\", preparedAction]])",
  ]) {
    assert.equal(workflowSource.includes(prohibited), false, prohibited);
  }
  assert.match(
    workflowSource,
    /export function getShellProjectBrowserSelectedProjectExportAction\(\)\s*\{\s*return null;\s*\}/,
  );
  for (const prohibited of [
    "getShellProjectBrowserSelectedProjectExportAction",
    "handleProjectBrowserProjectIesExportDownload",
    "preparedAction()",
    "createObjectURL(blob)",
  ]) {
    assert.equal(shellSource.includes(prohibited), false, prohibited);
  }
  assert.match(shellSource, /handleProjectBrowserSelectedProjectRetrievalRequest/);
  assert.match(shellSource, /governance-data-retrieval-gateway-not-activated/);

  const governanceSources = await sourceFiles(
    "../packages/workspace-kernel/governance/",
  );
  const owners = [];
  for (const file of governanceSources) {
    const source = await readFile(file, "utf8");
    if (source.includes("GOVERNANCE_DATA_RETRIEVAL_GATEWAY_CONTRACT_ID")) owners.push(file.href);
  }
  assert.equal(owners.length, 1);
});
