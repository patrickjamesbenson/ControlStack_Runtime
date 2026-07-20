import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const ROOT = new URL("../../packages/lab-kernel/ies-toolkit/", import.meta.url);
const FILES = Object.freeze({
  request: "test_request.html",
  order: "lab_request.html",
  report: "extended_report.html",
  intake: "onemm_contract.html",
});

async function sourceFor(name) {
  return readFile(new URL(name, ROOT), "utf8");
}

async function contractApi(name, exportsList) {
  const source = await sourceFor(name);
  const match = source.match(/\/\/ BEGIN LAB-027 CONTRACT\n([\s\S]*?)\n\/\/ END LAB-027 CONTRACT/);
  assert.ok(match, `${name} must expose the bounded LAB-027 contract block`);
  const context = vm.createContext({});
  vm.runInContext(`${match[1]}\nglobalThis.__api = { ${exportsList.join(", ")} };`, context, { filename: name });
  return context.__api;
}

function json(value) {
  return JSON.parse(JSON.stringify(value));
}

const commonKeys = Object.freeze([
  "schemaId",
  "schemaVersion",
  "stage",
  "workflowKey",
  "priorStageRefs",
  "customer",
  "project",
  "item",
  "conditions",
  "requestedTests",
  "unresolvedFields",
  "readOnly",
]);

function baseRequestInput() {
  return {
    workflowKey: "WF-NOVON-001",
    priorStageRefs: [],
    customer: {
      customerId: "CUST-001",
      company: "Example Lighting",
      contact: "Pat Example",
      internal: false,
    },
    project: {
      projectId: "PROJ-001",
      name: "Offline workflow proof",
      pipeline: "specification",
      ownerId: "OWNER-001",
      priority: "high",
      dueDate: "2026-08-31",
      customerReference: "REF-77",
    },
    item: {
      type: "luminaire",
      description: "80 mm direct linear sample",
      componentRefs: ["BRD-DNX80", "DRV-TRIDONIC-825"],
    },
    conditions: {
      ambientC: 25,
      mainsV: 230,
      driveLevels: ["450mA", "600mA"],
    },
    requestedTests: [
      { testId: "photometric", points: ["full"], driveLevels: ["450mA", "600mA"], source: "ies" },
      { testId: "thermal", points: ["tc"], driveLevels: ["600mA"], source: "lab" },
    ],
    unresolvedFields: ["/pureReferenceGearTray", "/customerAcknowledgement/acknowledged"],
    requestReason: "Reference development",
    pureReferenceGearTray: null,
    customerAcknowledgement: {
      acknowledged: null,
      enteredBy: "Pat Example",
      note: "Entered evidence only",
    },
  };
}

async function buildWorkflow() {
  const requestApi = await contractApi(FILES.request, ["buildTestRequestHandoff", "TEST_REQUEST_SCHEMA_ID"]);
  const orderApi = await contractApi(FILES.order, ["buildOrderHandoff", "ORDER_SCHEMA_ID"]);
  const reportApi = await contractApi(FILES.report, ["buildExtendedReportHandoff", "REPORT_SCHEMA_ID"]);
  const intakeApi = await contractApi(FILES.intake, ["buildReferenceIntakeHandoff", "INTAKE_SCHEMA_ID"]);

  const input = baseRequestInput();
  const request = requestApi.buildTestRequestHandoff(input);
  const order = orderApi.buildOrderHandoff(request, {
    orderStatus: "confirmed",
    instructions: "Run the entered test sequence only.",
    priorArtifactRef: "/reports/REQ-001",
    priorSha256: null,
    programIds: { workOrderId: "WO-001", crmId: null },
  });
  const report = reportApi.buildExtendedReportHandoff(order, {
    priorArtifactRef: "/reports/ORDER-001",
    priorSha256: null,
    results: [
      { testId: "thermal", point: "tc", state: "measured", value: 71.2, unit: "C", equipmentRef: "tl-01" },
      { testId: "photometric", point: "full", state: "unresolved", value: null, unit: "lm", equipmentRef: null },
    ],
  });
  const intake = intakeApi.buildReferenceIntakeHandoff(report, {
    priorArtifactRef: "/reports/LAB-REPORT-001",
    priorSha256: null,
    normalisedPhotometryRef: "/r/NVB-REF-OPT-000123/origin.ies",
    reportRefs: ["/reports/LAB-REPORT-001", "/r/NVB-REF-OPT-000123/evidence/LM-79__safe-9f2a11.txt"],
  });

  return { input, requestApi, orderApi, reportApi, intakeApi, request, order, report, intake };
}

test("exports the exact four approved schema IDs and common field paths", async () => {
  const workflow = await buildWorkflow();
  assert.equal(workflow.requestApi.TEST_REQUEST_SCHEMA_ID, "controlstack.lab.test-request-handoff.v1");
  assert.equal(workflow.orderApi.ORDER_SCHEMA_ID, "controlstack.lab.order-handoff.v1");
  assert.equal(workflow.reportApi.REPORT_SCHEMA_ID, "controlstack.lab.extended-report-handoff.v1");
  assert.equal(workflow.intakeApi.INTAKE_SCHEMA_ID, "controlstack.lab.reference-intake-handoff.v1");

  for (const payload of [workflow.request, workflow.order, workflow.report, workflow.intake]) {
    for (const key of commonKeys) assert.ok(Object.hasOwn(payload, key), `${payload.stage} is missing ${key}`);
    assert.equal(payload.schemaVersion, 1);
    assert.equal(payload.readOnly, true);
  }
  assert.deepEqual(
    [workflow.request.stage, workflow.order.stage, workflow.report.stage, workflow.intake.stage],
    ["test_request", "order", "extended_report", "reference_intake"],
  );
});

test("request to intake stays additive with no rekeying of common information", async () => {
  const { request, order, report, intake } = await buildWorkflow();
  const preserved = ["workflowKey", "customer", "project", "item", "conditions", "requestedTests"];
  for (const next of [order, report, intake]) {
    for (const key of preserved) assert.deepEqual(json(next[key]), json(request[key]), `${key} was rekeyed at ${next.stage}`);
  }
  assert.equal(order.requestReason, request.requestReason);
  assert.deepEqual(json(order.customerAcknowledgement), json(request.customerAcknowledgement));
  assert.equal(report.orderStatus, order.orderStatus);
  assert.deepEqual(json(intake.results), json(report.results));
});

test("unresolved fields survive every stage and new unresolved results append explicitly", async () => {
  const { request, order, report, intake } = await buildWorkflow();
  for (const pointer of request.unresolvedFields) {
    assert.ok(order.unresolvedFields.includes(pointer));
    assert.ok(report.unresolvedFields.includes(pointer));
    assert.ok(intake.unresolvedFields.includes(pointer));
  }
  assert.ok(report.unresolvedFields.includes("/results/1/value"));
  assert.ok(intake.unresolvedFields.includes("/results/1/value"));
});

test("requested-test and result ordering remain exact and deterministic", async () => {
  const first = await buildWorkflow();
  const second = await buildWorkflow();
  assert.deepEqual(json(first.request.requestedTests.map((row) => row.testId)), ["photometric", "thermal"]);
  assert.deepEqual(json(first.report.results.map((row) => `${row.testId}:${row.point}`)), ["thermal:tc", "photometric:full"]);
  assert.deepEqual(json(first.request), json(second.request));
  assert.deepEqual(json(first.order), json(second.order));
  assert.deepEqual(json(first.report), json(second.report));
  assert.deepEqual(json(first.intake), json(second.intake));
});

test("only canonical artifact references cross stages", async () => {
  const { request, orderApi, reportApi, intakeApi, order, report } = await buildWorkflow();
  assert.throws(() => orderApi.buildOrderHandoff(request, {
    orderStatus: "draft",
    instructions: null,
    priorArtifactRef: "C:\\temp\\request.json",
    priorSha256: null,
    programIds: { workOrderId: null, crmId: null },
  }), /canonical/);
  assert.throws(() => reportApi.buildExtendedReportHandoff(order, {
    priorArtifactRef: "file:///tmp/order.json",
    priorSha256: null,
    results: [],
  }), /canonical/);
  assert.throws(() => intakeApi.buildReferenceIntakeHandoff(report, {
    priorArtifactRef: "/reports/LAB-REPORT-001",
    priorSha256: null,
    normalisedPhotometryRef: "data:text/plain;base64,AAAA",
    reportRefs: [],
  }), /canonical/);
});

test("intake remains explicitly outside sealed-reference authority", async () => {
  const { intake } = await buildWorkflow();
  assert.equal(intake.schemaId, "controlstack.lab.reference-intake-handoff.v1");
  for (const forbidden of ["serial", "referenceId", "authorityRecordSha256", "referenceSha256", "approval", "seal", "sealedAtUtc"]) {
    assert.equal(Object.hasOwn(intake, forbidden), false, `${forbidden} must not exist`);
  }
  assert.notEqual(intake.schemaId, "controlstack.lab.reference.1mm.v1");
});

test("builders preserve caller input without mutation and return deep immutable payloads", async () => {
  const requestApi = await contractApi(FILES.request, ["buildTestRequestHandoff"]);
  const input = baseRequestInput();
  const snapshot = json(input);
  const output = requestApi.buildTestRequestHandoff(input);
  assert.deepEqual(input, snapshot);
  assert.equal(Object.isFrozen(output), true);
  assert.equal(Object.isFrozen(output.customer), true);
  assert.equal(Object.isFrozen(output.requestedTests), true);
});

test("fails closed on malformed workflow keys, dates, result states and measured values", async () => {
  const requestApi = await contractApi(FILES.request, ["buildTestRequestHandoff"]);
  const orderApi = await contractApi(FILES.order, ["buildOrderHandoff"]);
  const reportApi = await contractApi(FILES.report, ["buildExtendedReportHandoff"]);
  const input = baseRequestInput();
  input.workflowKey = "bad key";
  assert.throws(() => requestApi.buildTestRequestHandoff(input), /workflowKey/);

  const validInput = baseRequestInput();
  validInput.project.dueDate = "31/08/2026";
  assert.throws(() => requestApi.buildTestRequestHandoff(validInput), /dueDate/);

  const request = requestApi.buildTestRequestHandoff(baseRequestInput());
  const order = orderApi.buildOrderHandoff(request, { orderStatus: "draft", instructions: null, priorArtifactRef: null, priorSha256: null, programIds: { workOrderId: null, crmId: null } });
  assert.throws(() => reportApi.buildExtendedReportHandoff(order, { priorArtifactRef: null, priorSha256: null, results: [{ testId: "thermal", point: "tc", state: "verified", value: 70, unit: "C", equipmentRef: "tl-01" }] }), /results\[0\]/);
  assert.throws(() => reportApi.buildExtendedReportHandoff(order, { priorArtifactRef: null, priorSha256: null, results: [{ testId: "thermal", point: "tc", state: "measured", value: null, unit: "C", equipmentRef: "tl-01" }] }), /value is required/);
});

test("all four surfaces contain no persistence, upload, raw-body, clock, random or wildcard handoff seam", async () => {
  const forbidden = [
    /localStorage/i,
    /sessionStorage/i,
    /indexedDB/i,
    /type=["']file["']/i,
    /FormData\s*\(/,
    /FileReader\s*\(/,
    /data:[^\s"']*;base64/i,
    /postMessage\s*\([^,]+,\s*["']\*["']/,
    /Date\.now\s*\(/,
    /Math\.random\s*\(/,
    /fetch\s*\(/,
    /XMLHttpRequest/,
    /WebSocket/,
    /controlstack\.lab\.(?:test-request\.v2|order\.v1|extended-report\.v1|reference\.optic\.v1)/,
  ];
  for (const file of Object.values(FILES)) {
    const source = await sourceFor(file);
    for (const pattern of forbidden) assert.equal(pattern.test(source), false, `${file} contains ${pattern}`);
  }
});

test("surfaces contain no Program persistence, CRM route, browser sealing or diagnostic fingerprint implementation", async () => {
  for (const file of Object.values(FILES)) {
    const source = await sourceFor(file);
    assert.equal(/authorityRecordSha256\s*:|referenceSha256\s*:|sealedAtUtc\s*:|approval\s*:|fingerprint\s*\(/.test(source), false, `${file} creates authority-like output`);
    assert.equal(/\/api\/|crm\.|database\.|indexeddb|appendFile|writeFile/i.test(source), false, `${file} contains a persistence or route seam`);
  }
});
